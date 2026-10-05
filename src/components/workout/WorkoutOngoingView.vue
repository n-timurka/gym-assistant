<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import {
  IonButton,
  IonIcon,
  IonProgressBar,
  actionSheetController,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonText,
} from '@ionic/vue';
import {
  chevronBackOutline,
  chevronForwardOutline,
  swapHorizontalOutline,
  addCircleOutline, 
  trashOutline,
  ellipsisHorizontalOutline,
} from 'ionicons/icons';
import WorkoutExerciseCard from '@/components/workout/WorkoutExerciseCard.vue';
import { ExerciseSet, type WorkoutExercise } from '@/types/firebase.types';
import ExerciseImage from '@/components/ExerciseImage.vue';
import ExerciseCategoryLabel from '@/components/ExerciseCategoryLabel.vue';
import ExerciseTypeLabel from '@/components/ExerciseTypeLabel.vue';
import SwiperClass from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';

 const { exercises } = defineProps<{
  exercises: WorkoutExercise[];
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

const swiperInstance = shallowRef<SwiperClass|null>(null);
const currentExerciseIndex = ref(0);
const currentExercise = computed(() => exercises[currentExerciseIndex.value]);
const selectedTab = ref('sets');

onMounted(() => {
  currentExerciseIndex.value = Number(localStorage.getItem('CurrentExerciseIndex')) || 0;
});

const onSlideChange = (swiper: SwiperClass) => {
  currentExerciseIndex.value = swiper.activeIndex;
  localStorage.setItem('CurrentExerciseIndex', String(currentExerciseIndex.value));
};
const onSwiperInit = (swiper: SwiperClass) => {
  swiperInstance.value = swiper;
  swiperInstance.value.activeIndex = Number(localStorage.getItem('CurrentExerciseIndex')) || 0;
};
const goNext = () => {
  swiperInstance.value?.slideNext();
};
const goPrev = () => {
  swiperInstance.value?.slidePrev();
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
    ],
  });

  await actionSheet.present();
};

const handleSetUpdate = (set: ExerciseSet) => {
  if (set.isCompleted) {
    goNext();
  }
  emit('update-set');
};
</script>

<template>
  <div class="workout-ongoing-view h-full flex flex-col">
    <div class="exercise-focus-container flex flex-col h-full">
      <!-- Progress Bar -->
      <div class="progress-section ion-padding-horizontal">
        <div class="progress-label">
          <span>Progress</span>
          <span>{{ Math.round(workoutProgress * 100) }}%</span>
        </div>
        <IonProgressBar :value="workoutProgress" color="success" />
      </div>

      <!-- Exercises navigation -->
      <div class="navigation-header ion-padding-horizontal ion-padding-top">
        <IonButton fill="clear" @click="goPrev">
          <IonIcon slot="icon-only" :icon="chevronBackOutline" />
        </IonButton>

        <div class="exercise-title-container">
          <h2 class="ion-text-center ion-no-margin">
            {{ currentExercise.exercise?.name }}
          </h2>
          <IonText color="medium" class="ion-text-center text-xs">
            {{ currentExerciseIndex + 1 }} of {{ exercises.length }}
          </IonText>
        </div>

        <IonButton fill="clear" @click="goNext">
          <IonIcon slot="icon-only" :icon="chevronForwardOutline" />
        </IonButton>
      </div>

      <!-- Exercise Content -->
      <Swiper @slideChange="onSlideChange" @swiper="onSwiperInit">
        <SwiperSlide
          v-for="exercise in exercises"
          :key="exercise.exerciseId"
          class="exercise-content ion-padding flex-grow overflow-y-auto">
          <!-- Image & Description -->
          <div class="media-container">
            <div v-if="exercise.exercise" class="exercise-image-container relative">
              <div class="exercise-badges-overlay">
                <ExerciseCategoryLabel :category="exercise.exercise?.category" size="sm" />
                <ExerciseTypeLabel :type="exercise.exercise.type" />
              </div>
              <ExerciseImage :exercise-id="exercise.exercise?.extId" size="lg" />
            </div>

            <!-- Segments -->
            <div class="exercise-details">
              <IonSegment v-model="selectedTab">
                <IonSegmentButton value="sets">
                  <IonLabel>Sets</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="info">
                  <IonLabel>Info</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <!-- Sets Tab -->
              <div v-if="selectedTab === 'sets'">
                <WorkoutExerciseCard
                  :exercise="exercise"
                  @add-set="$emit('add-set', currentExerciseIndex)"
                  @remove-set="(setIndex) => $emit('remove-set', currentExerciseIndex, setIndex)"
                  @update-set="handleSetUpdate"
                  @timer-requested="$emit('timer-requested')"
                />
              </div>

              <!-- Info Tab (Combined) -->
              <div v-if="selectedTab === 'info'" class="info-container">
                <!-- Description -->
                <div class="detail-section">
                  <p class="description ion-no-margin">
                    {{ exercise.exercise?.description }}
                  </p>
                </div>

                <!-- Muscles -->
                <div
                  class="detail-section"
                  v-if="exercise.exercise?.primaryMuscles?.length || exercise.exercise?.secondaryMuscles?.length">
                  <h3 class="detail-title">Target Muscles</h3>
                  <div class="muscles-list">
                    <span v-for="muscle in exercise.exercise?.primaryMuscles" :key="'p-'+muscle" class="muscle-tag primary">
                      {{ muscle }}
                    </span>
                    <span v-for="muscle in exercise.exercise?.secondaryMuscles" :key="'s-'+muscle" class="muscle-tag secondary">
                      {{ muscle }}
                    </span>
                  </div>
                </div>

                <!-- How To -->
                <div class="detail-section">
                  <h3 class="detail-title">How To</h3>
                  <ol v-if="exercise.exercise?.howTo?.length" class="instruction-list">
                    <li v-for="(step, idx) in exercise.exercise?.howTo" :key="idx">
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
                  <ul v-if="exercise.exercise?.tips?.length" class="tips-list">
                    <li v-for="(tip, idx) in exercise.exercise?.tips" :key="idx">
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
        </SwiperSlide>
      </Swiper>

      <!-- Bottom Actions Menu -->
      <div class="bottom-actions-menu">
        <IonButton expand="block" fill="outline" @click="openExerciseActions">
            <IonIcon slot="start" :icon="ellipsisHorizontalOutline" />
            Exercise Options
        </IonButton>
      </div>
    </div>
  </div>
</template>

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
  height: 250px;
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
    bottom: 12px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
    pointer-events: none;
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
