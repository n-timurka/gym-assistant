<script setup lang="ts">
import type { ProgramWorkoutExercise } from '@/types/firebase.types';
import {
  IonAccordion,
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
} from '@ionic/vue';
import { addOutline, trash, trashOutline } from 'ionicons/icons';
import ExerciseCategoryLabel from '@/components/ExerciseCategoryLabel.vue';

defineProps<{
  exercises: ProgramWorkoutExercise[],
  index: number,
}>();
const emit = defineEmits<{
  (e: 'add-exercise', index: number): void,
  (e: 'delete-exercise', index: number, exerciseIndex: number): void,
  (e: 'delete-workout', index: number): void,
}>();
</script>

<template>
  <ion-accordion :value="`workout-${index}`">
    <template #header>
      <ion-item color="light">
        <template #start>
          <ion-badge 
            color="medium"
          >
            {{ exercises.length }}
          </ion-badge>
        </template>
        Workout {{ index + 1 }}
      </ion-item>
    </template>

    <template #content>
      <div>
        <ion-list lines="full">
          <ion-list-header class="ion-no-margin ion-margin-bottom">
            <ion-label>Exercises</ion-label>
            <ion-button
              fill="outline"
              @click="emit('add-exercise', index)"
            >
              <template #start>
                <ion-icon 
                  :icon="addOutline"
                />
              </template>
              Add
            </ion-button>
          </ion-list-header>
          <ion-item
            v-if="exercises.length === 0"
            class="ion-text-center"
          >
            <ion-note>
              No exercises in this workout...
            </ion-note>
          </ion-item>
          <ion-item-sliding
            v-for="(exercise, exerciseIndex) in exercises"
            :key="exercise.exerciseId"
          >
            <ion-item v-if="exercise.exercise">
              <ion-label>{{ exercise.exercise.name }}</ion-label>
              <template #end>
                <exercise-category-label
                  :category="exercise.exercise.category"
                  size="sm"
                />
              </template>
            </ion-item>
            <template #end>
              <ion-item-options>
                <ion-item-option
                  color="danger"
                  @click="emit('delete-exercise', index, exerciseIndex)"
                >
                  <ion-icon :icon="trash" />
                </ion-item-option>
              </ion-item-options>
            </template>
          </ion-item-sliding>
        </ion-list>

        <div class="ion-display-flex ion-justify-content-center ion-margin-vertical">
          <ion-button
            color="danger"
            size="small"
            @click="emit('delete-workout', index)"
          >
            <template #start>
              <ion-icon 
                :icon="trashOutline"
              />
            </template>
            Delete
          </ion-button>
        </div>
      </div>
    </template>
  </ion-accordion>
</template>

<style scoped>
div[slot='header'] {
  border: 1px solid var(--ion-color-muted);
  background: var(--ion-color-muted-foreground);
}
div[slot='content'] {
  border: 1px solid var(--ion-color-muted);
}
</style>
