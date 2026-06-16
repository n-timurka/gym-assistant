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

        <ion-tab-button tab="programs" href="/tabs/programs">
          <ion-icon aria-hidden="true" :icon="list" />
          <ion-label>Programs</ion-label>
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
import { barbell, fitness, person, list } from 'ionicons/icons';
</script>

<style scoped>
ion-tab-bar {
  --background: var(--ion-color-card);
  --border-color: var(--ion-color-border);

  height: 4rem;
  backdrop-filter: blur(24px);
}

ion-tab-button {
  --color: var(--ion-color-muted-foreground);
  --color-selected: var(--ion-color-accent-foreground);
  --padding-top: 0.25rem;
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-bottom: 0.25rem;

  ion-icon {
    width: 1.25rem;
    height: 1.25rem;
    padding: 0.25rem;
    border-radius: 0.75rem;
  }

  ion-label {
    font-size: 10px;
    font-weight: 500;
  }
}
ion-tab-button.tab-selected ion-icon {
  background-color: var(--ion-color-accent);
}
</style>

