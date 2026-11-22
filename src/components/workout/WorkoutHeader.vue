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
      <ion-buttons slot="start">
        <ion-back-button defaultHref="/tabs/workouts" />
      </ion-buttons>
      <ion-title>{{ workoutDateDisplay }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>
