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

const { workout, workoutDuration, workoutSets, workoutExercises } = useWorkoutDetail();
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
            <ion-badge slot="end">
              {{ workoutDuration }} min.
            </ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Exercises</ion-label>
            <ion-badge slot="end">
              {{ workout?.exercises.length || 0 }}
            </ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Sets</ion-label>
            <ion-badge slot="end">
              {{ workoutSets }}
            </ion-badge>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>

    <ion-list>
      <workout-completed-item
        v-for="exercise in workoutExercises"
        :key="exercise.exerciseId"
        :exercise="exercise"
      />
    </ion-list>
  </div>
</template>
