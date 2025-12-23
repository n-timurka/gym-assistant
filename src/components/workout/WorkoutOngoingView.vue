<template>
  <div class="workout-ongoing-view h-full flex flex-col">
    <div v-if="currentExercise" class="exercise-focus-container flex flex-col h-full">
      
       <!-- Progress Bar -->
       <div class="progress-section ion-padding-horizontal">
          <div class="progress-label">
             <span>Progress</span>
             <span>{{ Math.round(workoutProgress * 100) }}%</span>
          </div>
          <ion-progress-bar :value="workoutProgress" color="success"></ion-progress-bar>
       </div>

      <!-- Navigation Header -->
      <div class="navigation-header ion-padding-horizontal ion-padding-top">
        <ion-button fill="clear" :disabled="currentExerciseIndex === 0" @click="prevExercise">
          <ion-icon slot="icon-only" :icon="chevronBackOutline"></ion-icon>
        </ion-button>
        
        <div class="exercise-title-container">
           <h2 class="ion-text-center ion-no-margin">{{ getExerciseName(currentExercise.exerciseId) }}</h2>
           <ion-text color="medium" class="ion-text-center text-xs">
            {{ currentExerciseIndex + 1 }} of {{ exercises.length }}
           </ion-text>
        </div>

        <ion-button fill="clear" :disabled="currentExerciseIndex === exercises.length - 1" @click="nextExercise">
          <ion-icon slot="icon-only" :icon="chevronForwardOutline"></ion-icon>
        </ion-button>
      </div>

      <!-- Exercise Content -->
      <div class="exercise-content ion-padding flex-grow overflow-y-auto">
        <!-- Image & Description -->
        <div class="media-container ion-margin-bottom">
           <div v-if="hasImage(currentExercise.exerciseId)" class="exercise-image-container relative">
             <div class="exercise-badges-overlay">
               <ion-badge color="primary" class="category-badge">
                 {{ getExerciseCategory(currentExercise.exerciseId) }}
               </ion-badge>
               <ion-badge color="secondary" class="type-badge">
                 {{ getExerciseType(currentExercise.exerciseId) }}
               </ion-badge>
             </div>
             <img 
              :src="getExercisePicture(currentExercise.exerciseId)" 
              alt="Exercise Image" 
              class="exercise-image" 
              @error="handleImageError"
             />
           </div>
           <div v-else class="exercise-image-container relative">
             <div class="exercise-badges-overlay">
               <ion-badge color="primary" class="category-badge">
                 {{ getExerciseCategory(currentExercise.exerciseId) }}
               </ion-badge>
               <ion-badge color="secondary" class="type-badge">
                 {{ getExerciseType(currentExercise.exerciseId) }}
               </ion-badge>
             </div>
             <div class="media-placeholder">
              <ion-icon :icon="imageOutline" size="large"></ion-icon>
              <p>No Image Available</p>
             </div>
           </div>
        </div>

        <!-- Segments -->
        <div class="exercise-details ion-margin-bottom">
            <ion-segment v-model="selectedTab" mode="ios">
                <ion-segment-button value="sets">
                    <ion-label>Sets</ion-label>
                </ion-segment-button>
                <ion-segment-button value="info">
                    <ion-label>Info</ion-label>
                </ion-segment-button>
            </ion-segment>

            <!-- Sets Tab -->
            <div v-if="selectedTab === 'sets'">
                <workout-exercise-card
                  :key="currentExercise.exerciseId"
                  :exercise="currentExercise"
                  :exercise-name="getExerciseName(currentExercise.exerciseId)"
                  :exercise-category="getExerciseCategory(currentExercise.exerciseId)"
                  :is-workout-started="true"
                  :show-header="false"
                  :show-delete="false"
                  :show-reorder="false"
                  @add-set="$emit('add-set', currentExerciseIndex)"
                  @remove-set="(setIndex) => $emit('remove-set', currentExerciseIndex, setIndex)"
                  @update-set="handleSetUpdate"
                  @timer-requested="$emit('timer-requested')"
                ></workout-exercise-card>
            </div>

            <!-- Info Tab (Combined) -->
            <div v-if="selectedTab === 'info'" class="info-container">
                 <!-- Description -->
                <div class="detail-section">
                    <p class="description ion-no-margin">
                        {{ getExerciseDescription(currentExercise.exerciseId) }}
                    </p>
                </div>

                <!-- Muscles -->
                <div class="detail-section" v-if="getExercisePrimaryMuscles(currentExercise.exerciseId)?.length || getExerciseSecondaryMuscles(currentExercise.exerciseId)?.length">
                    <h3 class="detail-title">Target Muscles</h3>
                     <div class="muscles-list">
                        <span v-for="muscle in getExercisePrimaryMuscles(currentExercise.exerciseId)" :key="'p-'+muscle" class="muscle-tag primary">
                            {{ muscle }}
                        </span>
                        <span v-for="muscle in getExerciseSecondaryMuscles(currentExercise.exerciseId)" :key="'s-'+muscle" class="muscle-tag secondary">
                            {{ muscle }}
                        </span>
                    </div>
                </div>

                <!-- How To -->
                <div class="detail-section">
                    <h3 class="detail-title">How To</h3>
                    <ol v-if="getExerciseHowTo(currentExercise.exerciseId)?.length" class="instruction-list">
                        <li v-for="(step, idx) in getExerciseHowTo(currentExercise.exerciseId)" :key="idx">
                            {{ step }}
                        </li>
                    </ol>
                     <div v-else class="ion-text-center text-muted text-sm italic">
                        No instructions available
                    </div>
                </div>

                <!-- Tips -->
                <div class="detail-section">
                    <h3 class="detail-title">Tips</h3>
                     <ul v-if="getExerciseTips(currentExercise.exerciseId)?.length" class="tips-list">
                        <li v-for="(tip, idx) in getExerciseTips(currentExercise.exerciseId)" :key="idx">
                            {{ tip }}
                        </li>
                    </ul>
                    <div v-else class="ion-text-center text-muted text-sm italic">
                        No tips available
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Bottom Actions Menu -->
      <div class="bottom-actions-menu">
        <ion-button expand="block" fill="outline" @click="openExerciseActions">
            <ion-icon slot="start" :icon="ellipsisHorizontalOutline"></ion-icon>
            Exercise Options
        </ion-button>
      </div>

    </div>

    <div v-else class="empty-state ion-padding">
      <p>No exercises in this workout.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  IonButton,
  IonIcon,
  IonProgressBar,
  IonBadge,
  actionSheetController,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonText,
} from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline, swapHorizontalOutline, addCircleOutline, imageOutline, trashOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import WorkoutExerciseCard from '@/components/workout/WorkoutExerciseCard.vue';
import { WorkoutExercise, Exercise } from '@/types/firebase.types';

const props = defineProps<{
  exercises: WorkoutExercise[];
  allExercises: Exercise[];
  completedExercisesCount: number;
  totalExercisesCount: number;
  workoutProgress: number;
}>();

const emit = defineEmits<{
  (e: 'add-set', index: number): void;
  (e: 'remove-set', index: number, setIndex: number): void;
  (e: 'update-set'): void;
  (e: 'timer-requested'): void;
  (e: 'swap-exercise', index: number): void;
  (e: 'open-add-modal'): void;
  (e: 'delete-exercise', index: number): void;
}>();

const currentExerciseIndex = ref(0);
const imageErrorMap = ref<Record<string, boolean>>({});
const selectedTab = ref('sets');

// Watch for changes in exercises list to keep index valid
watch(() => props.exercises.length, (newLength) => {
    if (currentExerciseIndex.value >= newLength) {
        currentExerciseIndex.value = Math.max(0, newLength - 1);
    }
});

const currentExercise = computed(() => {
  if (!props.exercises || props.exercises.length === 0) return null;
  // Safety check in case index is briefly out of bounds
  if (currentExerciseIndex.value >= props.exercises.length) {
      return props.exercises[props.exercises.length - 1];
  }
  return props.exercises[currentExerciseIndex.value];
});

const getExerciseName = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex ? ex.name : 'Unknown Exercise';
};

const getExerciseCategory = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex ? ex.category : undefined;
};

const getExercisePicture = (id: string) => {
  const ex = props.allExercises.find(e => String(e.id) === String(id));
  return ex?.picture ? ex.picture : `/assets/exercises/${ex?.extId}.png`;
};

const hasImage = (id: string) => {
    if (imageErrorMap.value[id]) return false;
    return true; // Simplified, assume exists unless error
};

const handleImageError = (e: Event) => {
    if (currentExercise.value) {
        imageErrorMap.value[currentExercise.value.exerciseId] = true;
    }
};

const getExerciseDescription = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.description || '';
}

const getExerciseType = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex ? ex.type : undefined;
};

const getExerciseHowTo = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.howTo;
};

const getExercisePrimaryMuscles = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.primaryMuscles;
};

const getExerciseSecondaryMuscles = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.secondaryMuscles;
};

const getExerciseTips = (id: string) => {
    const ex = props.allExercises.find(e => String(e.id) === String(id));
    return ex?.tips;
};

const openExerciseActions = async () => {
    const actionSheet = await actionSheetController.create({
        header: 'Exercise Options',
        buttons: [
            {
                text: 'Add Exercise',
                icon: addCircleOutline,
                handler: () => {
                    emit('open-add-modal');
                }
            },
            {
                text: 'Swap Exercise',
                icon: swapHorizontalOutline,
                handler: () => {
                   emit('swap-exercise', currentExerciseIndex.value);
                }
            },
            {
                text: 'Delete Exercise',
                icon: trashOutline,
                role: 'destructive',
                handler: () => {
                    emit('delete-exercise', currentExerciseIndex.value);
                }
            },
            {
                text: 'Cancel',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
};


const prevExercise = () => {
  if (currentExerciseIndex.value > 0) {
    currentExerciseIndex.value--;
  }
};

const nextExercise = () => {
  if (currentExerciseIndex.value < props.exercises.length - 1) {
    currentExerciseIndex.value++;
  }
};

const handleSetUpdate = () => {
  emit('update-set');
  checkAllSetsCompleted();
};

const checkAllSetsCompleted = () => {
  if (currentExercise.value) {
    const allCompleted = currentExercise.value.sets.every(s => s.isCompleted);
    if (allCompleted && currentExerciseIndex.value < props.exercises.length - 1) {
      // Auto-advance with a slight delay for better UX
      setTimeout(() => {
        // Double check in case user unchecked quickly
        if (currentExercise.value?.sets.every(s => s.isCompleted)) {
            nextExercise();
        }
      }, 500);
    }
  }
};

</script>

<style scoped>
.navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exercise-title-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exercise-title-container h2 {
    font-size: 1.2rem;
    font-weight: 700;
}

.exercise-image-container {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--ion-color-light);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exercise-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ion-color-medium);
  gap: 0.5rem;
}

.description {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  margin-top: 8px;
}

.text-xs {
    font-size: 0.75rem;
  }
  
.progress-section {
  padding-top: 12px; /* Added some top padding */
}
  
.progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.bottom-actions-menu {
    border-top: 1px solid var(--ion-color-light);
    background: var(--ion-background-color);
    padding: 10px;
}

.exercise-image-container.relative {
    position: relative;
}

.exercise-badges-overlay {
    position: absolute;
    top: 12px; /* Adjust to match padding/margin of container */
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
    pointer-events: none; /* Let clicks pass through to image if needed */
    z-index: 10;
}

/* Custom Segment Styling to remove padding */
ion-segment-button {
    --padding-start: 0;
    --padding-end: 0;
    min-height: 40px;
}

.detail-section {
    margin-bottom: 1rem;
    background: var(--ion-color-light);
    padding: 1rem;
    border-radius: 8px;
}

.detail-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: var(--ion-color-dark);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.muscles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.muscle-tag {
    font-size: 0.8rem;
    padding: 4px 8px;
    border-radius: 4px;
}

.muscle-tag.primary {
    background: var(--ion-color-primary);
    color: var(--ion-color-primary-contrast);
}

.muscle-tag.secondary {
    background: var(--ion-color-light-shade);
    color: var(--ion-color-dark);
    border: 1px solid var(--ion-color-medium);
}

.instruction-list, .tips-list {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.9rem;
    color: var(--ion-color-step-700);
}

.instruction-list li, .tips-list li {
    margin-bottom: 0.25rem;
}
</style>
