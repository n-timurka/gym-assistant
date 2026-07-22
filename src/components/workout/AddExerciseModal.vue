<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonLabel,
  IonContent,
  IonList,
  IonSearchbar,
  IonListHeader,
  IonChip
} from '@ionic/vue';
import { addCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Exercise, ExerciseCategory } from '@/types/firebase.types';
import ExerciseListItem from '@/components/ExerciseListItem.vue';

const props = defineProps<{
  isOpen: boolean;
  plannedExercises?: Exercise[];
  allExercises?: Exercise[]; // Pass all exercises to filter visually here
  isExerciseInWorkout: (id: string | number) => boolean;
  completedExerciseIds?: Set<string>;
  currentExerciseId?: string | null;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'add-exercise', id: string): void;
}>();

const searchQuery = ref('');
const categories = Object.values(ExerciseCategory);
const selectedCategory = ref(ExerciseCategory.CHEST);

const selectCategory = (category: ExerciseCategory) => {
  if (selectedCategory.value === category) return;

  selectedCategory.value = category;
}
9
const categoryExercises = computed(
  () => props.allExercises?.filter(e => e.category === selectedCategory.value)
);
</script>

<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <IonSearchbar v-model="searchQuery" placeholder="Search exercises..." />

      <IonToolbar>
        <IonChip
          v-for="category in categories"
          :key="category"
          :outline="selectedCategory !== category"
          @click="selectCategory(category)">
          {{ category }}
        </IonChip>
      </IonToolbar>

      <ion-list class="ion-padding-horizontal">
        <ion-list-header>
          <ion-label>{{ selectedCategory }}</ion-label>
        </ion-list-header>
        <ExerciseListItem
          v-for="ex in categoryExercises"
          :key="ex.id"
          :exercise="ex"
          :display-category="false"
          :detailIcon="isExerciseInWorkout(ex.id) ? checkmarkCircleOutline : addCircleOutline"
          :is-link="false"
          @click="emits('add-exercise', ex.id)"/>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.disabled-exercise {
  opacity: 0.5;
}
.already-done-text {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    font-style: italic;
}
</style>
