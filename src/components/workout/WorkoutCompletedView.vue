<template>
  <div class="workout-completed-view">
    <IonCard>
      <IonCardHeader>
        <IonCardTitle class="ion-text-center">Workout Summary</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          <IonItem>
            <IonLabel>Time</IonLabel>
            <IonBadge slot="end">{{ workoutDuration }} min.</IonBadge>
          </IonItem>
          <IonItem>
            <IonLabel>Exercises</IonLabel>
            <IonBadge slot="end">{{ exercises.length }}</IonBadge>
          </IonItem>
          <IonItem>
            <IonLabel>Sets</IonLabel>
            <IonBadge slot="end">{{ workoutSets }}</IonBadge>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>

    <IonList>
      <IonListHeader class="ion-text-center">Exercises:</IonListHeader>

      <ion-item v-for="exercise in exercises" :key="exercise.exerciseId" lines="full">
        <ion-thumbnail slot="start">
          <ExerciseImage :exercise-id="exercise.exercise?.extId" size="xs" />
        </ion-thumbnail>
        <ion-label>
          <h2>{{ exercise.exercise?.name }}</h2>
          <p>{{ exercise.exercise?.category }}</p>
          <p class="sets-summary">
            {{ getCompletedSetsCount(exercise) }} / {{ exercise.sets.length }} sets completed
          </p>
        </ion-label>
        <ion-note slot="end" color="primary">
          {{ getMaxWeight(exercise) }} kg Best
        </ion-note>
      </ion-item>
    </IonList>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonListHeader
} from '@ionic/vue';
import { Workout, type WorkoutExercise } from '@/types/firebase.types';
import ExerciseImage from '@/components/ExerciseImage.vue';
import { computed } from 'vue';
import { calculateDuration } from '@/helpers/date.helper';

const { exercises, workout } = defineProps<{
  exercises: WorkoutExercise[],
  workout: Workout,
}>();

const workoutDuration = computed(() => {
  if (!workout.startTime || !workout.endTime) return

  return calculateDuration(workout.startTime, workout.endTime);
});
const workoutSets = computed(() => exercises.reduce(
  (value, exercise) => value + exercise.sets.filter(s => s.isCompleted).length,
  0,
));

const getCompletedSetsCount = (exercise: WorkoutExercise) => {
  return exercise.sets.filter(s => s.isCompleted).length;
};

const getMaxWeight = (exercise: WorkoutExercise) => {
    if(!exercise.sets.length) return 0;
    const completedSets = exercise.sets.filter(s => s.isCompleted);
    if (!completedSets.length) return 0;
    return Math.max(...completedSets.map(s => s.weight || 0));
}
</script>

<style scoped>
.text-medium {
  color: var(--ion-color-medium);
}
.sets-summary {
    font-weight: 500;
}
</style>
