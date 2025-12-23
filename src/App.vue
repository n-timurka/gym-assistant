<template>
  <ion-app>
    <div v-if="!authInitialized" class="auth-loading">
      <ion-spinner name="crescent" />
      <p>Loading...</p>
    </div>
    <ion-router-outlet v-else />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

// Initialize auth state
const { authInitialized } = useAuth();
</script>

<style scoped>
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

.auth-loading p {
  color: var(--ion-color-medium);
  font-size: 1rem;
}
</style>

