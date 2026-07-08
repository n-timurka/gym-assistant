<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Exercise } from '@/types/firebase.types';
import { IonItem, IonLabel, IonThumbnail } from '@ionic/vue';
import ExerciseImage from './ExerciseImage.vue';
import ExerciseCategoryLabel from './ExerciseCategoryLabel.vue';
import ExerciseTypeLabel from './ExerciseTypeLabel.vue';

const { exercise, displayCategory = true, isLink = true } = defineProps<{
  exercise: Exercise,
  displayCategory?: boolean,
  isLink?: boolean,
}>();

const router = useRouter();
const doNavigate = () => {
  if (!isLink) return;

  router.push(`/exercises/${exercise.id}`);
}
</script>

<template>
  <IonItem button detail @click="doNavigate">
    <IonThumbnail slot="start">
      <ExerciseImage size="xs" :exercise-id="exercise.extId" />
    </IonThumbnail>

    <IonLabel>
      <h2>{{ exercise.name }}</h2>
      <div>
        <ExerciseCategoryLabel v-if="displayCategory" :category="exercise.category" size="sm" />
        <ExerciseTypeLabel :type="exercise.type" size="sm" />
      </div>
    </IonLabel>
  </IonItem>
</template>
