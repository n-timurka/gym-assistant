<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonSpinner,
  alertController,
  actionSheetController,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonFooter,
  IonToolbar,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { useAuth } from '@/composables/useAuth';
import {
  Collections,
  type Workout,
  type WorkoutExercise,
  type Exercise,
  type ExerciseSet,
  type Progress,
  WorkoutStatus,
  ExerciseCategory,
} from '@/types/firebase.types';
import { doc } from 'firebase/firestore';
import { db } from '@/firebase.config';
// Components
import WorkoutHeader from '@/components/workout/WorkoutHeader.vue';
import AddExerciseModal from '@/components/workout/AddExerciseModal.vue';
import WorkoutPlannedView from '@/components/workout/WorkoutPlannedView.vue';
import WorkoutOngoingView from '@/components/workout/WorkoutOngoingView.vue';
import WorkoutCompletedView from '@/components/workout/WorkoutCompletedView.vue';
import { useRestTimer } from '@/composables/useRestTimer';

const route = useRoute();
const workoutId = route.params.id as string;
const { currentUser } = useAuth();

// Firebase composables
const { 
  getById: getWorkoutById, 
  update: updateWorkout,
} = useFirebase<Workout>(Collections.WORKOUTS);

const {
  documents: exercises,
  subscribe: subscribeExercises
} = useFirebase<Exercise>(Collections.EXERCISES);

const {
  create: createProgress,
  getAll: getProgressRecords
} = useFirebase<Progress>(Collections.PROGRESS);

const unsubscribeFunctions: Array<() => void> = [];
onUnmounted(() => {
  unsubscribeFunctions.forEach(unsub => unsub());
  unsubscribeFunctions.length = 0;
});

// State
const workout = ref<Workout | null>(null);
const loading = ref(true);
const showAddModal = ref(false);
const swappingExerciseIndex = ref<number | null>(null);

// Timer State
const { startTimer, isRunning: isTimerRunning } = useRestTimer();
const restTimeSeconds = ref(120); // Default 2 minutes
let currentActionSheet: HTMLIonActionSheetElement | null = null;

// Timer Logic
const startRestTimer = async () => {
    startTimer(restTimeSeconds.value);
    
    // Close selection sheet if open
    if (currentActionSheet) {
        await currentActionSheet.dismiss();
        currentActionSheet = null;
    }
};
const showRestTimerSheet = async () => {
  // If timer is already running, show the running sheet
  if (isTimerRunning.value) {
    return;
  }

  const actionSheet = await actionSheetController.create({
    header: 'Rest Timer',
    buttons: [
      {
        text: 'START TIMER (2 min)',
        role: 'selected',
        handler: () => { restTimeSeconds.value = 120; startRestTimer(); }
      },
      {
        text: '30 Seconds',
        handler: () => { restTimeSeconds.value = 30; startRestTimer(); }
      },
      {
        text: '1 Minute',
        handler: () => { restTimeSeconds.value = 60; startRestTimer(); }
      },
      {
        text: '1.5 Minutes',
        handler: () => { restTimeSeconds.value = 90; startRestTimer(); }
      },
      {
        text: '2 Minutes',
        handler: () => { restTimeSeconds.value = 120; startRestTimer(); }
      },
      {
        text: '3 Minutes',
        handler: () => { restTimeSeconds.value = 180; startRestTimer(); }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ]
  });
  
  currentActionSheet = actionSheet;
  await actionSheet.present();
};

// Workout data
const workoutDateDisplay = computed(() => {
  if (!workout.value?.date) return 'Workout';

  const date = new Date(workout.value.date); // Handle timestamp or string
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
});
const workoutStatus = computed(() => workout.value?.status || WorkoutStatus.PLANNED);
const workoutExercises = computed(() => {
  if (!workout.value) return [];

  return workout.value.exercises.map(exercise => ({
    ...exercise,
    exercise: exercises.value.find(e => e.id === exercise.exerciseId)
  }));
});
const workoutProgress = computed(() => {
  if (workoutExercises.value.length === 0) return 0;
  // Calculate based on completed sets vs total sets for finer granularity
  let totalSets = 0;
  let completedSets = 0;
  
  workoutExercises.value.forEach(ex => {
    ex.sets.forEach(set => {
      totalSets++;
      if (set.isCompleted) completedSets++;
    });
  });
  
  return totalSets > 0 ? completedSets / totalSets : 0;
});

// Actions
const loadWorkout = async () => {
  loading.value = true;
  try {
    workout.value = await getWorkoutById(workoutId);
    if (!workout.value) return

    if (workout.value.date && currentUser.value) {
      const d = new Date(workout.value.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d);
      weekStart.setDate(diff);
      weekStart.setHours(0,0,0,0);

      // Calculate week end for workout query
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
    }
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
  
  await updateWorkout(workoutId, { 
    status: WorkoutStatus.ONGOING,
    startTime
  });
};

const hasCompletedSets = (): boolean => {
  if (!workout.value) return false;

  return workout.value.exercises.some(ex => 
    ex.sets.some(set => set.isCompleted)
  );
};

const getMostCommonWeight = (sets: ExerciseSet[]): number => {
  if (!sets || sets.length === 0) return 0;
  
  const weightCounts = new Map<number, number>();
  sets.forEach(set => {
    const weight = set.weight || 0;
    weightCounts.set(weight, (weightCounts.get(weight) || 0) + 1);
  });
  
  let maxCount = 0;
  let mostCommonWeight = 0;
  
  weightCounts.forEach((count, weight) => {
    if (count > maxCount || (count === maxCount && weight > mostCommonWeight)) {
      maxCount = count;
      mostCommonWeight = weight;
    }
  });
  
  return mostCommonWeight;
};

const getExerciseCategory = (id: string) => {
  const ex = exercises.value.find(e => String(e.id) === String(id));
  return ex ? ex.category : undefined;
};

const saveProgressRecords = async () => {
  if (!workout.value || !currentUser.value) return;
  
  for (const workoutExercise of workout.value.exercises) {
    const exerciseCategory = getExerciseCategory(workoutExercise.exerciseId);
    let valueToSave = 0;

    if (exerciseCategory === ExerciseCategory.CARDIO) {
      // For Cardio: Save maximum time (weight field used for time)
      valueToSave = Math.max(...workoutExercise.sets.map(s => s.weight || 0));
      
      // Check previous best
      const previousBest = await getLatestProgressWeight(workoutExercise.exerciseId);
      if (valueToSave <= previousBest) {
        continue; // Don't save if not improved
      }
    } else {
      // For others: Save most common weight
      valueToSave = getMostCommonWeight(workoutExercise.sets);
    }

    const exerciseRef = doc(db, Collections.EXERCISES, workoutExercise.exerciseId);
    
    try {
      await createProgress({
        userId: currentUser.value.uid,
        exerciseId: workoutExercise.exerciseId,
        exerciseRef: exerciseRef,
        date: workout.value.date,
        weight: valueToSave
      });
    } catch (error) {
      console.error(`Failed to save progress for exercise ${workoutExercise.exerciseId}:`, error);
    }
  }
};

const getLatestProgressWeight = async (exerciseId: string): Promise<number> => {
  if (!currentUser.value) return 0;
  
  try {
    const progressRecords = await getProgressRecords({
      where: [
        { field: 'userId', operator: '==', value: currentUser.value.uid },
        { field: 'exerciseId', operator: '==', value: exerciseId }
      ]
    });

    progressRecords.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    if (progressRecords.length > 0) {
      return progressRecords[0].weight;
    }
  } catch (error) {
    console.error(`Failed to get progress for exercise ${exerciseId}:`, error);
  }
  
  return 0;
};

const endTraining = async () => {
  if (!workout.value) return;
  
  const hasCompleted = hasCompletedSets();
  
  const alert = await alertController.create({
    header: 'End Training',
    message: hasCompleted 
      ? 'Are you sure you want to end this workout?' 
      : 'No exercises have been completed. Are you sure you want to end this workout?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'End Workout',
        role: 'confirm',
        handler: async () => {
          const endTime = new Date().toISOString();
          workout.value!.status = WorkoutStatus.COMPLETED;
          workout.value!.endTime = endTime;
          
          await saveProgressRecords();

          await updateWorkout(workoutId, { 
            status: WorkoutStatus.COMPLETED,
            endTime
          });
          localStorage.setItem('CurrentExerciseIndex', '0');
        }
      }
    ]
  });
  
  await alert.present();
};

let saveTimeout: any = null;
const saveWorkoutDebounced = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    if (workout.value) {
      await updateWorkout(workoutId, { exercises: workout.value.exercises });
    }
  }, 1000);
};

const handleReorder = (event: CustomEvent) => {
  if (!workout.value) return;
  
  const itemMove = workout.value.exercises.splice(event.detail.from, 1)[0];
  workout.value.exercises.splice(event.detail.to, 0, itemMove);
  
  event.detail.complete();
  saveWorkoutDebounced();
};

const addSet = (exerciseIndex: number) => {
  if (!workout.value) return;
  
  const previousSet = workout.value.exercises[exerciseIndex].sets[workout.value.exercises[exerciseIndex].sets.length - 1];
  
  workout.value.exercises[exerciseIndex].sets.push({
    weight: previousSet ? previousSet.weight : 0,
    reps: previousSet ? previousSet.reps : 0,
    isCompleted: false
  });
  saveWorkoutDebounced();
};

const removeSet = (exerciseIndex: number, setIndex: number) => {
  if (!workout.value) return;
  workout.value.exercises[exerciseIndex].sets.splice(setIndex, 1);
  saveWorkoutDebounced();
};

const openAddExerciseModal = () => {
  swappingExerciseIndex.value = null;
  showAddModal.value = true;
};

const closeAddModal = () => {
    showAddModal.value = false;
    swappingExerciseIndex.value = null;
}

const handleSwapExercise = (index: number) => {
    swappingExerciseIndex.value = index;
    showAddModal.value = true;
}

const addExercises = (ids: string[]) => {
  ids.forEach(id => addExerciseToWorkout(id));
}

const addExerciseToWorkout = async (exerciseId: string | number) => {
  if (!workout.value) return;
  
  // If not swapping, check for duplicates (unless we want to allow duplicates, but usually not)
  if (swappingExerciseIndex.value === null && isExerciseInWorkout(exerciseId)) {
    return;
  }
  
  const latestWeight = await getLatestProgressWeight(String(exerciseId));
  
  if (!workout.value) return;
  
  const exercise = exercises.value.find(e => String(e.id) === String(exerciseId));
  const isCardio = exercise?.category === ExerciseCategory.CARDIO;

  const setsCount = isCardio ? 1 : 3;
  const initialSets = [];
  
  for(let i=0; i<setsCount; i++) {
    initialSets.push({ weight: latestWeight, reps: 10, isCompleted: false });
  }

  const newExercise: WorkoutExercise = {
    exerciseId: String(exerciseId),
    sets: initialSets,
    order: swappingExerciseIndex.value !== null
      ? workout.value.exercises[swappingExerciseIndex.value].order
      : workout.value.exercises.length
  };
  
  // Add logic
  workout.value.exercises.push(newExercise);
  
  await updateWorkout(workoutId, { exercises: workout.value.exercises });
  showAddModal.value = false;
  swappingExerciseIndex.value = null;
};

const deleteExercise = async (exerciseIndex: number) => {
  if (!workout.value) return;
  
  const alert = await alertController.create({
    header: 'Delete Exercise',
    message: 'Are you sure you want to delete this exercise?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'confirm',
        handler: async () => {
          workout.value!.exercises.splice(exerciseIndex, 1);
          await updateWorkout(workoutId, { exercises: workout.value!.exercises });
        }
      }
    ]
  });
  
  await alert.present();
};

const clearWorkout = async () => {
  if (!workout.value) return;
  
  const alert = await alertController.create({
    header: 'Clear Workout',
    message: 'Are you sure you want to remove all exercises from this workout?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Clear All',
        role: 'confirm',
        handler: async () => {
          workout.value!.exercises = [];
          await updateWorkout(workoutId, { exercises: [] });
        }
      }
    ]
  });
  
  await alert.present();
};

const isExerciseInWorkout = (exerciseId: string | number): boolean => {
  if (!workout.value) return false;

  return workout.value.exercises.some(ex => String(ex.exerciseId) === String(exerciseId));
};

onMounted(() => {
  loadWorkout();
  const unsubExercises = subscribeExercises({
    orderBy: {
      field: 'name',
      direction: 'asc'
    }
  });
  if (unsubExercises) unsubscribeFunctions.push(unsubExercises);
});
</script>

<template>
  <IonPage>
    <WorkoutHeader :date="workoutDateDisplay" />

    <IonContent :fullscreen="true">
      <div v-if="loading" class="ion-text-center ion-padding">
        <IonSpinner />
      </div>

      <div v-else-if="workout" class="ion-padding-bottom h-full">
        <!-- Planned View -->
        <WorkoutPlannedView
          v-if="workoutStatus === WorkoutStatus.PLANNED"
          :exercises="workoutExercises"
          :all-exercises="exercises"
          @delete-exercise="deleteExercise"
          @add-set="addSet"
          @remove-set="removeSet"
          @update-set="saveWorkoutDebounced"
          @reorder="handleReorder"
          @clear-workout="clearWorkout"
          @open-add-modal="openAddExerciseModal"
          @add-exercises="addExercises"
        />

        <!-- Ongoing View -->
        <WorkoutOngoingView
          v-else-if="workoutStatus === WorkoutStatus.ONGOING"
          :exercises="workoutExercises"
          :workout-progress="workoutProgress"
          @add-set="addSet"
          @remove-set="removeSet"
          @update-set="saveWorkoutDebounced"
          @timer-requested="showRestTimerSheet"
          @stop-training="endTraining"
          @swap-exercise="handleSwapExercise"
          @open-add-modal="openAddExerciseModal"
          @delete-exercise="deleteExercise"
        />

        <!-- Completed View -->
        <WorkoutCompletedView
          v-else-if="workoutStatus === WorkoutStatus.COMPLETED"
          :exercises="workoutExercises"
          :workout="workout"
        />
      </div>
      <div v-else>No workout</div>

      <add-exercise-modal
        :is-open="showAddModal"
        :all-exercises="exercises"
        :is-exercise-in-workout="swappingExerciseIndex === null ? isExerciseInWorkout : () => false"
        :current-exercise-id="swappingExerciseIndex !== null && workout?.exercises[swappingExerciseIndex] ? workout.exercises[swappingExerciseIndex].exerciseId : null"
        @close="closeAddModal"
        @add-exercise="addExerciseToWorkout"
      />

      <!-- FAB for Planned View -->
      <IonFab 
        v-if="workoutStatus === WorkoutStatus.PLANNED" 
        vertical="bottom" 
        horizontal="end" 
        slot="fixed" 
        class="ion-margin"
      >
        <IonFabButton @click="openAddExerciseModal">
          <IonIcon :icon="addOutline" />
        </IonFabButton>
      </IonFab>
    </IonContent>

    <IonFooter>
      <IonToolbar>
        <IonButton
          v-if="workoutStatus === WorkoutStatus.ONGOING"
          expand="block" color="danger"
          @click="endTraining">
          Stop Training
        </IonButton>
        <IonButton
          v-else-if="workoutStatus === WorkoutStatus.PLANNED"
          expand="block" color="success"
          @click="startTraining">
          Start Training
        </IonButton>
      </IonToolbar>
    </IonFooter>
  </IonPage>
</template>
