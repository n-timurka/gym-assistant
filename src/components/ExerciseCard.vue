<template>
  <ion-card class="exercise-card" button :router-link="'/exercises/' + exercise.id">
    <ion-card-header>
      <div class="exercise-header">
        <ion-card-title>{{ exercise.name }}</ion-card-title>
        <ion-badge :color="getTypeColor(exercise.type)">
          {{ exercise.type }}
        </ion-badge>
      </div>
      <ion-card-subtitle>
        <ion-chip :color="getCategoryColor(exercise.category)">
          <ion-label>{{ exercise.category }}</ion-label>
        </ion-chip>
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content v-if="exercise.description">
      <p>{{ exercise.description }}</p>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonBadge
} from '@ionic/vue';
import { type Exercise, ExerciseCategory, ExerciseType } from '@/types/firebase.types';

interface Props {
  exercise: Exercise;
}

defineProps<Props>();

/**
 * Get color for exercise type badge
 */
const getTypeColor = (type: ExerciseType): string => {
  switch (type) {
    case ExerciseType.FREE_WEIGHTS:
      return 'primary';
    case ExerciseType.MACHINES:
      return 'secondary';
    case ExerciseType.CABLE_MACHINE:
      return 'tertiary';
    case ExerciseType.NO_EQUIPMENT:
      return 'success';
    default:
      return 'medium';
  }
};

/**
 * Get color for category chip
 */
const getCategoryColor = (category: ExerciseCategory): string => {
  const colors: Record<ExerciseCategory, string> = {
    [ExerciseCategory.CHEST]: 'danger',
    [ExerciseCategory.BACK]: 'primary',
    [ExerciseCategory.SHOULDERS]: 'warning',
    [ExerciseCategory.BICEPS]: 'secondary',
    [ExerciseCategory.TRICEPS]: 'tertiary',
    [ExerciseCategory.LEGS]: 'success',
    [ExerciseCategory.ABS]: 'medium',
    [ExerciseCategory.CARDIO]: 'medium',
  };
  return colors[category] || 'medium';
};
</script>

<style scoped>
.exercise-card {
  margin-bottom: 1rem;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.exercise-header ion-card-title {
  flex: 1;
}
</style>
