<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workouts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- Week Navigation -->
        <div class="week-navigation-header">
          <ion-button fill="clear" @click="prevWeek">
            <ion-icon slot="icon-only" :icon="chevronBackOutline"></ion-icon>
          </ion-button>
          <h2>{{ weekDisplay }}</h2>
          <ion-button fill="clear" @click="nextWeek">
            <ion-icon slot="icon-only" :icon="chevronForwardOutline"></ion-icon>
          </ion-button>
        </div>

        <ion-segment v-model="selectedSegment">
          <ion-segment-button value="workouts">
            <ion-label>Workouts</ion-label>
          </ion-segment-button>
          <ion-segment-button value="plan">
            <ion-label>Week Plan</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Segments Content -->
        <div v-if="selectedSegment === 'workouts'">
          <WorkoutsList 
            :workouts="workouts" 
            :exercises="exercises"
            :loading="loading"
            v-model:selectedDate="selectedDate"
            :currentWeekDays="currentWeekDays"
            @addWorkout="addWorkout"
            @deleteWorkout="deleteWorkout"
            @startWorkout="startWorkout"
            @fillFromWeekPlan="fillWorkoutFromWeekPlan"
          />
        </div>

        <div v-if="selectedSegment === 'plan'">
          <WeekPlanComponent :weekStart="currentWeekStart" />
        </div>

        <!-- Real-time Status -->
        <div class="status-footer" v-if="isRealtime">
          <ion-icon :icon="cloudDoneOutline" color="success"></ion-icon>
          <span class="status-text">Synced</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/vue';
import { 
  cloudDoneOutline,
  chevronBackOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { Collections, type Workout, type Exercise, type WeekPlan, type WorkoutExercise, type Progress, WorkoutStatus, ExerciseCategory } from '@/types/firebase.types';
import WorkoutsList from '@/components/WorkoutsList.vue';
import WeekPlanComponent from '@/components/WeekPlan.vue';
import { useAuth } from '@/composables/useAuth';

const { currentUser } = useAuth();
// Initialize Firebase composable for workouts
const {
  documents: workouts,
  loading,
  create,
  remove,
  update,
  subscribe
} = useFirebase<Workout>(Collections.WORKOUTS);

// Initialize Firebase composable for exercises
const {
  documents: exercises,
  subscribe: subscribeExercises
} = useFirebase<Exercise>(Collections.EXERCISES);

// Initialize Firebase composable for week plans
const {
  documents: weekPlans,
  subscribe: subscribeWeekPlans
} = useFirebase<WeekPlan>(Collections.WEEK_PLANS);

// Initialize Firebase composable for progress
const {
  getAll: getProgressRecords
} = useFirebase<Progress>(Collections.PROGRESS);

const selectedSegment = ref('workouts');

// Week navigation state
const currentWeekStart = ref(getStartOfWeek(new Date()));
const selectedDate = ref(new Date());

// Helper to get start of week (Monday)
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper to get end of week (Sunday)
function getEndOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Generate days for the current week view
const currentWeekDays = computed(() => {
  const days = [];
  const start = new Date(currentWeekStart.value);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      dayNumber: d.getDate()
    });
  }
  return days;
});

const weekDisplay = computed(() => {
  const start = currentWeekStart.value;
  const end = getEndOfWeek(start);
  
  // Format: "Dec 2 - Dec 8, 2025" or "Nov 30 - Dec 6, 2025"
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const year = end.getFullYear();
  
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
  }
  // Different months
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
});

const prevWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() - 7);
  currentWeekStart.value = newDate;
};

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() + 7);
  currentWeekStart.value = newDate;
};

// Update selected date when week changes
watch(currentWeekStart, (newStart) => {
  const today = new Date();
  const endOfWeek = getEndOfWeek(newStart);
  
  // Reset time for accurate comparison
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startTime = new Date(newStart.getFullYear(), newStart.getMonth(), newStart.getDate()).getTime();
  const endTime = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate()).getTime();
  
  // If today is in the new week, select today
  if (todayTime >= startTime && todayTime <= endTime) {
    selectedDate.value = today;
  } else {
    // Otherwise select the start of the week (Monday)
    selectedDate.value = new Date(newStart);
  }
});

// Real-time subscription status
const isRealtime = ref(false);
let unsubscribe: (() => void) | null = null;

/**
 * Add a new workout to Firestore
 */
const addWorkout = async () => {
  if (!currentUser.value) {
    alert('You must be logged in to create a workout');
    return;
  }

  const workoutData: Omit<Workout, 'id'> = {
    userId: currentUser.value.uid,
    date: selectedDate.value,
    exercises: [],
    status: WorkoutStatus.PLANNED,
  };

  await create(workoutData);
};

/**
 * Delete a workout
 */
const deleteWorkout = async (id: string) => {
  if (confirm('Are you sure you want to delete this workout?')) {
    await remove(id);
  }
};

/**
 * Start a workout by setting the startTime
 */
const startWorkout = async (id: string) => {
  await update(id, {
    startTime: new Date().toISOString()
  });
};

/**
 * Fill workout with exercises from the week plan
 * Gets one exercise per category from the week plan and creates 3 sets with 10 reps
 * Uses latest progress weight for each exercise
 */
const fillWorkoutFromWeekPlan = async (workoutId: string) => {
  // Get the current week plan
  const weekStartStr = currentWeekStart.value.toISOString();
  const weekPlan = weekPlans.value.find(p => p.weekStart === weekStartStr);
  
  if (!weekPlan || !weekPlan.exercises.length) {
    alert('No week plan found for this week. Please create a week plan first.');
    return;
  }
  
  // Get exercise details from Firebase (not static data)
  const plannedExercises = weekPlan.exercises
    .map(id => exercises.value.find(e => String(e.id) === String(id)))
    .filter(e => !!e) as Exercise[];
  
  const { exercisesPerWorkout } = weekPlan;
  
  if (!exercisesPerWorkout) {
    alert('This week plan does not have "Exercises per Workout" setting. Please re-apply a template or set it manually.');
    return;
  }

  // Get all workouts for this week to determine order
  const start = new Date(currentWeekStart.value);
  const end = getEndOfWeek(start);
  
  const weeklyWorkouts = workouts.value.filter(w => {
    if (!w.date) return false;
    const wDate = new Date(w.date);
    return wDate >= start && wDate <= end;
  });

  // Sort by date/creation to find index
  // Assuming 'date' is the planned date. If multiple on same day, maybe rely on createdAt if available, or just ID.
  // For now, sorting by date.
  weeklyWorkouts.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  const workoutIndex = weeklyWorkouts.findIndex(w => w.id === workoutId);
  
  if (workoutIndex === -1) {
    console.error('Current workout not found in weekly list');
    return;
  }

  const startIndex = workoutIndex * exercisesPerWorkout;
  const endIndex = startIndex + exercisesPerWorkout;

  const exerciseIdsToAdd = weekPlan.exercises.slice(startIndex, endIndex);

  if (exerciseIdsToAdd.length === 0) {
    alert(`No exercises found for this workout (Index: ${workoutIndex + 1}). Check your week plan.`);
    return;
  }

  // Resolve exercises
  const resolvedExercises = exerciseIdsToAdd
    .map(id => exercises.value.find(e => String(e.id) === String(id)))
    .filter(e => !!e) as Exercise[];

  // Get latest progress weight for each exercise
  const workoutExercises: WorkoutExercise[] = [];
  
  for (const [index, ex] of resolvedExercises.entries()) {
    let weight = 0;
    
    // Query latest progress for this exercise and current user
    if (currentUser.value) {
      try {
        const progressRecords = await getProgressRecords({
          where: [
            { field: 'userId', operator: '==', value: currentUser.value.uid },
            { field: 'exerciseId', operator: '==', value: String(ex.id) }
          ]
        });
        
        progressRecords.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
          const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
          return dateB - dateA;
        });
        
        if (progressRecords.length > 0) {
          weight = progressRecords[0].weight;
        }
      } catch (error) {
        console.error(`Failed to get progress for exercise ${ex.id}:`, error);
      }
    }
    
    workoutExercises.push({
      date: selectedDate.value.toISOString(),
      exerciseId: String(ex.id),
      sets: [
        { weight, reps: 10, isCompleted: false },
        { weight, reps: 10, isCompleted: false },
        { weight, reps: 10, isCompleted: false },
      ],
      order: index
    });
  }
  
  // Update the workout
  await update(workoutId, {
    exercises: workoutExercises
  });
};

const setupWorkoutSubscription = () => {
  if (unsubscribe) {
     unsubscribe();
     unsubscribe = null;
  }

  if (currentUser.value) {
      unsubscribe = subscribe(
      {
        where: [
            { field: 'userId', operator: '==', value: currentUser.value.uid }
        ],
        orderBy: {
          field: 'date',
          direction: 'desc'
        }
      },
      (docs) => {
        console.log('Real-time update received:', docs.length, 'workouts');
        isRealtime.value = true;
      }
    );
  } else {
    // Clear workouts if no user
    workouts.value = []; 
  }
}

// Watch for auth changes
watch(currentUser, () => {
    setupWorkoutSubscription();
});

/**
 * Setup real-time subscription on component mount
 */
onMounted(() => {
  // Subscribe to real-time updates for workouts
  setupWorkoutSubscription();
  
  // Subscribe to exercises
  subscribeExercises();
  
  // Subscribe to week plans
  subscribeWeekPlans();
});

/**
 * Cleanup subscription on component unmount
 */
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
.week-navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.week-navigation-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--ion-color-dark);
}

.status-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  opacity: 0.6;
}

.status-text {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}
</style>
