<script setup lang="ts">
import type { WorkoutExercise } from '@/types/firebase.types';
import ExerciseImage from '@/components/ExerciseImage.vue';
import { IonItem, IonThumbnail, IonLabel, IonIcon } from '@ionic/vue';
import { checkmarkDoneOutline } from 'ionicons/icons';
import { computed } from 'vue';

const { exercise } = defineProps<{ exercise: WorkoutExercise }>();

const completedSetsCount = computed(() => exercise.sets.filter(s => s.isCompleted).length);
const isCompleted = computed(() => completedSetsCount.value === exercise.sets.length);
</script>

<template>
  <ion-item lines="full">
    <template #start>
      <ion-thumbnail>
        <exercise-image
          :exerciseId="exercise.exercise?.extId"
          size="xs"
        />
      </ion-thumbnail>
    </template>
    <ion-label>
      <h2>{{ exercise.exercise?.name }}</h2>
      <p>{{ exercise.exercise?.category }}</p>
      <p class="sets-summary">
        {{ completedSetsCount }} / {{ exercise.sets.length }} sets
      </p>
    </ion-label>
    <template #end>
      <ion-icon
        v-if="isCompleted"
        :icon="checkmarkDoneOutline"
        color="success"
      />
    </template>
  </ion-item>
</template>


<style scoped>
.text-medium {
  color: var(--ion-color-medium);
}
.sets-summary {
    font-weight: 500;
}
</style>