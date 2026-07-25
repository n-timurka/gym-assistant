import { computed, ref, toValue, type MaybeRef } from 'vue';
import { useFirebase } from '@/composables/useFirebase';
import { Collections, type Exercise } from '@/types/firebase.types';

const { documents: exercises, error, subscribe } = useFirebase<Exercise>(Collections.EXERCISES);

const loading = ref(false);
let unsubscribe: (() => void) | null = null;

/**
 * Starts the shared exercises listener once. The listener intentionally stays
 * alive for the application lifetime so every consumer sees the same data.
 */
const ensureSubscribed = () => {
  if (unsubscribe) return;

  loading.value = true;
  unsubscribe = subscribe(
    {
      orderBy: {
        field: 'name',
        direction: 'asc',
      },
    },
    () => {
      loading.value = false;
    },
  );
};

/**
 * Shared exercise data. Calling this from any component ensures the single
 * realtime subscription exists, then exposes the common exercise list.
 */
export const useExerciseStore = () => {
  ensureSubscribed();

  const getExercise = (id: MaybeRef<string | number | null | undefined>) =>
    computed(() => {
      const exerciseId = toValue(id);
      if (exerciseId === null || exerciseId === undefined) return null;

      return exercises.value.find(
        (exercise) => String(exercise.id) === String(exerciseId),
      ) ?? null;
    });

  const findExercise = (id: string | number) => {
    return exercises.value.find(
      (exercise) => String(exercise.id) === String(id),
    );
  };

  return {
    exercises,
    loading,
    error,
    ensureSubscribed,
    getExercise,
    findExercise,
  };
};
