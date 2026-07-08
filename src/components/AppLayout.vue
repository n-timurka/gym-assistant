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
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons v-if="backRoute" slot="start">
          <IonBackButton :default-href="backRoute" />
        </IonButtons>
        <IonTitle>{{ title }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div :class="!noPadding && 'ion-padding'">
        <!-- Loading State -->
        <div v-if="loading" class="ion-text-center ion-padding">
          <IonSpinner />
        </div>

        <slot />
      </div>
    </IonContent>

    <slot name="fab" />
  </IonPage>
</template>
