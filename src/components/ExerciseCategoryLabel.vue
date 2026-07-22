<script setup lang="ts">
import { ExerciseCategory } from '@/types/firebase.types';
import { IonChip, IonLabel } from '@ionic/vue';
import { computed } from 'vue';

const { category, size = 'md' } = defineProps<{
  category: ExerciseCategory,
  size?: 'sm' | 'md' | 'lg',
}>();

const categoryClass = computed(() => 
  `bg-muscle-${category.toLowerCase()}-light text-muscle-${category.toLowerCase()}`);
const iconClass = computed(() => `muscle-${category.toLowerCase()}`);
const sizeClass = computed(() => ({
  'sm': 'min-height: 8px; padding: 2px 12px;',
  'md': '',
  'lg': '',
}[size]))
</script>

<template>
  <IonChip :class="categoryClass" :style="sizeClass">
    <span :class="iconClass" style="
      width: 0.5em;
      height: 0.5rem;
      border-radius: 50%;
      margin-right: 0.25rem;" />
    <IonLabel>{{ category }}</IonLabel>
  </IonChip>
</template>
