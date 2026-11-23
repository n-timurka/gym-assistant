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
    <ion-item
      slot="header"
      color="light"
    >
      <ion-badge
        slot="start"
        color="medium"
      >
        {{ exercises.length }}
      </ion-badge>
      Workout {{ index + 1 }}
    </ion-item>

    <div slot="content">
      <ion-list lines="full">
        <ion-list-header class="ion-no-margin ion-margin-bottom">
          <ion-label>Exercises</ion-label>
          <ion-button
            fill="outline"
            @click="emit('add-exercise', index)"
          >
            <ion-icon
              slot="start"
              :icon="addOutline"
            />
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
            <exercise-category-label
              slot="end"
              :category="exercise.exercise.category"
              size="sm"
            />
          </ion-item>
          <ion-item-options slot="end">
            <ion-item-option
              color="danger"
              @click="emit('delete-exercise', index, exerciseIndex)"
            >
              <ion-icon :icon="trash" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <div class="ion-display-flex ion-justify-content-center ion-margin-vertical">
        <ion-button
          color="danger"
          size="small"
          @click="emit('delete-workout', index)"
        >
          <ion-icon
            slot="start"
            :icon="trashOutline"
          />
          Delete
        </ion-button>
      </div>
    </div>
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
