<script setup lang="ts">
import { type Workout } from '@/types/firebase.types';
import { IonAccordion, IonBadge, IonButton, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/vue';
import { addOutline, trash, trashOutline } from 'ionicons/icons';
import ExerciseCategoryLabel from '../ExerciseCategoryLabel.vue';

defineProps<{
  workout: Workout,
  index: number,
}>();
const emit = defineEmits<{
  (e: 'add-exercise', index: number): void,
  (e: 'delete-exercise', index: number, exerciseIndex: number): void,
  (e: 'delete-workout', index: number): void,
}>();
</script>

<template>
  <IonAccordion :value="workout.id">
    <IonItem slot="header" color="light">
      <IonBadge slot="start" color="medium">{{ workout.exercises.length }}</IonBadge>
      Workout {{ index + 1 }}
    </IonItem>

    <div slot="content">
      <IonList lines="full">
        <IonListHeader class="ion-no-margin ion-margin-bottom">
          <IonLabel>Exercises</IonLabel>
          <IonButton fill="outline" @click="emit('add-exercise', index)">
            <IonIcon slot="start" :icon="addOutline" />
            Add
          </IonButton>
        </IonListHeader>
        <IonItem v-if="workout.exercises.length === 0" class="ion-text-center">
          <IonNote>
            No exercises in this workout...
          </IonNote>
        </IonItem>
        <IonItemSliding v-for="(exercise, exerciseIndex) in workout.exercises" :key="exercise.exerciseId">
          <IonItem v-if="exercise.exercise">
            <IonLabel>{{ exercise.exercise.name }}</IonLabel>
            <ExerciseCategoryLabel :category="exercise.exercise.category" size="sm" slot="end" />
          </IonItem>
          <IonItemOptions slot="end">
            <IonItemOption color="danger" @click="emit('delete-exercise', index, exerciseIndex)">
              <IonIcon :icon="trash" />
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      </IonList>

      <div class="ion-display-flex ion-justify-content-center ion-margin-vertical">
        <IonButton color="danger" size="small" @click="emit('delete-workout', index)">
          <IonIcon slot="start" :icon="trashOutline" />
          Delete
        </IonButton>
      </div>
    </div>
  </IonAccordion>
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
