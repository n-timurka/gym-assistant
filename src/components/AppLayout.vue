<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/vue';

const { loading = false, backRoute, noPadding = false } = defineProps<{
  title: string,
  loading?: boolean,
  backRoute?: string,
  noPadding?: boolean,
}>()
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons
          v-if="backRoute"
          slot="start"
        >
          <ion-back-button :defaultHref="backRoute" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div :class="!noPadding && 'ion-padding'">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="ion-text-center ion-padding"
        >
          <ion-spinner />
        </div>

        <slot />
      </div>
    </ion-content>

    <slot name="fab" />
  </ion-page>
</template>
