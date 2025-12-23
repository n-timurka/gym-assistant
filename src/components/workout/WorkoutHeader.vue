<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button default-href="/tabs/workouts"></ion-back-button>
      </ion-buttons>
      <ion-title>{{ workoutDateDisplay }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { WorkoutStatus } from '@/types/firebase.types';

withDefaults(defineProps<{
  workoutDateDisplay: string;
  workoutStatus: WorkoutStatus;
}>(), {});

defineEmits<{
  (e: 'start-training'): void;
  (e: 'end-training'): void;
}>();
</script>

<style scoped>
/* No styles needed currently */
</style>
