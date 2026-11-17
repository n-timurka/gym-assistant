import { computed, ref, type Ref } from 'vue';
import {
  ExerciseCategory,
  type Exercise,
  type Workout,
  type WorkoutExercise,
} from '@/types/firebase.types';
import { createInitialSets } from '@/helpers/workout.helper';

interface Deps {
  workout: Ref<Workout | null>;
  exercises: Ref<readonly Exercise[]>;
  getLatestWeight: (exerciseId: string) => Promise<number>;
  persist: () => Promise<unknown>;
}

/** State and logic of the "add / swap exercise" modal. */
export function useExercisePicker({ workout, exercises, getLatestWeight, persist }: Deps) {
  const isOpen = ref(false);
  const isSwapping = ref(false);
  /** Insert position (add) or the exercise being replaced (swap). null = append. */
  const targetIndex = ref<number | null>(null);

  const isExerciseInWorkout = (exerciseId: string | number): boolean =>
    !!workout.value?.exercises.some(ex => String(ex.exerciseId) === String(exerciseId));

  const open = (index: number | null = null, swapping = false) => {
    targetIndex.value = index;
    isSwapping.value = swapping;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    isSwapping.value = false;
    targetIndex.value = null;
  };

  const openAddModal = (index: number | null = null) =>
    open(typeof index === 'number' ? index : null);
  const openSwapModal = (index: number) => open(index, true);

  const currentExerciseId = computed(() =>
    isSwapping.value && targetIndex.value !== null
      ? workout.value?.exercises[targetIndex.value]?.exerciseId ?? null
      : null
  );

  const addExercise = async (exerciseId: string | number, index = targetIndex.value, swapping = isSwapping.value) => {
    const id = String(exerciseId);
    if (!workout.value || isExerciseInWorkout(id)) return;

    const weight = await getLatestWeight(id);
    const list = workout.value?.exercises;
    if (!list) return;

    const isCardio = exercises.value.find(e => String(e.id) === id)?.category === ExerciseCategory.CARDIO;

    const newExercise: WorkoutExercise = {
      exerciseId: id,
      sets: createInitialSets(weight, isCardio),
      order: index !== null ? list[index]?.order ?? list.length : list.length,
    };

    if (swapping && index !== null) list.splice(index, 1, newExercise);
    else list.splice(index ?? list.length, 0, newExercise);

    await persist();
    close();
  };

  /** Sequential on purpose, so the order and duplicate checks stay deterministic. */
  const addExercises = async (ids: string[]) => {
    for (const id of ids) await addExercise(id);
  };

  return {
    isOpen,
    isSwapping,
    currentExerciseId,
    isExerciseInWorkout: (id: string | number) => (isSwapping.value ? false : isExerciseInWorkout(id)),
    openAddModal,
    openSwapModal,
    close,
    addExercise,
    addExercises,
  };
}
