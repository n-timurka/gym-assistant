<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/exercises"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" v-if="exercise">
      <!-- Media Section -->
      <div class="media-container">
        <div v-if="exercise.videoUrl" class="video-container">
          <!-- Placeholder for video player -->
          <div class="media-placeholder">
            <ion-icon :icon="playCircleOutline" size="large"></ion-icon>
            <p>Video Preview</p>
          </div>
        </div>
        <ExerciseImage :exercise-id="exercise.extId" size="lg" />

        <div class="badges">
          <ExerciseCategoryLabel :category="exercise.category" />
          <ExerciseTypeLabel :type="exercise.type" />
        </div>
      </div>

      <div class="ion-padding">
        <!-- Header Info -->
        <div class="header-info">
          <h1>{{ exercise.name }}</h1>
        </div>

        <!-- Tabs -->
        <ion-segment v-model="selectedTab">
          <ion-segment-button value="description">
            <ion-label>Description</ion-label>
          </ion-segment-button>
          <ion-segment-button value="progress">
            <ion-label>Progress</ion-label>
          </ion-segment-button>
          <ion-segment-button value="similar">
            <ion-label>Similar</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Tab Content -->
        <div v-if="selectedTab === 'description'" class="tab-content">
          <ion-card>
            <ion-card-content>
              <!-- Description Section -->
              <div v-if="exercise.description" class="section ion-margin-bottom">
                <h3>Description</h3>
                <p>{{ exercise.description }}</p>
              </div>

              <!-- Muscles Section -->
              <div v-if="(exercise.primaryMuscles && exercise.primaryMuscles.length) || (exercise.secondaryMuscles && exercise.secondaryMuscles.length)" class="section ion-margin-bottom">
                <h3>Muscles</h3>
                <div v-if="exercise.primaryMuscles && exercise.primaryMuscles.length">
                    <p class="subtitle">
                      Primary:
                      <strong>
                          {{ exercise.primaryMuscles.join(', ') }}
                        </strong>
                    </p>
                </div>
                <div v-if="exercise.secondaryMuscles && exercise.secondaryMuscles.length" class="ion-margin-top">
                    <p class="subtitle">
                      Secondary:
                      <strong>
                          {{ exercise.secondaryMuscles.join(', ') }}
                        </strong>
                    </p>
                </div>
              </div>

              <!-- How To Section -->
              <div v-if="exercise.howTo && exercise.howTo.length" class="section">
                <h3>How To</h3>
                <ol class="how-to-list">
                    <li v-for="(step, index) in exercise.howTo" :key="index">
                        {{ step }}
                    </li>
                </ol>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <div v-if="selectedTab === 'progress'" class="tab-content">
          <!-- Current Weight Section -->
          <ion-card v-if="progressRecords.length > 0">
            <ion-card-header>
              <ion-card-title>{{ isCardio ? 'Best Time' : 'Current Weight' }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="current-weight">
                <h2>{{ currentWeight }} {{ isCardio ? 'min' : 'kg' }}</h2>
                <p class="weight-date">
                  {{ isCardio ? 'Best Time' : 'Current Weight' }} • Last updated: {{ formatDate(currentWeightDate) }}
                </p>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Progress History Table -->
          <ion-card v-if="progressRecords.length > 0">
            <ion-card-header>
              <ion-card-title>Progress History</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item v-for="record in progressRecords" :key="record.id" lines="full">
                  <ion-label>
                    <h3>{{ formatDate(record.date) }}</h3>
                  </ion-label>
                  <ion-note slot="end" class="weight-value">{{ record.weight }} {{ isCardio ? 'min' : 'kg' }}</ion-note>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Empty State -->
          <ion-card v-if="progressRecords.length === 0 && !progressLoading">
            <ion-card-content class="ion-text-center">
              <ion-icon :icon="trendingUpOutline" class="large-icon"></ion-icon>
              <h3>No Progress Yet</h3>
              <p>Start tracking your progress by completing workouts with this exercise.</p>
            </ion-card-content>
          </ion-card>

          <!-- Loading State -->
          <ion-card v-if="progressLoading">
            <ion-card-content class="ion-text-center">
              <ion-spinner></ion-spinner>
              <p>Loading progress data...</p>
            </ion-card-content>
          </ion-card>
        </div>

        <div v-if="selectedTab === 'similar'" class="tab-content">
          <SimilarExercisesList :exercise="exercise" />
        </div>

      </div>
    </ion-content>
    
    <ion-content v-else-if="loading" class="ion-padding ion-text-center">
      <ion-spinner></ion-spinner>
    </ion-content>
    
    <ion-content v-else class="ion-padding ion-text-center">
      <p>Exercise not found</p>
      <ion-button router-link="/tabs/exercises">Go Back</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSpinner,
  IonList,
  IonItem,
  IonNote,
} from '@ionic/vue';
import { 
  playCircleOutline,
  trendingUpOutline 
} from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { useAuth } from '@/composables/useAuth';
import { Collections, type Exercise, type Progress, ExerciseCategory } from '@/types/firebase.types';
import ExerciseImage from '@/components/ExerciseImage.vue';
import ExerciseTypeLabel from '@/components/ExerciseTypeLabel.vue';
import ExerciseCategoryLabel from '@/components/ExerciseCategoryLabel.vue';
import SimilarExercisesList from '@/components/SimilarExercisesList.vue';

const route = useRoute();
const { getById, loading, document: exercise } = useFirebase<Exercise>(Collections.EXERCISES);
const { currentUser } = useAuth();
const { 
  getAll: getProgressRecords, 
  loading: progressLoading, 
  documents: progressRecords 
} = useFirebase<Progress>(Collections.PROGRESS);
const selectedTab = ref('description');
const imageError = ref(false);

// Reset image error when exercise changes
watch(() => route.params.id, () => {
  imageError.value = false;
});

// Check if cardio
const isCardio = computed(() => {
  return exercise.value?.category === ExerciseCategory.CARDIO;
});

// Computed property for current weight (Active record)
const currentWeight = computed(() => {
  if (progressRecords.value.length === 0) return 0;
  
  if (isCardio.value) {
    // For cardio, find the max value (best time)
    return Math.max(...progressRecords.value.map(r => r.weight));
  }
  
  // For lifting, usually the most recent record reflects current strength
  return progressRecords.value[0].weight;
});

// Computed property for current weight date
const currentWeightDate = computed(() => {
  if (progressRecords.value.length === 0) return new Date();
  
  if (isCardio.value) {
    // Find the date of the max value
    const maxVal = Math.max(...progressRecords.value.map(r => r.weight));
    const record = progressRecords.value.find(r => r.weight === maxVal);
    return record ? record.date : new Date();
  }
  
  return progressRecords.value[0].date;
});

/**
 * Format date to user-friendly string
 */
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Fetch progress records for the current exercise and user
 */
const fetchProgressRecords = async (exerciseId: string) => {
  if (!currentUser.value) return;
  
  await getProgressRecords({
    where: [
      { field: 'userId', operator: '==', value: currentUser.value.uid },
      { field: 'exerciseId', operator: '==', value: exerciseId }
    ]
  });
  
  // Sort in memory
  progressRecords.value.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
    const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
    return dateB - dateA;
  });
};

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await getById(id);
    await fetchProgressRecords(id);
  }
});
</script>

<style scoped>
.media-container {
  position: relative;
  width: 100%;
  height: 250px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ion-color-medium);
  gap: 0.5rem;
}

.media-container__label {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.header-info {
  margin-bottom: 1.5rem;
}

.header-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.badges {
  position: absolute;
  right: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.large-icon {
  font-size: 3rem;
  color: var(--ion-color-primary);
  margin-bottom: 1rem;
}

.meta-info p {
  margin: 0.5rem 0;
}

.current-weight {
  text-align: center;
  padding: 1rem 0;
}

.current-weight h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin: 0;
}

.weight-date {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.weight-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.exercise-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* New Styles */
.section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--ion-color-dark);
}

.section p {
    color: var(--ion-color-medium-shade);
    line-height: 1.5;
}

.subtitle {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: var(--ion-color-medium);
}

.chip-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.how-to-list {
    padding-left: 1.25rem;
    margin-top: 0.5rem;
    color: var(--ion-color-medium-shade);
}

.how-to-list li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}
</style>
