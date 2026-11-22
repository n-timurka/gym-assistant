<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { useFirebase } from '@/composables/useFirebase';
import { calculateDuration, formatDate } from '@/helpers/date.helper';
import type { Workout} from '@/types/firebase.types';
import { Collections, WorkoutStatus } from '@/types/firebase.types';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonList,
  IonSpinner,
} from '@ionic/vue';
import { addOutline, trashOutline } from 'ionicons/icons';
import WorkoutStatusLabel from '@/components/WorkoutStatusLabel.vue';
import { computed } from 'vue';
import ExerciseCategoryLabel from '@/components/ExerciseCategoryLabel.vue';
import { useExerciseStore } from '@/stores/exerciseStore';

const { date, workout } = defineProps<{
  date: Date,
  workout?: Workout,
}>();

const { currentUser } = useAuth();
const { loading, create, remove } = useFirebase<Workout>(Collections.WORKOUTS);
const { exercises } = useExerciseStore();

const workoutDuration = computed(() => {
  if (!workout) return
  
  return workout.startTime && workout.endTime
    ? calculateDuration(workout.startTime, workout.endTime)
    : null
});

const workoutExercises = computed(() => {
  if (!workout) return;

  return workout.exercises
    .map(e => exercises.value.find(ex => ex.id === e.exerciseId))
    .filter(e => e !== undefined);
});

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
    date: date,
    exercises: [],
    status: WorkoutStatus.PLANNED,
  };

  await create(workoutData);
};

/**
 * Delete a workout
 */
const deleteWorkout = async () => {
  if (!workout) return;

  if (confirm('Are you sure you want to delete this workout?')) {
    await remove(workout.id);
  }
};
</script>

<template>
  <div class="workouts-list-container">
    <!-- Loading Spinner -->
    <div
      v-if="loading"
      class="ion-text-center ion-padding"
    >
      <ion-spinner />
    </div>

    <div v-else>
      <!-- No workout state -->
      <div
        v-if="!workout"
        class="empty-state"
      >
        <ion-icon :icon="addOutline" />
        <h3>No Workout</h3>
        <p>Nothing planned for {{ formatDate(date) }}</p>
        <ion-button @click="addWorkout">
          Create a workout
        </ion-button>
      </div>

      <ion-card v-else>
        <ion-card-header>
          <ion-card-title class="ion-text-center">
            {{ formatDate(date) }}
          </ion-card-title>
          <div class="ion-margin-bottom ion-display-flex ion-justify-content-between ion-align-content-center">
            <workout-status-label :status="workout.status" />

            <ion-card-subtitle v-if="workoutDuration">
              {{ workoutDuration }} minutes
            </ion-card-subtitle>
          </div>
        </ion-card-header>

        <ion-card-content>
          <ion-button 
            expand="block"
            fill="outline"
            :routerLink="`/workouts/${workout.id}`"
          >
            View Details
          </ion-button>

          <!-- Exercises List -->
          <ion-list
            v-if="workoutExercises"
            class="ion-padding-vertical"
          >
            <ion-item
              v-for="exercise in workoutExercises"
              :key="exercise.id"
            >
              {{ exercise.name }}
              <exercise-category-label
                slot="end"
                :category="exercise.category"
              />
            </ion-item>
          </ion-list>

          <ion-button
            expand="block"
            color="danger" 
            fill="clear" 
            @click="deleteWorkout"
          >
            <template #start>
              <ion-icon :icon="trashOutline" />
            </template>
            Delete Workout
          </ion-button>
        </ion-card-content>
      </ion-card>
    </div>
  </div>
</template>

<style scoped>
.workouts-list-container {
  ion-item {
    --inner-padding-end: 0;
  }
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
</style>
