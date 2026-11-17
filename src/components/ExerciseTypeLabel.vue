<script setup lang="ts">
import { ExerciseType } from '@/types/firebase.types';
import { IonChip, IonLabel } from '@ionic/vue';
import { computed } from 'vue';

const { type, size = 'md' } = defineProps<{
  type: ExerciseType,
  size?: 'sm' | 'md',
}>()

const typeColor = computed(() => ({
  [ExerciseType.FREE_WEIGHTS]: 'primary',
  [ExerciseType.MACHINES]: 'secondary',
  [ExerciseType.CABLE_MACHINE]: 'tertiary',
  [ExerciseType.NO_EQUIPMENT]: 'default',
}[type]))
const sizeClass = computed(() => ({
  'sm': 'min-height: 8px; padding: 2px 12px;',
  'md': '',
  'lg': '',
}[size]))
</script>

<template>
  <ion-chip
    :color="typeColor"
    :style="sizeClass"
  >
    <ion-label>{{ type }}</ion-label>
  </ion-chip>
</template>
