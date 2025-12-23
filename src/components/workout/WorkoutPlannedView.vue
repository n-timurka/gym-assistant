<template>
  <div class="workout-planned-view">
    <!-- Empty State -->
    <div v-if="!exercises.length" class="empty-state ion-padding">
      <p>No exercises added yet.</p>
      <ion-button fill="outline" @click="$emit('open-add-modal')">
        Add Exercise
      </ion-button>
    </div>

    <!-- Exercises List -->
    <ion-reorder-group :disabled="false" @ionItemReorder="handleReorder">
      <workout-exercise-card
        v-for="(exercise, index) in exercises"
        :key="exercise.exerciseId"
        :exercise="exercise"
        :exercise-name="getExerciseName(exercise.exerciseId)"
        :exercise-category="getExerciseCategory(exercise.exerciseId)"
        :exercise-image="getExerciseImage(exercise.exerciseId)"
        :exercise-description="getExerciseDescription(exercise.exerciseId)"
        :is-workout-started="false"
        :is-collapsible="true"
        @delete-exercise="$emit('delete-exercise', index)"
        @add-set="$emit('add-set', index)"
        @remove-set="(setIndex) => $emit('remove-set', index, setIndex)"
        @update-set="$emit('update-set')"
      ></workout-exercise-card>
    </ion-reorder-group>

    <ion-footer class="ion-no-border">
      <!-- Clear Workout Button -->
      <div v-if="exercises.length" class="ion-padding">
        <ion-button expand="block" fill="outline" color="danger" @click="$emit('clear-workout')">
          Clear Workout
        </ion-button>
      </div>
    </ion-footer>
  </div>
</template>

<script setup lang="ts">
import {
  IonReorderGroup,
  IonButton,
  IonFooter,
} from '@ionic/vue';
import WorkoutExerciseCard from '@/components/workout/WorkoutExerciseCard.vue';
import { WorkoutExercise, Exercise } from '@/types/firebase.types';

const props = defineProps<{
  exercises: WorkoutExercise[];
  allExercises: Exercise[];
}>();

const emit = defineEmits<{
  (e: 'delete-exercise', index: number): void;
  (e: 'add-set', index: number): void;
  (e: 'remove-set', index: number, setIndex: number): void;
  (e: 'update-set'): void;
  (e: 'reorder', event: CustomEvent): void;
  (e: 'clear-workout'): void;
  (e: 'open-add-modal'): void;
}>();

const getExerciseName = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex ? ex.name : 'Unknown Exercise';
};

const getExerciseCategory = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex ? ex.category : undefined;
};

const getExerciseImage = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.picture ? ex.picture : `/assets/exercises/${ex?.extId}.png`;
};

const getExerciseDescription = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.description;
};

const handleReorder = (event: CustomEvent) => {
  emit('reorder', event);
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  color: var(--ion-color-medium);
  margin-top: 2rem;
}
</style>
