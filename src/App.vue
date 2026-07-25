<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import RestTimerModal from './components/RestTimerModal.vue';

// Initialize auth state
const { authInitialized } = useAuth();
</script>

<template>
  <IonApp>
    <div v-if="!authInitialized" class="auth-loading">
      <IonSpinner name="crescent" />
      <p>Loading...</p>
    </div>
    <IonRouterOutlet v-else />
    
    <RestTimerModal />
  </IonApp>
</template>

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
