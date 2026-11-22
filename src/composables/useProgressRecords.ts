import { doc } from 'firebase/firestore';
import { db } from '@/firebase.config';
import { useFirebase } from '@/composables/useFirebase';
import { useAuth } from '@/composables/useAuth';
import {
  Collections,
  ExerciseCategory,
  type Exercise,
  type Progress,
  type Workout,
} from '@/types/firebase.types';
import { getMostCommonWeight } from '@/helpers/workout.helper';

export function useProgressRecords() {
  const { currentUser } = useAuth();
  const { create, getAll } = useFirebase<Progress>(Collections.PROGRESS);

  const getLatestWeight = async (exerciseId: string): Promise<number> => {
    if (!currentUser.value) return 0;

    try {
      const records = await getAll({
        where: [
          { field: 'userId', operator: '==', value: currentUser.value.uid },
          { field: 'exerciseId', operator: '==', value: exerciseId },
        ],
      });

      const time = (d: Date | string) => (d instanceof Date ? d : new Date(d)).getTime();
      records.sort((a, b) => time(b.date) - time(a.date));

      return records[0]?.weight ?? 0;
    } catch (error) {
      console.error(`Failed to get progress for exercise ${exerciseId}:`, error);
      return 0;
    }
  };

  const saveWorkoutProgress = async (workout: Workout, exercises: readonly Exercise[]) => {
    const user = currentUser.value;
    if (!user) return;

    for (const { exerciseId, sets } of workout.exercises) {
      const category = exercises.find(e => String(e.id) === String(exerciseId))?.category;
      let value: number;

      if (category === ExerciseCategory.CARDIO) {
        // Cardio stores time in the weight field; only record improvements.
        value = Math.max(0, ...sets.map(s => s.weight || 0));
        if (value <= (await getLatestWeight(exerciseId))) continue;
      } else {
        value = getMostCommonWeight(sets);
      }

      try {
        await create({
          userId: user.uid,
          exerciseId,
          exerciseRef: doc(db, Collections.EXERCISES, exerciseId),
          date: workout.date,
          weight: value,
        });
      } catch (error) {
        console.error(`Failed to save progress for exercise ${exerciseId}:`, error);
      }
    }
  };

  return { getLatestWeight, saveWorkoutProgress };
}
