<script setup lang="ts">
import { useFirebase } from '@/composables/useFirebase';
import { type Exercise, Collections } from '@/types/firebase.types';
import { ref, watch } from 'vue';
import ExerciseListItem from './ExerciseListItem.vue';
import { IonCard, IonCardContent, IonIcon, IonList, IonSpinner } from '@ionic/vue';
import { trendingUpOutline } from 'ionicons/icons';

const props = defineProps<{
  exercise: Exercise,
}>();

const exercises = ref<Exercise[]>([]);
const loading = ref(false);
const { getAll } = useFirebase<Exercise>(Collections.EXERCISES);
const DOCUMENT_ID_IN_LIMIT = 30;
let requestId = 0;

const fetchSimilarExercises = async () => {
  const currentRequestId = ++requestId;
  const similarIds = [...new Set(props.exercise.similar ?? [])].filter(Boolean);

  if (similarIds.length === 0) {
    exercises.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;

  try {
    const batches = await Promise.all(
      Array.from(
        { length: Math.ceil(similarIds.length / DOCUMENT_ID_IN_LIMIT) },
        (_, index) => similarIds.slice(index * DOCUMENT_ID_IN_LIMIT, (index + 1) * DOCUMENT_ID_IN_LIMIT)
      ).map(ids => getAll({
        where: [{ field: 'documentId', operator: 'in', value: ids }]
      }))
    );

    if (currentRequestId === requestId) {
      const exercisesById = new Map(
        batches.flat().map(exercise => [exercise.id, exercise])
      );

      exercises.value = similarIds
        .map(id => exercisesById.get(id))
        .filter(Boolean) as Exercise[];
    }
  } catch (e) {
    console.error("Error fetching similar exercises", e);
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
    }
  }
};

watch(
  () => props.exercise.similar,
  fetchSimilarExercises,
  { immediate: true }
);
</script>

<template>
  <div v-if="loading" class="ion-text-center ion-padding">
    <IonSpinner />
  </div>
  <IonList v-else-if="exercises.length > 0" lines="full">
    <ExerciseListItem v-for="ex in exercises" :key="ex.id" :exercise="ex" />
  </IonList>
  <IonCard v-else>
    <IonCardContent class="ion-text-center">
      <IonIcon :icon="trendingUpOutline" size="lg"></IonIcon>
      <p>No similar exercises found.</p>
    </IonCardContent>
  </IonCard>
</template>
