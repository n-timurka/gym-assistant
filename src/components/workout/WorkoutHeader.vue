<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonBackButton default-href="/tabs/workouts" />
      </IonButtons>
      <IonTitle>{{ date }}</IonTitle>
    </IonToolbar>
  </IonHeader>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';

defineProps<{ date: string }>();
</script>
