<script setup lang="ts">
import {
  IonReorderGroup,
  IonFooter,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonReorder,
  IonButton,
} from '@ionic/vue';
import { ref } from 'vue';
import { useWorkoutDetail } from '@/composables/useWorkoutDetail';
import AddWorkoutModal from './AddWorkoutModal.vue';
import WorkoutExerciseCard from '@/components/workout/WorkoutExerciseCard.vue';
import ExerciseCategoryLabel from '../ExerciseCategoryLabel.vue';
import AddExerciseModal from './AddExerciseModal.vue';

const {
  workoutExercises,
  reorderExercises,
  saveWorkoutDebounced,
  clearWorkout,
  deleteExercise,
  openAddModal,
  addExercise,
  addExercises,
  addSet,
  removeSet,
} = useWorkoutDetail();

const isAddWorkoutOpen = ref(false);
const loadFromProgram = (ids: string[]) => {
  addExercises(ids);
  isAddWorkoutOpen.value = false;
}
</script>

<template>
  <div>
    <!-- Empty State -->
    <div
      v-if="!workoutExercises.length"
      class="empty-state ion-padding"
    >
      <p>No exercises added yet.</p>
      <ion-button
        fill="outline"
        @click="openAddModal"
      >
        Add Exercise
      </ion-button>
      <p>Or add template from program.</p>
      <ion-button @click="isAddWorkoutOpen = true">
        Add Workout
      </ion-button>
    </div>

    <!-- Exercises List -->
    <ion-accordion-group
      v-else
      class="ion-padding"
    >
      <ion-reorder-group
        :disabled="false"
        @ion-item-reorder="reorderExercises"
      >
        <ion-accordion
          v-for="(exercise, index) in workoutExercises"
          :key="exercise.exerciseId"
          :value="exercise.exerciseId"
        >
          <ion-item
            v-if="exercise.exercise"
            slot="header"
            color="light"
          >
            <ion-label>{{ exercise.exercise.name }}</ion-label>
            <exercise-category-label
              :category="exercise.exercise?.category"
              size="sm"
            />
            <ion-reorder slot="start" />
          </ion-item>

          <div
            slot="content"
            class="ion-padding"
          >
            <workout-exercise-card
              :exercise="exercise"
              @add-set="addSet(index)"
              @remove-set="(setIndex: number) => removeSet(index, setIndex)"
              @update-set="saveWorkoutDebounced"
            />
            <ion-button
              class="ion-margin-top"
              expand="block"
              fill="outline"
              color="danger"
              @click="deleteExercise(index)"
            >
              Delete Exercise
            </ion-button>
          </div>
        </ion-accordion>
      </ion-reorder-group>
    </ion-accordion-group>

    <add-workout-modal
      v-model="isAddWorkoutOpen"
      @select-workout="loadFromProgram"
    />
    <add-exercise-modal @add-exercise="addExercise" />

    <ion-footer
      v-if="workoutExercises.length"
      class="ion-no-border ion-padding"
    >
      <!-- Clear Workout Button -->
      <ion-button
        expand="block"
        fill="outline"
        color="danger"
        @click="clearWorkout()"
      >
        Clear Workout
      </ion-button>
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
