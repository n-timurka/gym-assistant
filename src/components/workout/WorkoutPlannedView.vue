<script setup lang="ts">
import {
  IonReorderGroup,
  IonButton,
  IonFooter,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonReorder,
} from '@ionic/vue';
import { WorkoutExercise, Exercise } from '@/types/firebase.types';
import AddWorkoutModal from './AddWorkoutModal.vue';
import WorkoutExerciseCard from '@/components/workout/WorkoutExerciseCard.vue';
import { ref } from 'vue';
import ExerciseCategoryLabel from '../ExerciseCategoryLabel.vue';

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
  (e: 'open-add-modal', index: number): void;
  (e: 'add-exercises', ids: string[]): void,
}>();

const isAddWorkoutOpen = ref(false);

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

const loadFromProgram = (ids: string[]) => {
  emit('add-exercises', ids);
  isAddWorkoutOpen.value = false;
} 
</script>

<template>
  <div>
    <!-- Empty State -->
    <div v-if="!exercises.length" class="empty-state ion-padding">
      <p>No exercises added yet.</p>
      <IonButton fill="outline" @click="$emit('open-add-modal', 0)">
        Add Exercise
      </IonButton>
      <p>Or add template from program.</p>
      <IonButton @click="isAddWorkoutOpen = true">
        Add Workout
      </IonButton>
    </div>

    <!-- Exercises List -->
    <IonAccordionGroup class="ion-padding">
      <IonReorderGroup :disabled="false" @ionItemReorder="handleReorder">
        <IonAccordion v-for="(exercise, index) in exercises" :key="exercise.exerciseId" :value="exercise.exerciseId">
          <IonItem v-if="exercise.exercise" slot="header" color="light">
            <IonLabel>{{ exercise.exercise.name }}</IonLabel>
            <ExerciseCategoryLabel :category="exercise.exercise?.category" size="sm" />
            <IonReorder slot="start"></IonReorder>
          </IonItem>
          <WorkoutExerciseCard
            slot="content"
            :exercise="exercise"
            :exercise-name="getExerciseName(exercise.exerciseId)"
            :exercise-category="getExerciseCategory(exercise.exerciseId)"
            :exercise-image="getExerciseImage(exercise.exerciseId)"
            :exercise-description="getExerciseDescription(exercise.exerciseId)"
            :is-workout-started="false"
            :is-collapsible="true"
            @delete-exercise="$emit('delete-exercise', index)"
            @add-set="$emit('add-set', index)"
            @remove-set="(setIndex: number) => $emit('remove-set', index, setIndex)"
            @update-set="$emit('update-set')"
          />
        </IonAccordion>
      </IonReorderGroup>
    </IonAccordionGroup>

    <add-workout-modal v-model="isAddWorkoutOpen" @select-workout="loadFromProgram" />

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

<style scoped>
.empty-state {
  text-align: center;
  color: var(--ion-color-medium);
  margin-top: 2rem;
}
</style>
