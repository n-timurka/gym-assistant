<template>
  <div class="">
    <!-- Loading Spinner -->
    <div v-if="loading" class="ion-text-center ion-padding">
      <IonSpinner />
    </div>

    <!-- Workout Details (displayed inline below week days) -->
    <div v-else class="workout-details">
      <!-- No workout state -->
      <div class="empty-state" v-if="!selectedDateWorkout">
        <IonIcon :icon="addOutline" />
        <h3>No Workout</h3>
        <p>Nothing planned for {{ formatDate(selectedDate) }}</p>
        <IonButton @click="$emit('addWorkout')">
          Create a workout
        </IonButton>
      </div>

      <!-- Workout exists -->
      <div v-else>
        <ion-card class="workout-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">
              {{ selectedDateWorkout.date }}
            </ion-card-title>
            <div class="workout-header">
              <ion-badge :color="selectedDateWorkout.statusColor">
                {{ selectedDateWorkout.statusText }}
              </ion-badge>
              <ion-card-subtitle v-if="selectedDateWorkout.duration !== null">
                Duration: {{ selectedDateWorkout.duration }} minutes
              </ion-card-subtitle>
            </div>
          </ion-card-header>
          
          <ion-card-content>
            <!-- Action Buttons -->
            <div class="action-buttons">
              <ion-button 
                v-if="!selectedDateWorkout.exercises || selectedDateWorkout.exercises.length === 0"
                expand="block" 
                fill="outline"
                @click="$emit('fillFromWeekPlan', selectedDateWorkout.id)"
              >
                <ion-icon slot="start" :icon="fitnessOutline"></ion-icon>
                Fill from Week Plan
              </ion-button>
              
              <ion-button 
                expand="block"
                fill="outline"
                :router-link="'/workouts/' + selectedDateWorkout.id"
              >
                View Details
              </ion-button>
            </div>

            <!-- Exercises List -->
            <ion-list v-if="selectedDateWorkout.exercises && selectedDateWorkout.exercises.length > 0">
              <ion-item v-for="exercise in selectedDateWorkout.exercises" :key="exercise.id">
                {{ exercise.name }}
                <ion-badge slot="end" color="medium">
                  {{ exercise.category }}
                </ion-badge>
              </ion-item>
            </ion-list>
            
            <ion-button 
              expand="block"
              color="danger" 
              fill="clear" 
              @click="$emit('deleteWorkout', selectedDateWorkout.id)"
            >
              <ion-icon slot="start" :icon="trashOutline"></ion-icon>
              Delete Workout
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonBadge,
  IonList,
  IonItem,
} from '@ionic/vue';
import { 
  trashOutline,
  fitnessOutline,
  addOutline,
} from 'ionicons/icons';
import type { Workout, Exercise } from '@/types/firebase.types';
import { WorkoutStatus } from '@/types/firebase.types';
import { isSameDay } from '@/helpers/date.helper';

const props = defineProps<{
  workouts: Workout[];
  exercises: Exercise[]; // Keep for backward compatibility but use allExercises internally
  loading: boolean;
  selectedDate: Date;
}>();

defineEmits(['update:selectedDate', 'addWorkout', 'deleteWorkout', 'fillFromWeekPlan']);

// Filtered workouts for the selected date
const selectedDateWorkout = computed(() => {
  const workout = props.workouts.find(workout => {
    const workoutDate = workout.date ? new Date(workout.date) : (workout.createdAt ? new Date(workout.createdAt) : new Date());
    return isSameDay(workoutDate, props.selectedDate);
  });

  if (!workout) return null;

  return {
    ...workout,
    exercises: workout.exercises
      .map(exercise => props.exercises.find(e => e.id === exercise.exerciseId))
      .filter(e => e !== undefined),
    date: formatDate(workout.date),
    duration: workout.startTime && workout.endTime
      ? calculateDuration(workout.startTime, workout.endTime)
      : null,
    statusText: getStatusText(workout),
    statusColor: getStatusColor(workout),
  };
});

/**
 * Calculate duration in minutes between start and end time
 */
const calculateDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  return Math.round(durationMs / 60000); // Convert to minutes
};

/**
 * Format date for display
 */
const formatDate = (date: Date | string) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get status text for workout
 */
const getStatusText = (workout: Workout) => {
  if (workout.status) {
    return workout.status.charAt(0).toUpperCase() + workout.status.slice(1);
  }
  return 'Planned';
};

/**
 * Get status color for workout
 */
const getStatusColor = (workout: Workout) => {
  if (workout.status) {
    if (workout.status === WorkoutStatus.COMPLETED) return 'success';
    if (workout.status === WorkoutStatus.ONGOING) return 'warning';
    return 'medium';
  }
  return 'medium';
};
</script>

<style scoped>
.workout-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex; 
  padding-top: 4rem;
  padding-bottom: 4rem; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  text-align: center;

  ion-icon {
    width: 1.5rem;
    height: 1.5rem;
    background-color: var(--ion-color-secondary);
    color: var(--ion-color-muted-secondary);
    border-radius: 50%;
    padding: 1rem;
  }

  ion-button {
    --border-radius: 0.75rem;
    --padding-start: 1.5rem;
    --padding-end: 1.5rem;
    --padding-top: 0.625rem;
    --padding-bottom: 0.625rem;
    --transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.875rem;
    line-height: 1.25rem; 
    font-weight: 700; 
  }
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-buttons ion-button[size="small"] {
  margin-top: 0.5rem;
}

.exercises-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ion-color-light);
}

.exercises-list h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.exercise-names {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-names li {
  padding: 0.5rem 0;
  color: var(--ion-color-dark);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.exercise-names li:last-child {
  border-bottom: none;
}

.delete-button-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ion-color-light);
}
</style>
