<script setup lang="ts">
import { useRestTimer } from '@/composables/useRestTimer';
import { IonButton, IonIcon } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';

const { formattedTime, stopTimer, isRunning } = useRestTimer();
</script>

<template>
  <Transition>
    <section v-if="isRunning" class="timer-overlay">
      <div class="timer-content">
        <div class="timer-label">Rest Time</div>
        <div class="timer-value">{{ formattedTime }}</div>
      </div>
      <IonButton fill="clear" color="light" @click="stopTimer">
        <IonIcon :icon="closeOutline" slot="icon-only" />
      </IonButton>
    </section>
  </Transition>
</template>

<style scoped>
.timer-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
.timer-content {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 0.8rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
