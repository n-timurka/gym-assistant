<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkoutDetail } from '@/composables/useWorkoutDetail';
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
import { addCircleOutline } from 'ionicons/icons';
import { ExerciseCategory } from '@/types/firebase.types';
import ExerciseListItem from '@/components/ExerciseListItem.vue';

const { exercises, isPickerOpen: isOpen, isSwapping, closePicker, isExerciseInWorkout } = useWorkoutDetail();
const emit = defineEmits<{
  (e: 'add-exercise', id: string): void;
}>();

const searchQuery = ref('');
const categories = Object.values(ExerciseCategory);
const selectedCategory = ref(ExerciseCategory.CHEST);

const selectCategory = (category: ExerciseCategory) => {
  if (selectedCategory.value === category) return;

  selectedCategory.value = category;
}
const categoryExercises = computed(
  () => exercises.value?.filter(e => e.category === selectedCategory.value)
);

const handleAddExercise = (id: string) => {
  emit('add-exercise', id);
  closePicker();
};
</script>

<template>
  <ion-modal
    :isOpen="isOpen"
    @did-dismiss="closePicker"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isSwapping ? 'Swap Exercise' : 'Add Exercise' }}</ion-title>
        <template #end>
          <ion-buttons>
            <ion-button @click="closePicker">
              Close
            </ion-button>
          </ion-buttons>
        </template>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Search exercises..."
      />

      <ion-toolbar>
        <ion-chip
          v-for="category in categories"
          :key="category"
          :outline="selectedCategory !== category"
          @click="selectCategory(category)"
        >
          {{ category }}
        </ion-chip>
      </ion-toolbar>

      <ion-list class="ion-padding-horizontal">
        <ion-list-header>
          <ion-label>{{ selectedCategory }}</ion-label>
        </ion-list-header>
        <exercise-list-item
          v-for="ex in categoryExercises"
          :key="ex.id"
          :exercise="ex"
          :displayCategory="false"
          :detailIcon="addCircleOutline"
          :isLink="false"
          :disabled="isExerciseInWorkout(ex.id)"
          @click="handleAddExercise(ex.id)"
        />
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
