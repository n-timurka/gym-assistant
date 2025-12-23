<template>
  <div class="workouts-list-container">
    <!-- Week Days View -->
    <div class="week-days-container">
      <div 
        v-for="day in currentWeekDays" 
        :key="day.date.toISOString()"
        class="day-card"
        :class="{ 'active': isSameDay(day.date, selectedDate) }"
        @click="$emit('update:selectedDate', day.date)"
      >
        <span class="day-name">{{ day.dayName }}</span>
        <span class="day-number">{{ day.dayNumber }}</span>
        <div class="workout-indicator" v-if="hasWorkout(day.date)"></div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="ion-text-center ion-padding">
      <ion-spinner></ion-spinner>
    </div>

    <!-- Workout Details (displayed inline below week days) -->
    <div v-else class="workout-details">
      <!-- No workout state -->
      <ion-card v-if="!selectedDateWorkout">
        <ion-card-content class="empty-state">
          <p>No workout for this day.</p>
          <ion-button fill="clear" @click="$emit('addWorkout')">
            Create a workout
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Workout exists -->
      <div v-else>
        <ion-card class="workout-card">
          <ion-card-header>
            <ion-card-title>
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
            <div v-if="selectedDateWorkout.exercises && selectedDateWorkout.exercises.length > 0" class="exercises-list">
              <h3>Exercises</h3>
              <ion-list>
                <ion-item v-for="exercise in selectedDateWorkout.exercises" :key="exercise.id">
                  {{ exercise.name }}
                  <ion-badge slot="end" color="medium">
                    {{ exercise.category }}
                  </ion-badge>
                </ion-item>
              </ion-list>
            </div>
            
            <!-- Delete Button -->
            <div class="delete-button-container">
              <ion-button 
                expand="block"
                color="danger" 
                fill="clear" 
                @click="$emit('deleteWorkout', selectedDateWorkout.id)"
              >
                <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                Delete Workout
              </ion-button>
            </div>
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
  fitnessOutline
} from 'ionicons/icons';
import type { Workout, Exercise } from '@/types/firebase.types';
import { WorkoutStatus } from '@/types/firebase.types';

const props = defineProps<{
  workouts: Workout[];
  exercises: Exercise[]; // Keep for backward compatibility but use allExercises internally
  loading: boolean;
  selectedDate: Date;
  currentWeekDays: { date: Date; dayName: string; dayNumber: number }[];
}>();

const emit = defineEmits(['update:selectedDate', 'addWorkout', 'deleteWorkout', 'fillFromWeekPlan']);

// Helper to check if two dates are the same day
function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

// Check if a specific date has any workouts
const hasWorkout = (date: Date) => {
  return props.workouts.some(w => {
    const wDate = w.date ? new Date(w.date) : (w.createdAt ? new Date(w.createdAt) : new Date());
    return isSameDay(wDate, date);
  });
};

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
.week-days-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem 0 0;
}

.day-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 60px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-card.active {
  background-color: var(--ion-color-primary);
  color: white;
  box-shadow: 0 4px 10px rgba(var(--ion-color-primary-rgb), 0.3);
}

.day-name {
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.8;
}

.day-number {
  font-size: 1rem;
  font-weight: 700;
}

.workout-indicator {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--ion-color-primary);
}

.day-card.active .workout-indicator {
  background-color: white;
}

.workout-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--ion-color-medium);
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
