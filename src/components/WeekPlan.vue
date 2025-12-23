<template>
  <div class="week-plan-container">
    <!-- Overall Progress -->
    <ion-card class="progress-card">
      <ion-card-header>
        <ion-card-title>Weekly Progress</ion-card-title>
        <ion-card-subtitle>{{ overallProgress }}% Completed</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-progress-bar :value="overallProgress / 100" color="primary"></ion-progress-bar>
      </ion-card-content>
    </ion-card>

    <!-- Actions -->
    <div class="actions-container ion-padding-horizontal" v-if="plannedExercises.length === 0">
      <ion-button expand="block" fill="outline" @click="applyTemplate" :disabled="loading">
        Load from Template (Full Body 3)
      </ion-button>
    </div>

    <!-- Category Progress & List -->
    <div class="categories-list ion-padding">
      <div v-for="category in categories" :key="category.name" class="category-section">
        <div class="category-header">
          <h3>{{ category.name }}</h3>
          <span class="category-progress">{{ category.progress }}%</span>
        </div>
        <ion-progress-bar :value="category.progress / 100" :color="getCategoryColor(category.name)"></ion-progress-bar>
        
        <ion-list>
          <ion-item v-for="exercise in category.exercises" :key="exercise.id">
            <ion-icon 
              :icon="checkmarkCircle" 
              slot="start" 
              :color="isExerciseCompleted(exercise.id) ? 'success' : 'medium'"
            ></ion-icon>
            <ion-label>
              <h2>{{ exercise.name }}</h2>
              <p>{{ exercise.type }}</p>
            </ion-label>
            <ion-button 
              slot="end" 
              fill="clear" 
              color="danger" 
              @click="removeExerciseFromPlan(exercise.id)"
            >
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
      </div>
    </div>

    <!-- Clear Plan Button -->
    <div class="clear-plan-container ion-padding" v-if="plannedExercises.length > 0">
      <ion-button 
        expand="block" 
        color="danger" 
        fill="clear" 
        @click="clearPlan"
      >
        <ion-icon slot="start" :icon="trashOutline"></ion-icon>
        Clear Plan
      </ion-button>
    </div>

    <!-- Add Exercise Modal -->
    <ion-modal :is-open="showAddExerciseModal" @didDismiss="showAddExerciseModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add Exercise</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddExerciseModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-searchbar v-model="searchQuery" placeholder="Search exercises..."></ion-searchbar>
        <ion-list>
          <ion-item 
            v-for="exercise in filteredExercises" 
            :key="exercise.id" 
            button 
            @click="addExerciseToPlan(exercise.id)"
          >
            <ion-label>
              <h2>{{ exercise.name }}</h2>
              <p>{{ exercise.category }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- FAB -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="fixed-fab">
      <ion-fab-button @click="showAddExerciseModal = true">
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonProgressBar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSearchbar,
  IonFab,
  IonFabButton,
  alertController
} from '@ionic/vue';
import { checkmarkCircle, addOutline, trashOutline } from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { useAuth } from '@/composables/useAuth';
import { Collections, type WeekPlan, type Workout, type Exercise, ExerciseCategory, WorkoutStatus } from '@/types/firebase.types';
import { templates } from '@/data/templates';
import { exercises as staticExercises } from '@/data/exercises';

const props = defineProps<{
  weekStart: Date;
  workouts: Workout[]; // Workouts for the current week to calculate progress
}>();

const { currentUser } = useAuth();
const {
  documents: weekPlans,
  loading,
  create,
  update,
  subscribe
} = useFirebase<WeekPlan>(Collections.WEEK_PLANS);

const {
  documents: exercises,
  subscribe: subscribeExercises
} = useFirebase<Exercise>(Collections.EXERCISES);

const showAddExerciseModal = ref(false);
const searchQuery = ref('');

// Get the current week's plan
const currentWeekPlan = computed(() => {
  const weekStartStr = props.weekStart.toISOString();
  return weekPlans.value.find(p => p.weekStart === weekStartStr);
});

// Planned exercises details
const plannedExercises = computed(() => {
  if (!currentWeekPlan.value) return [];
  return currentWeekPlan.value.exercises.map(id => {
    // Handle both string and number IDs for compatibility
    return exercises.value.find(e => String(e.id) === String(id));
  }).filter(e => !!e);
});

// Group exercises by category
const categories = computed(() => {
  const groups: Record<string, Exercise[]> = {};
  
  plannedExercises.value.forEach(ex => {
    if (!ex) return;
    if (!groups[ex.category]) {
      groups[ex.category] = [];
    }
    groups[ex.category].push(ex);
  });

  return Object.keys(groups).map(cat => {
    const catExercises = groups[cat];
    const completedCount = catExercises.filter(ex => isExerciseCompleted(ex.id)).length;
    const progress = catExercises.length > 0 ? Math.round((completedCount / catExercises.length) * 100) : 0;
    
    return {
      name: cat,
      exercises: catExercises,
      progress
    };
  });
});

// Overall progress
const overallProgress = computed(() => {
  const total = plannedExercises.value.length;
  if (total === 0) return 0;
  
  const completed = plannedExercises.value.filter(ex => ex && isExerciseCompleted(ex.id)).length;
  return Math.round((completed / total) * 100);
});

// Filter exercises for modal
const filteredExercises = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return exercises.value.filter(e => 
    e.name.toLowerCase().includes(query) || 
    e.category.toLowerCase().includes(query)
  );
});

// Check if an exercise is completed in any of the week's completed workouts
// Check if an exercise is completed in any of the week's completed workouts
function isExerciseCompleted(exerciseId: string | number) {
  // Calculate end of the week for the current plan
  const planWeekStart = new Date(props.weekStart);
  // Reset time to start of day
  planWeekStart.setHours(0, 0, 0, 0);
  
  const planWeekEnd = new Date(planWeekStart);
  planWeekEnd.setDate(planWeekEnd.getDate() + 6);
  planWeekEnd.setHours(23, 59, 59, 999);

  return props.workouts
    .filter(w => {
      if (w.status !== WorkoutStatus.COMPLETED) return false;
      const wDate = new Date(w.date);
      return wDate >= planWeekStart && wDate <= planWeekEnd;
    })
    .some(w => w.exercises.some(e => String(e.exerciseId) === String(exerciseId)));
}

// Add exercise to plan
async function addExerciseToPlan(exerciseId: string | number) {
  const idStr = String(exerciseId);
  
  if (currentWeekPlan.value) {
    // Update existing plan
    const currentExercises = [...currentWeekPlan.value.exercises];
    if (!currentExercises.includes(idStr)) {
      await update(currentWeekPlan.value.id, {
        exercises: [...currentExercises, idStr]
      });
    }
  } else {
    // Create new plan
    if (!currentUser.value) return;
    await create({
      userId: currentUser.value.uid,
      weekStart: props.weekStart.toISOString(),
      exercises: [idStr]
    });
  }
  showAddExerciseModal.value = false;
}

// Apply template
// Apply template
async function applyTemplate() {
  const templateIds = templates.fullbody_3;
  
  // Map numeric template IDs to Firestore UUIDs by name
  const firestoreIds = new Set<string>();
  
  templateIds.forEach(templateId => {
    // Find name from static data
    const staticExercise = staticExercises.find(e => Number(e.extId) === templateId);
    if (!staticExercise) return;
    
    // Find corresponding Firestore exercise ID
    const firestoreExercise = exercises.value.find(e => e.name === staticExercise.name);
    if (firestoreExercise) {
      firestoreIds.add(firestoreExercise.id);
    }
  });

  const idsToSave = Array.from(firestoreIds);

  if (idsToSave.length === 0) {
    console.warn('No matching exercises found for template');
    return;
  }
  
  if (currentWeekPlan.value) {
    // Merge with existing
    const currentExercises = new Set(currentWeekPlan.value.exercises);
    idsToSave.forEach(id => currentExercises.add(id));
    
    await update(currentWeekPlan.value.id, {
      exercises: Array.from(currentExercises)
    });
  } else {
    if (!currentUser.value) return;
    await create({
      userId: currentUser.value.uid,
      weekStart: props.weekStart.toISOString(),
      exercises: idsToSave
    });
  }
}

// Remove exercise from plan
async function removeExerciseFromPlan(exerciseId: string | number) {
  if (!currentWeekPlan.value) return;
  
  const idStr = String(exerciseId);
  const currentExercises = currentWeekPlan.value.exercises.filter(id => id !== idStr);
  
  await update(currentWeekPlan.value.id, {
    exercises: currentExercises
  });
}

// Clear entire plan
async function clearPlan() {
  if (!currentWeekPlan.value) return;
  
  const alert = await alertController.create({
    header: 'Clear Plan',
    message: 'Are you sure you want to clear all exercises from this week\'s plan?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Clear',
        role: 'confirm',
        handler: async () => {
          await update(currentWeekPlan.value!.id, {
            exercises: []
          });
        }
      }
    ]
  });
  
  await alert.present();
}

function getCategoryColor(category: string) {
  switch (category) {
    case ExerciseCategory.CHEST: return 'danger';
    case ExerciseCategory.BACK: return 'primary';
    case ExerciseCategory.LEGS: return 'success';
    case ExerciseCategory.SHOULDERS: return 'warning';
    case ExerciseCategory.BICEPS: return 'tertiary';
    case ExerciseCategory.TRICEPS: return 'tertiary';
    case ExerciseCategory.ABS: return 'secondary';
    default: return 'medium';
  }
}

// Subscribe to week plans
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (!currentUser.value) return;
  
  // Subscribe to exercises
  subscribeExercises({
    orderBy: {
      field: 'name',
      direction: 'asc'
    }
  });
  
  unsubscribe = subscribe({
    where: [
      {
        field: 'weekStart',
        operator: '==',
        value: props.weekStart.toISOString()
      },
      {
        field: 'userId',
        operator: '==',
        value: currentUser.value.uid
      }
    ]
  });
});

// Watch for week changes to update subscription
watch(() => props.weekStart, (newDate) => {
  if (unsubscribe) unsubscribe();
  if (!currentUser.value) return;
  
  unsubscribe = subscribe({
    where: [
      {
        field: 'weekStart',
        operator: '==',
        value: newDate.toISOString()
      },
      {
        field: 'userId',
        operator: '==',
        value: currentUser.value.uid
      }
    ]
  });
});
</script>

<style scoped>
.week-plan-container {
  padding-bottom: 2rem;
}

.progress-card {
  margin: 1rem;
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-section {
  margin-bottom: 1.5rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.category-progress {
  font-weight: 600;
  color: var(--ion-color-medium);
}

.clear-plan-container {
  margin-top: 2rem;
  padding-bottom: 5rem;
}

.fixed-fab {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 999;
}
</style>
