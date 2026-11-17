<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
} from '@ionic/vue';
import { useWorkoutDetail } from '@/composables/useWorkoutDetail';
import WorkoutCompletedItem from './WorkoutCompletedItem.vue';

const { workout, workoutDuration, workoutSets } = useWorkoutDetail();
</script>

<template>
  <div class="workout-completed-view">
    <ion-card>
      <ion-card-header>
        <ion-card-title class="ion-text-center">
          Workout Summary
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item>
            <ion-label>Time</ion-label>
            <template #end>
              <ion-badge>{{ workoutDuration }} min.</ion-badge>
            </template>
          </ion-item>
          <ion-item>
            <ion-label>Exercises</ion-label>
            <template #end>
              <ion-badge>{{ workout?.exercises.length || 0 }}</ion-badge>
            </template>
          </ion-item>
          <ion-item>
            <ion-label>Sets</ion-label>
            <template #end>
              <ion-badge>{{ workoutSets }}</ion-badge>
            </template>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>

    <ion-list>
      <workout-completed-item
        v-for="exercise in workout?.exercises"
        :key="exercise.exerciseId"
        :exercise="exercise"
      />
    </ion-list>
  </div>
</template>
