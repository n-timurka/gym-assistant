<script setup lang="ts">
import { WorkoutStatus } from '@/types/firebase.types';
import { IonBadge } from '@ionic/vue';
import { computed } from 'vue';

const { status } = defineProps<{
  status: WorkoutStatus,
}>();

/**
 * Get status text for workout
 */
const statusText = computed(() => status.charAt(0).toUpperCase() + status.slice(1));

/**
 * Get status color for workout
 */
const statusColor = computed(() => ({
  [WorkoutStatus.ONGOING]: 'warning',
  [WorkoutStatus.COMPLETED]: 'success',
  [WorkoutStatus.PLANNED]: 'medium',
}[status]));
</script>

<template>
  <IonBadge :color="statusColor">
    {{ statusText }}
  </IonBadge>
</template>
