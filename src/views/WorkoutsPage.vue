<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Workouts</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="ion-padding">
        <WeekNavigation v-model="currentWeekStart" />

        <WeekDayNavigation v-model="selectedDate" :workouts="workouts" />

        <WorkoutCard :date="selectedDate" :workout="selectedDateWorkout" :exercises="exercises" />
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { useFirebase } from '@/composables/useFirebase';
import {
  Collections,
  type Workout,
  type Exercise,
} from '@/types/firebase.types';
import { useAuth } from '@/composables/useAuth';
import { getStartOfWeek, getEndOfWeek, isSameDay } from '@/helpers/date.helper';
import WeekNavigation from '@/components/WeekNavigation.vue';
import WeekDayNavigation from '@/components/WeekDayNavigation.vue';
import WorkoutCard from '@/components/workout/WorkoutCard.vue';

const { currentUser } = useAuth();
// Initialize Firebase composable for workouts
const {
  documents: workouts,
  subscribe,
} = useFirebase<Workout>(Collections.WORKOUTS);

// Initialize Firebase composable for exercises
const {
  documents: exercises,
  subscribe: subscribeExercises
} = useFirebase<Exercise>(Collections.EXERCISES);

// Week navigation state
const currentWeekStart = ref(getStartOfWeek(new Date()));
const currentWeekEnd = computed(() => getEndOfWeek(currentWeekStart.value));

const selectedDate = ref(new Date());
const selectedDateWorkout = computed(() => workouts.value.find(workout => {
  const workoutDate = workout.date
    ? new Date(workout.date)
    : (workout.createdAt ? new Date(workout.createdAt) : new Date());
  
  return isSameDay(workoutDate, selectedDate.value);
}));

// Update selected date when week changes
watch(currentWeekStart, (newStart: Date) => {
  const today = new Date();
  const endOfWeek = currentWeekEnd.value;
  
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

const setupWorkoutSubscription = () => {
  if (unsubscribe) {
     unsubscribe();
     unsubscribe = null;
  }

  if (currentUser.value) {
      unsubscribe = subscribe(
      {
        where: [
            { field: 'userId', operator: '==', value: currentUser.value.uid },
            { field: 'date', operator: '>=', value: currentWeekStart.value },
            { field: 'date', operator: '<=', value: currentWeekEnd.value }
        ],
        orderBy: {
          field: 'date',
          direction: 'asc'
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
watch([currentUser, currentWeekStart], () => {
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
