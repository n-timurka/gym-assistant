<template>
  <ion-card class="exercise-card">
    <ion-card-header v-if="showHeader" class="card-header" :class="{ 'clickable': isCollapsible }" @click="toggleCollapse">
      <div class="exercise-header">
        <ion-reorder v-if="showReorder"></ion-reorder>
        <ion-card-title class="exercise-title">
          {{ exerciseName }}
        </ion-card-title>
        <div class="header-actions">
          <!-- Delete removed from here -->
          <ion-icon v-if="isCollapsible" :icon="isCollapsed ? chevronDownOutline : chevronUpOutline" class="collapse-icon"></ion-icon>
        </div>
      </div>
    </ion-card-header>
    
    <ion-card-content v-show="!isCollapsed">
      <!-- Info Block -->
      <div class="info-block ion-margin-bottom">
        <div class="info-image-container">
            <img v-if="!imageError && exerciseImage" :src="exerciseImage" @error="imageError = true" class="info-image" />
            <div v-else class="placeholder-image">
                <ion-icon :icon="imageOutline"></ion-icon>
            </div>
        </div>
        <div class="info-description">
            <p v-if="exerciseDescription">{{ exerciseDescription }}</p>
            <p v-else class="text-muted italic">No description available</p>
        </div>
      </div>

      <!-- Sets Header -->
      <div class="sets-header" :class="{ 'cardio-header': isCardio }">
        <span>Set</span>
        <span>{{ isCardio ? 'Time (min)' : 'kg' }}</span>
        <span v-if="!isCardio">Reps</span>
        <span v-if="isWorkoutStarted">Done</span>
      </div>

      <!-- Sets List -->
      <div v-for="(set, setIndex) in exercise.sets" :key="setIndex" class="set-row" :class="{ 'cardio-row': isCardio }">
        <div class="set-number">{{ setIndex + 1 }}</div>
        <ion-input 
          type="number" 
          v-model.number="set.weight" 
          :placeholder="isCardio ? '0' : '0'"
          class="set-input"
          @ionChange="$emit('update-set')"
        ></ion-input>
        <ion-input 
          v-if="!isCardio"
          type="number" 
          v-model.number="set.reps" 
          placeholder="0"
          class="set-input"
          @ionChange="$emit('update-set')"
        ></ion-input>
        <ion-checkbox 
          v-if="isWorkoutStarted"
          v-model="set.isCompleted"
          @ionChange="handleCompletion(set)"
        ></ion-checkbox>
        <ion-button v-if="!isCardio" fill="clear" color="danger" size="small" @click="$emit('remove-set', setIndex)">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </div>

      <!-- Add Set Button -->
      <ion-button v-if="!isCardio" expand="block" fill="clear" size="small" @click="$emit('add-set')">
        + Add Set
      </ion-button>

      <!-- Delete Exercise Button (Bottom) -->
      <div v-if="showDelete" class="delete-section ion-margin-top">
        <ion-button expand="block" fill="outline" color="danger" @click.stop="$emit('delete-exercise')">
            <ion-icon slot="start" :icon="trashOutline"></ion-icon>
            Delete Exercise
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonReorder,
  IonButton,
  IonIcon,
  IonInput,
  IonCheckbox
} from '@ionic/vue';
import { trashOutline, closeOutline, chevronDownOutline, chevronUpOutline, imageOutline } from 'ionicons/icons';
import { WorkoutExercise, ExerciseSet, ExerciseCategory } from '@/types/firebase.types';

const props = withDefaults(defineProps<{
  exercise: WorkoutExercise;
  exerciseName: string;
  exerciseImage?: string;
  exerciseDescription?: string;
  isWorkoutStarted: boolean;
  exerciseCategory?: ExerciseCategory;
  showHeader?: boolean;
  showDelete?: boolean;
  showReorder?: boolean;
  isCollapsible?: boolean;
}>(), {
  showHeader: true,
  showDelete: true,
  showReorder: true,
  isCollapsible: false
});

const emit = defineEmits<{
  (e: 'delete-exercise'): void;
  (e: 'add-set'): void;
  (e: 'remove-set', index: number): void;
  (e: 'update-set'): void;
  (e: 'timer-requested'): void;
}>();

const isCollapsed = ref(props.isCollapsible);
const imageError = ref(false);

const toggleCollapse = () => {
  if (props.isCollapsible) {
    isCollapsed.value = !isCollapsed.value;
  }
};

const isCardio = computed(() => props.exerciseCategory === ExerciseCategory.CARDIO);

const handleCompletion = (set: ExerciseSet) => {
  emit('update-set');
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
