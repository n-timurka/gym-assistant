<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Exercises</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="seedExercises" :disabled="loading || seeding">
            <ion-icon :icon="downloadOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- Seeding Status -->
        <ion-card v-if="seeding" color="primary">
          <ion-card-content class="seeding-status">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Seeding exercises database...</span>
          </ion-card-content>
        </ion-card>

        <!-- Success Message -->
        <ion-card v-if="seedSuccess" color="success">
          <ion-card-content>
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            Successfully processed {{ seedCount }} exercises!
          </ion-card-content>
        </ion-card>

        <!-- Error Message -->
        <ion-card v-if="error" color="danger">
          <ion-card-content>
            <p>{{ error }}</p>
          </ion-card-content>
        </ion-card>

        <!-- Search Bar with Filter Button -->
        <div class="search-filter-section">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search exercises by name"
            :debounce="300"
            show-clear-button="focus"
          ></ion-searchbar>
          <ion-button fill="clear" @click="showFilterModal = true">
            <ion-icon slot="start" :icon="funnelOutline"></ion-icon>
            <ion-badge v-if="activeFilterCount > 0" color="primary">
              {{ activeFilterCount }}
            </ion-badge>
          </ion-button>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading && !seeding" class="ion-text-center ion-padding">
          <ion-spinner></ion-spinner>
        </div>

        <!-- Empty State -->
        <ion-card v-if="!loading && filteredExercises.length === 0">
          <ion-card-content class="empty-state">
            <ion-icon :icon="barbellOutline" class="empty-icon"></ion-icon>
            <h2>No exercises found</h2>
            <p v-if="searchQuery">No exercises match "{{ searchQuery }}"</p>
            <p v-else-if="selectedCategory || selectedType">Try changing your filters</p>
            <p v-else>Click the download button to seed the exercises database</p>
          </ion-card-content>
        </ion-card>

        <!-- Exercises List -->
        <ion-list v-if="!loading && filteredExercises.length > 0">
          <ion-item
            v-for="exercise in filteredExercises"
            :key="exercise.id"
            button
            :router-link="'/exercises/' + exercise.id"
            detail
          >
            <ion-thumbnail slot="start">
              <img
                v-if="!imageErrorMap[String(exercise.id)]"
                :src="getExerciseImage(exercise)"
                alt="Exercise"
                @error="handleImageError(String(exercise.id))"
              />
              <div v-else class="placeholder-thumbnail">
                <ion-icon :icon="imageOutline"></ion-icon>
              </div>
            </ion-thumbnail>
            <ion-label>
              <h2>{{ exercise.name }}</h2>
              <div class="exercise-meta">
                <ion-chip :color="getCategoryColor(exercise.category)" size="small">
                  <ion-label>{{ exercise.category }}</ion-label>
                </ion-chip>
                <ion-badge color="light">
                  {{ exercise.type }}
                </ion-badge>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- Exercise Count -->
        <div v-if="!loading && filteredExercises.length > 0" class="exercise-count">
          Showing {{ filteredExercises.length }} exercise{{ filteredExercises.length !== 1 ? 's' : '' }}
          <span v-if="searchQuery"> matching "{{ searchQuery }}"</span>
          <span v-if="selectedCategory"> in {{ selectedCategory }}</span>
          <span v-if="selectedType"> ({{ selectedType }})</span>
        </div>
      </div>

      <!-- Filter Modal -->
      <ion-modal :is-open="showFilterModal" @didDismiss="showFilterModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Filter Exercises</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showFilterModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="ion-padding">
            <!-- Filter by Category -->
            <div class="filter-section">
              <h3>Category</h3>
              <div class="filter-chips">
                <ion-chip
                  :color="selectedCategory === null ? 'primary' : 'medium'"
                  @click="selectedCategory = null"
                >
                  <ion-label>All</ion-label>
                </ion-chip>
                <ion-chip
                  v-for="category in categories"
                  :key="category"
                  :color="selectedCategory === category ? 'primary' : 'medium'"
                  @click="selectedCategory = category"
                >
                  <ion-label>{{ category }}</ion-label>
                </ion-chip>
              </div>
            </div>

            <!-- Filter by Exercise Type -->
            <div class="filter-section">
              <h3>Exercise Type</h3>
              <div class="filter-chips">
                <ion-chip
                  :color="selectedType === null ? 'primary' : 'medium'"
                  @click="selectedType = null"
                >
                  <ion-label>All</ion-label>
                </ion-chip>
                <ion-chip
                  v-for="type in exerciseTypes"
                  :key="type"
                  :color="selectedType === type ? 'primary' : 'medium'"
                  @click="selectedType = type"
                >
                  <ion-label>{{ type }}</ion-label>
                </ion-chip>
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="filter-actions">
              <ion-button expand="block" fill="clear" @click="clearFilters">
                Clear Filters
              </ion-button>
              <ion-button expand="block" @click="showFilterModal = false">
                Apply Filters
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonIcon,
  IonChip,
  IonLabel,
  IonBadge,
  IonButton,
  IonButtons,
  IonSearchbar,
  IonList,
  IonItem,
  IonModal,
  IonThumbnail,
  alertController
} from '@ionic/vue';
import {
  barbellOutline,
  downloadOutline,
  checkmarkCircleOutline,
  funnelOutline,
  imageOutline
} from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { Collections, type Exercise, ExerciseCategory, ExerciseType } from '@/types/firebase.types';

// Initialize Firebase composable for exercises
const {
  documents: exercises,
  loading,
  error,
  create,
  update,
  subscribe
} = useFirebase<Exercise>(Collections.EXERCISES);

// Seeding state
const seeding = ref(false);
const seedSuccess = ref(false);
const seedCount = ref(0);

// Filter state
const selectedCategory = ref<ExerciseCategory | null>(null);
const selectedType = ref<ExerciseType | null>(null);
const searchQuery = ref('');
const showFilterModal = ref(false);

const imageErrorMap = ref<Record<string, boolean>>({});

// Categories for filter chips
const categories = Object.values(ExerciseCategory);

// Exercise types for filter chips
const exerciseTypes = Object.values(ExerciseType);

// Filtered exercises
const filteredExercises = computed(() => {
  let filtered = exercises.value;

  // Filter by category
  if (selectedCategory.value !== null) {
    filtered = filtered.filter(ex => ex.category === selectedCategory.value);
  }

  // Filter by type
  if (selectedType.value !== null) {
    filtered = filtered.filter(ex => ex.type === selectedType.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(ex =>
      ex.name.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedCategory.value !== null) count++;
  if (selectedType.value !== null) count++;
  return count;
});

/**
 * Clear all filters
 */
const clearFilters = () => {
  selectedCategory.value = null;
  selectedType.value = null;
};

/**
 * Get color for category chip
 */
const getCategoryColor = (category: ExerciseCategory): string => {
  const colors: Record<ExerciseCategory, string> = {
    [ExerciseCategory.CHEST]: 'danger',
    [ExerciseCategory.BACK]: 'primary',
    [ExerciseCategory.SHOULDERS]: 'warning',
    [ExerciseCategory.BICEPS]: 'secondary',
    [ExerciseCategory.TRICEPS]: 'tertiary',
    [ExerciseCategory.LEGS]: 'success',
    [ExerciseCategory.ABS]: 'medium',
    [ExerciseCategory.CARDIO]: 'medium',
  };
  return colors[category] || 'medium';
};

const getExerciseImage = (exercise: Exercise) => {
    return exercise.picture || `/assets/exercises/${exercise.extId}.png`;
}

const handleImageError = (id: string) => {
    imageErrorMap.value[id] = true;
}

/**
 * Seed exercises from data file
 */
const seedExercises = async () => {
  const alert = await alertController.create({
    header: 'Seed Exercises',
    message: `This will add/update exercises in the database and link similar ones. Continue?`, /* Removed count as we don't have it yet */
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Seed',
        handler: async () => {
          seeding.value = true;
          seedSuccess.value = false;
          seedCount.value = 0;
          let updatedCount = 0;
          const extIdToDocId: Record<string, string> = {};

          try {
            // Dynamically import exercises data
            const { exercises: exerciseSeeds } = await import('@/data/exercises');
            
            // Pass 1: Create/Update exercises
            for (const exerciseSeed of exerciseSeeds) {
              const { id, ...exerciseData } = exerciseSeed as any;
              
              const existingExercise = exercises.value.find(e => e.extId === exerciseData.extId);

              if (existingExercise) {
                // Update existing exercise
                // Don't update 'similar' yet as we need IDs from everyone first
                const { similar, ...dataWithoutSimilar } = exerciseData;
                await update(existingExercise.id, dataWithoutSimilar);
                extIdToDocId[exerciseData.extId] = existingExercise.id;
                updatedCount++;
                console.log(`Updated exercise: ${exerciseData.name}`);
              } else {
                // Create new exercise
                const { similar, ...dataWithoutSimilar } = exerciseData;
                const newId = await create(dataWithoutSimilar as Omit<Exercise, 'id'>);
                if (newId) {
                   extIdToDocId[exerciseData.extId] = newId;
                   seedCount.value++;
                   console.log(`Created exercise: ${exerciseData.name}`);
                }
              }
            }

            // Pass 2: Link Similar Exercises
            console.log('Starting Pass 2: Linking similar exercises...');
            for (const exerciseSeed of exerciseSeeds) {
               if (exerciseSeed.extId && exerciseSeed.similar && exerciseSeed.similar.length > 0) {
                  const docId = extIdToDocId[exerciseSeed.extId];
                  if (!docId) continue;

                  const similarDocIds = exerciseSeed.similar
                    .map(extId => extIdToDocId[extId])
                    .filter(id => !!id);
                  
                  if (similarDocIds.length > 0) {
                      await update(docId, { similar: similarDocIds });
                  }
               }
            }

            seedSuccess.value = true;
            setTimeout(() => {
              seedSuccess.value = false;
            }, 3000);
            
            console.log(`Seeding complete. Created: ${seedCount.value}, Updated: ${updatedCount}`);
          } catch (err) {
            console.error('Error seeding exercises:', err);
          } finally {
            seeding.value = false;
          }
        }
      }
    ]
  });

  await alert.present();
};

// Real-time subscription
let unsubscribe: (() => void) | null = null;

/**
 * Setup real-time subscription on component mount
 */
onMounted(() => {
  unsubscribe = subscribe(
    {
      orderBy: {
        field: 'name',
        direction: 'asc'
      }
    },
    (docs) => {
      console.log('Real-time update received:', docs.length, 'exercises');
    }
  );
});

/**
 * Cleanup subscription on component unmount
 */
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

</script>

<style scoped>
.seeding-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-filter-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: center;
}

.search-filter-section ion-searchbar {
  flex: 1;
}

.search-filter-section ion-button {
  flex-shrink: 0;
  position: relative;
}

.search-filter-section ion-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--ion-color-dark);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chips ion-chip {
  cursor: pointer;
  transition: transform 0.2s;
}

.filter-chips ion-chip:hover {
  transform: scale(1.05);
}

.filter-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin: 0;
}

.exercise-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.exercise-count {
  text-align: center;
  color: var(--ion-color-medium);
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 1rem;
}

ion-list {
  background: transparent;
}

ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 0.5rem;
}

/* Thumbnail Styling */
ion-thumbnail {
  --size: 64px;
  --border-radius: 8px;
  margin-right: 16px;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
  font-size: 2rem;
}

ion-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
