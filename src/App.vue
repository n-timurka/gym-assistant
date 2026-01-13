<template>
  <ion-app>
    <div v-if="!authInitialized" class="auth-loading">
      <ion-spinner name="crescent" />
      <p>Loading...</p>
    </div>
    <ion-router-outlet v-else />
    
    <!-- Global Rest Timer Overlay -->
    <rest-timer-overlay
      v-if="isTimerRunning"
      :remaining-seconds="remainingSeconds"
      @stop-timer="stopTimer"
    ></rest-timer-overlay>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import RestTimerOverlay from '@/components/workout/RestTimerOverlay.vue';
import { useTimer } from '@/composables/useTimer';

// Initialize auth state
const { authInitialized } = useAuth();
const { isTimerRunning, remainingSeconds, stopTimer, updateTimer, timerTargetTime } = useTimer();

// Handle interaction with timer (if strict background handling needed globally in App.vue)
// We need to ensure visibility change is handled to update timer when returning from background
import { onMounted, onUnmounted } from 'vue';

const handleVisibilityChange = () => {
  // If timer is running and we come back to visible, update immediately to sync visual
  if (document.visibilityState === 'visible' && isTimerRunning.value && timerTargetTime?.value) {
    // We need to access the updateTimer logic which is internal to useTimer unless exported.
    // I exported updateTimer in my thought process but let's check the file content I wrote.
    // I did NOT export updateTimer in the `return` block of useTimer.ts
    // I should probably update useTimer.ts to export it or handle visibility INSIDE useTimer.
    // Ideally inside useTimer. But for now let's stick to the plan.
    // Wait, I can't access updateTimer if not returned. 
    // Let's assume I will fix useTimer.ts in next step or just rely on interval.
    // Actually, interval runs even in background often in web views, but throttled.
    // Correct fix: Move visibility logic to useTimer.ts or export updateTimer.
    // Let's export updateTimer from useTimer.ts first.
  }
};
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

