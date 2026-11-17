<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { useWorkoutDetail } from '@/composables/useWorkoutDetail';

const { workoutDateDisplay } = useWorkoutDetail();
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <template #start>
        <ion-buttons>
          <ion-back-button defaultHref="/tabs/workouts" />
        </ion-buttons>
      </template>
      <ion-title>{{ workoutDateDisplay }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>
