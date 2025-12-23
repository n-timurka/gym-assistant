<template>
  <div class="workout-completed-view">
    <div class="ion-padding text-center">
      <h2 class="ion-text-center">Workout Summary</h2>
      <p class="ion-text-center ion-text-wrap text-medium">
        Great job! Here is what you accomplished.
      </p>
    </div>

    <ion-list>
      <ion-item v-for="exercise in exercises" :key="exercise.exerciseId" lines="full">
        <ion-thumbnail slot="start">
          <img :src="getExercisePicture(exercise.exerciseId)" alt="Exercise" @error="handleImageError" />
        </ion-thumbnail>
        <ion-label>
          <h2>{{ getExerciseName(exercise.exerciseId) }}</h2>
          <p>{{ getExerciseCategory(exercise.exerciseId) }}</p>
          <p class="sets-summary">
            {{ getCompletedSetsCount(exercise) }} / {{ exercise.sets.length }} sets completed
          </p>
        </ion-label>
        <ion-note slot="end" color="primary">
            {{ getMaxWeight(exercise) }} kg Best
        </ion-note>
      </ion-item>
    </ion-list>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonNote
} from '@ionic/vue';
import { WorkoutExercise, Exercise } from '@/types/firebase.types';

const props = defineProps<{
  exercises: WorkoutExercise[];
  allExercises: Exercise[];
}>();

const getExerciseName = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex ? ex.name : 'Unknown Exercise';
};

const getExerciseCategory = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex ? ex.category : undefined;
};

const getExercisePicture = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex?.picture || `/assets/exercises/${ex?.extId}.png`;
};

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = '/assets/icon/icon.png';
};

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
