<template>
  <ion-card class="exercise-card">
    <ion-card-content>
      <!-- Sets Header -->
      <div class="sets-header" :class="{ 'cardio-header': isCardio }">
        <span>Set</span>
        <span>{{ isCardio ? 'Time (min)' : 'kg' }}</span>
        <span v-if="!isCardio">Reps</span>
        <span>Done</span>
      </div>

      <!-- Sets List -->
      <div
        v-for="(set, setIndex) in exercise.sets"
        :key="setIndex"
        class="set-row"
        :class="{ 'cardio-row': isCardio }">
        <div class="set-number">{{ setIndex + 1 }}</div>
        <ion-input 
          type="number" 
          v-model.number="set.weight" 
          :placeholder="isCardio ? '0' : '0'"
          class="set-input"
          @ionChange="$emit('update-set')"
        />
        <ion-input 
          v-if="!isCardio"
          type="number" 
          v-model.number="set.reps" 
          placeholder="0"
          class="set-input"
          @ionChange="$emit('update-set')"
        />
        <ion-checkbox 
          v-model="set.isCompleted"
          @ionChange="handleCompletion(set)"
        />
        <ion-button v-if="!isCardio" fill="clear" color="danger" size="small" @click="$emit('remove-set', setIndex)">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </div>

      <!-- Add Set Button -->
      <ion-button v-if="!isCardio" expand="block" fill="clear" size="small" @click="$emit('add-set')">
        + Add Set
      </ion-button>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonInput,
  IonCheckbox
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { WorkoutExercise, ExerciseSet, ExerciseCategory } from '@/types/firebase.types';

const { exercise } = defineProps<{
  exercise: WorkoutExercise;
}>();

const emit = defineEmits<{
  (e: 'add-set'): void;
  (e: 'remove-set', index: number): void;
  (e: 'update-set', set: ExerciseSet): void;
  (e: 'timer-requested'): void;
}>();

const isCardio = computed(() => exercise.exercise?.category === ExerciseCategory.CARDIO);

const handleCompletion = (set: ExerciseSet) => {
  emit('update-set', set);
  if (set.isCompleted) {
    emit('timer-requested');
  }
};
</script>

<style scoped>
.exercise-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.card-header.clickable {
  cursor: pointer;
}

.card-header.clickable:active {
  opacity: 0.7;
}

.header-actions {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 1.2rem;
  color: var(--ion-color-medium);
  margin-left: 8px;
}

.exercise-title {
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

/* Info Block Styles */
.info-block {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.info-image-container {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: var(--ion-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder-image {
    color: var(--ion-color-medium);
    font-size: 2rem;
}

.info-description {
    font-size: 0.9rem;
    color: var(--ion-color-medium);
    line-height: 1.4;
}

.text-muted {
    color: var(--ion-color-medium);
}
.italic {
    font-style: italic;
}

.sets-header {
  display: grid;
  grid-template-columns: 30px 1fr 1fr 40px 30px;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  text-align: center;
  padding-right: 10px; /* Align with inputs */
}

.sets-header.cardio-header {
  grid-template-columns: 30px 1fr 40px;
}

.set-row {
  display: grid;
  grid-template-columns: 30px 1fr 1fr 40px 30px;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.set-row.cardio-row {
  grid-template-columns: 30px 1fr 40px;
}

.set-number {
  text-align: center;
  font-weight: 500;
  color: var(--ion-color-medium);
}

.set-input {
  --padding-start: 8px;
  --padding-end: 8px;
  text-align: center;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.delete-section {
    border-top: 1px solid var(--ion-color-light);
    padding-top: 1rem;
}
</style>
