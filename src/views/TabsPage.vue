<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="workouts" href="/tabs/workouts">
          <ion-icon aria-hidden="true" :icon="barbell" />
          <ion-label>Workouts</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="exercises" href="/tabs/exercises">
          <ion-icon aria-hidden="true" :icon="fitness" />
          <ion-label>Exercises</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="account" href="/tabs/account">
          <ion-icon aria-hidden="true" :icon="person" />
          <ion-label>Account</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { barbell, fitness, person } from 'ionicons/icons';
</script>
