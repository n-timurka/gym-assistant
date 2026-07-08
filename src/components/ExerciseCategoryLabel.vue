<script setup lang="ts">
import { ExerciseCategory } from '@/types/firebase.types';
import { IonChip, IonIcon, IonLabel } from '@ionic/vue';
import { barbell } from 'ionicons/icons';
import { computed } from 'vue';

const { category, size = 'md' } = defineProps<{
  category: ExerciseCategory,
  size?: 'sm' | 'md' | 'lg',
}>();

const categoryClass = computed(() => 
  `bg-muscle-${category.toLowerCase()}-light text-muscle-${category.toLowerCase()}`);
const iconClass = computed(() => `text-muscle-${category.toLowerCase()}`);
const sizeClass = computed(() => ({
  'sm': 'min-height: 8px; padding: 2px 12px;',
  'md': '',
  'lg': '',
}[size]))
</script>

<template>
  <IonChip :class="categoryClass" :style="sizeClass">
    <IonIcon :icon="barbell" :class="iconClass" />
    <IonLabel>{{ category }}</IonLabel>
  </IonChip>
</template>
