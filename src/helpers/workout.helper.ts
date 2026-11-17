import type { ExerciseSet } from '@/types/firebase.types';

type WithSets = { sets: ExerciseSet[] };

export const createInitialSets = (weight: number, isCardio: boolean): ExerciseSet[] =>
  Array.from({ length: isCardio ? 1 : 3 }, () => ({
    weight,
    reps: isCardio ? 0 : 10,
    isCompleted: false,
  }));

/** Most frequent weight; ties are resolved in favour of the heavier weight. */
export const getMostCommonWeight = (sets: ExerciseSet[]): number => {
  if (!sets?.length) return 0;

  const counts = new Map<number, number>();
  sets.forEach(s => {
    const weight = s.weight || 0;
    counts.set(weight, (counts.get(weight) || 0) + 1);
  });

  let maxCount = 0;
  let result = 0;
  counts.forEach((count, weight) => {
    if (count > maxCount || (count === maxCount && weight > result)) {
      maxCount = count;
      result = weight;
    }
  });
  return result;
};

export const calculateWorkoutProgress = (exercises: WithSets[]): number => {
  const sets = exercises.flatMap(ex => ex.sets);
  if (sets.length === 0) return 0;
  return sets.filter(s => s.isCompleted).length / sets.length;
};

export const hasCompletedSets = (exercises: WithSets[]): boolean =>
  exercises.some(ex => ex.sets.some(s => s.isCompleted));
