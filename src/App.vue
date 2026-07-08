<template>
  <ion-app>
    <div v-if="!authInitialized" class="auth-loading">
      <ion-spinner name="crescent" />
      <p>Loading...</p>
    </div>
    <ion-router-outlet v-else />
    
    <!-- Global Rest Timer Overlay -->
    <transition name="slide-up">
      <rest-timer-overlay
        v-if="isTimerRunning"
        :remaining-seconds="remainingSeconds"
        @stop-timer="stopTimer"
      ></rest-timer-overlay>
    </transition>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import RestTimerOverlay from '@/components/workout/RestTimerOverlay.vue';
import { useTimer } from '@/composables/useTimer';

// Initialize auth state
const { authInitialized } = useAuth();
const { isTimerRunning, remainingSeconds, stopTimer} = useTimer();
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
