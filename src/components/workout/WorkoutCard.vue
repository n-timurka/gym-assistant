<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { useFirebase } from '@/composables/useFirebase';
import { calculateDuration, formatDate } from '@/helpers/date.helper';
import { Collections, Exercise, Workout, WorkoutStatus } from '@/types/firebase.types';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonItem, IonList, IonSpinner } from '@ionic/vue';
import { addOutline, trashOutline } from 'ionicons/icons';
import WorkoutStatusLabel from '@/components/WorkoutStatusLabel.vue';
import { computed } from 'vue';
import ExerciseCategoryLabel from '@/components/ExerciseCategoryLabel.vue';

const { date, workout, exercises } = defineProps<{
  date: Date,
  workout?: Workout,
  exercises: Exercise[],
}>();

const { currentUser } = useAuth();
const { loading, create, remove } = useFirebase<Workout>(Collections.WORKOUTS);

const workoutDuration = computed(() => {
  if (!workout) return
  
  return workout.startTime && workout.endTime
    ? calculateDuration(workout.startTime, workout.endTime)
    : null
});

const workoutExercises = computed(() => {
  if (!workout) return;

  return workout.exercises
    .map(e => exercises.find(ex => ex.id === e.exerciseId))
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
    <div v-if="loading" class="ion-text-center ion-padding">
      <IonSpinner />
    </div>

    <div v-else class="workout-details">
      <!-- No workout state -->
      <div class="empty-state" v-if="!workout">
        <IonIcon :icon="addOutline" />
        <h3>No Workout</h3>
        <p>Nothing planned for {{ formatDate(date) }}</p>
        <IonButton @click="addWorkout">
          Create a workout
        </IonButton>
      </div>

      <IonCard v-else>
        <IonCardHeader>
          <IonCardTitle class="ion-text-center">
            {{ formatDate(date) }}
          </IonCardTitle>
          <div class="ion-margin-bottom ion-display-flex ion-justify-content-between ion-align-content-center">
            <WorkoutStatusLabel :status="workout.status" />

            <IonCardSubtitle v-if="workoutDuration">
              {{ workoutDuration }} minutes
            </IonCardSubtitle>
          </div>
        </IonCardHeader>

        <IonCardContent>
          <IonButton 
            expand="block"
            fill="outline"
            :router-link="`/workouts/${workout.id}`"
          >
            View Details
          </IonButton>

          <!-- Exercises List -->
          <IonList v-if="workoutExercises" class="ion-padding-vertical">
            <IonItem v-for="exercise in workoutExercises" :key="exercise.id">
              {{ exercise.name }}
              <ExerciseCategoryLabel slot="end" :category="exercise.category" />
            </IonItem>
          </IonList>

          <IonButton
            expand="block"
            color="danger" 
            fill="clear" 
            @click="deleteWorkout"
          >
            <ion-icon slot="start" :icon="trashOutline"></ion-icon>
            Delete Workout
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  </div>
</template>

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
</style>
