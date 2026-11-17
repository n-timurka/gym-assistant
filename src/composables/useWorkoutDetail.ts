import { computed, inject, onMounted, onUnmounted, provide, ref, type InjectionKey } from 'vue';
import { useFirebase } from '@/composables/useFirebase';
import {
  Collections,
  WorkoutStatus,
  type Exercise,
  type Workout,
} from '@/types/firebase.types';
import { calculateDuration, formatDate } from '@/helpers/date.helper';
import { calculateWorkoutProgress, hasCompletedSets } from '@/helpers/workout.helper';
import {
  confirmClearWorkout,
  confirmDeleteExercise,
  confirmEndTraining,
  pickRestTime,
} from '@/services/workoutDialogs';
import { useExercisePicker } from '@/composables/useExercisePicker';
import { useProgressRecords } from '@/composables/useProgressRecords';
import { useRestTimer } from '@/composables/useRestTimer';

const SAVE_DEBOUNCE_MS = 1000;

function createWorkoutDetail(workoutId: string) {
  const { getById, update } = useFirebase<Workout>(Collections.WORKOUTS);
  const { documents: exercises, subscribe: subscribeExercises } =
    useFirebase<Exercise>(Collections.EXERCISES);
  const progress = useProgressRecords();
  const { startTimer, isRunning: isTimerRunning } = useRestTimer();

  const workout = ref<Workout | null>(null);
  const loading = ref(true);

  const workoutExercises = computed(() =>
    (workout.value?.exercises ?? []).map(we => ({
      ...we,
      exercise: exercises.value.find(e => e.id === we.exerciseId),
    }))
  );
  const workoutDateDisplay = computed(() => workout.value?.date ? formatDate(workout.value?.date) : 'Workout');
  const workoutStatus = computed(() => workout.value?.status || WorkoutStatus.PLANNED);
  const workoutProgress = computed(() => calculateWorkoutProgress(workoutExercises.value));
  const workoutDuration = computed(() => {
    if (!workout.value?.startTime || !workout.value?.endTime) return

    return calculateDuration(workout.value.startTime, workout.value.endTime);
  });
  const workoutSets = computed(() => workout.value?.exercises.reduce(
    (value, exercise) => value + exercise.sets.filter(s => s.isCompleted).length,
    0,
  ) || 0);

  const loadWorkout = async () => {
    loading.value = true;
    try {
      workout.value = await getById(workoutId);
    } catch (e) {
      console.error('Error loading workout', e);
    } finally {
      loading.value = false;
    }
  };
  const startTraining = async () => {
    if (!workout.value) return;
    const startTime = new Date().toISOString();
    workout.value.status = WorkoutStatus.ONGOING;
    workout.value.startTime = startTime;
    await update(workoutId, { status: WorkoutStatus.ONGOING, startTime });
  };

  const endTraining = async () => {
    const w = workout.value;
    if (!w || !(await confirmEndTraining(hasCompletedSets(w.exercises)))) return;

    const endTime = new Date().toISOString();
    w.status = WorkoutStatus.COMPLETED;
    w.endTime = endTime;

    await progress.saveWorkoutProgress(w, exercises.value);
    await update(workoutId, { status: WorkoutStatus.COMPLETED, endTime });
    localStorage.setItem('CurrentExerciseIndex', '0');
  };

  const persistExercises = async () => {
    if (workout.value) await update(workoutId, { exercises: workout.value.exercises });
  };
  let saveTimeout: ReturnType<typeof setTimeout> | undefined;
  const saveWorkoutDebounced = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveTimeout = undefined;
      persistExercises();
    }, SAVE_DEBOUNCE_MS);
  };

  // ---- Exercise picker (add / swap modal) ----
  const picker = useExercisePicker({
    workout,
    exercises,
    getLatestWeight: progress.getLatestWeight,
    persist: persistExercises,
  });

  const clearWorkout = async () => {
    if (!workout.value || !(await confirmClearWorkout())) return;
    workout.value.exercises = [];
    await persistExercises();
  };
  const deleteExercise = async (exerciseIndex: number) => {
    if (!workout.value || !(await confirmDeleteExercise())) return;
    workout.value.exercises.splice(exerciseIndex, 1);
    await persistExercises();
  };
  const reorderExercises = (event: CustomEvent) => {
    if (!workout.value) return;

    const { from, to, complete } = event.detail;
    const [moved] = workout.value.exercises.splice(from, 1);
    workout.value.exercises.splice(to, 0, moved);
    complete();
    saveWorkoutDebounced();
  };

  const addSet = (exerciseIndex: number) => {
    const sets = workout.value?.exercises[exerciseIndex]?.sets;
    if (!sets) return;
    const last = sets[sets.length - 1];
    sets.push({ weight: last?.weight ?? 0, reps: last?.reps ?? 0, isCompleted: false });
    saveWorkoutDebounced();
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    workout.value?.exercises[exerciseIndex]?.sets.splice(setIndex, 1);
    saveWorkoutDebounced();
  };

  // ---- Rest timer ----
  const requestRestTimer = async () => {
    if (isTimerRunning.value) return;
    const seconds = await pickRestTime();
    if (seconds) startTimer(seconds);
  };

  let unsubscribeExercises: (() => void) | undefined;
  onMounted(async () => {
    await loadWorkout();
    if (!workout.value) return;
    unsubscribeExercises = subscribeExercises({ orderBy: { field: 'name', direction: 'asc' } }) || undefined;
  });
  onUnmounted(() => {
    unsubscribeExercises?.();
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      persistExercises();
    }
  });

  return {
     workout,
     exercises,
     workoutDuration,
     workoutSets,
     loading,

     workoutDateDisplay,
     workoutStatus,
     workoutExercises,
     workoutProgress,

     startTraining,
     endTraining,
     reorderExercises,
     saveWorkoutDebounced,
     clearWorkout,
     deleteExercise,
     addSet,
     removeSet,

     requestRestTimer,

     isPickerOpen: picker.isOpen,
     isSwapping: picker.isSwapping,
     openAddModal: picker.openAddModal,
     openSwapModal: picker.openSwapModal,
     closePicker: picker.close,
     isExerciseInWorkout: picker.isExerciseInWorkout,
     addExercise: picker.addExercise,
     addExercises: picker.addExercises,

  };
}

export type WorkoutDetailContext = ReturnType<typeof createWorkoutDetail>;
const WORKOUT_DETAIL_KEY: InjectionKey<WorkoutDetailContext> = Symbol('WorkoutDetail');

/** Call once, in the page component. */
export function provideWorkoutDetail(workoutId: string): WorkoutDetailContext {
  const ctx = createWorkoutDetail(workoutId);
  provide(WORKOUT_DETAIL_KEY, ctx);

  return ctx;
}

export function useWorkoutDetail(): WorkoutDetailContext {
  const ctx = inject(WORKOUT_DETAIL_KEY);
  if (!ctx) throw new Error('useWorkoutDetail() must be used under a component that called provideWorkoutDetail()');

  return ctx;
}