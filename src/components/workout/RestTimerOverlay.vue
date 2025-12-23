<template>
  <transition name="slide-up">
    <div class="timer-overlay">
      <div class="timer-content">
        <div class="timer-label">Rest Time</div>
        <div class="timer-value">{{ timeDisplay }}</div>
      </div>
      <ion-button fill="clear" color="light" @click="$emit('stop-timer')">
        <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';

const props = defineProps<{
  remainingSeconds: number;
}>();

defineEmits<{
  (e: 'stop-timer'): void;
}>();

const timeDisplay = computed(() => {
  const m = Math.floor(props.remainingSeconds / 60);
  const s = props.remainingSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});
</script>

<style scoped>
/* Timer Overlay */
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
