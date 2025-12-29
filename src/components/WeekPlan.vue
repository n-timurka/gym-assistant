<template>
  <div class="week-plan-container">
    <!-- Overall Progress -->
    <ion-card class="progress-card">
      <ion-card-header>
        <ion-card-title>Weekly Progress</ion-card-title>
        <ion-card-subtitle>{{ overallProgress }}% Completed</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-progress-bar :value="overallProgress / 100" color="primary" />
      </ion-card-content>
    </ion-card>

    <!-- Category Progress & List -->
    <div class="categories-list ion-padding">
      <div v-for="category in categories" :key="category.name" class="category-section">
        <div class="category-header">
          <h3>{{ category.name }}</h3>
          <span class="category-progress">{{ category.progress }}%</span>
        </div>
        <ion-progress-bar
          :value="category.progress / 100"
          :color="getCategoryColor(category.name)"
        />
        
        <ion-list>
          <ion-item v-for="exercise in category.exercises" :key="exercise.id">
            <ion-icon 
              :icon="checkmarkCircle" 
              slot="start" 
              :color="isExerciseCompleted(exercise.id) ? 'success' : 'medium'"
            />
            <ion-label>
              <h2>{{ exercise.name }}</h2>
              <p>{{ exercise.type }}</p>
            </ion-label>
            <ion-button 
              slot="end" 
              fill="clear" 
              color="danger"
              :disabled="isExerciseCompleted(exercise.id)"
              @click="removeExerciseFromPlan(exercise.id)"
            >
              <ion-icon slot="icon-only" :icon="trashOutline" />
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
        <ion-icon slot="start" :icon="trashOutline" />
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

    <!-- Templates Modal -->
    <ion-modal :is-open="showTemplatesModal" @didDismiss="showTemplatesModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Select Template</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showTemplatesModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item 
            v-for="(template, index) in templates" 
            :key="index" 
            button 
            @click="applyTemplate(template)"
            class="template-item"
          >
            <ion-label>
              <h2>{{ template.title }}</h2>
              <p v-if="template.description" class="template-description">{{ template.description }}</p>
              <p>{{ template.exercises.length }} Exercises</p>
            </ion-label>
            <ion-button 
              slot="end" 
              fill="clear" 
              @click.stop="openExercisesPopover($event, template.exercises)"
            >
              <ion-icon slot="icon-only" :icon="helpCircleOutline" color="primary"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>

        <ion-popover 
          :is-open="showExercisesPopover" 
          :event="popoverEvent" 
          @didDismiss="showExercisesPopover = false"
        >
          <ion-content class="ion-padding">
            <ion-list lines="none">
              <ion-item v-for="(name, i) in currentTemplateExercises" :key="i">
                <ion-label>{{ name }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </ion-content>
    </ion-modal>

    <!-- FAB -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="fixed-fab">
      <ion-fab-button>
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-fab-button>
      <ion-fab-list side="top">
        <ion-fab-button @click="showAddExerciseModal = true" title="Add Exercise">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-button @click="showTemplatesModal = true" title="Load Template">
            <ion-icon :icon="documentOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab-list>
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
  IonFabList,
  IonPopover,
  alertController
} from '@ionic/vue';
import { checkmarkCircle, addOutline, trashOutline, documentOutline, helpCircleOutline } from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { useAuth } from '@/composables/useAuth';
import { Collections, type WeekPlan, type Exercise, ExerciseCategory } from '@/types/firebase.types';
import { templates } from '@/data/templates';
import { exercises as staticExercises } from '@/data/exercises';

const props = defineProps<{
  weekStart: Date;
}>();

const { currentUser } = useAuth();
const {
  documents: weekPlans,
  create,
  update,
  subscribe
} = useFirebase<WeekPlan>(Collections.WEEK_PLANS);

const {
  documents: exercises,
  subscribe: subscribeExercises
} = useFirebase<Exercise>(Collections.EXERCISES);

const showAddExerciseModal = ref(false);
const showExercisesPopover = ref(false);
const popoverEvent = ref<Event | null>(null);
const currentTemplateExercises = ref<string[]>([]);

function openExercisesPopover(event: Event, templateExerciseIds: number[]) {
  popoverEvent.value = event;
  currentTemplateExercises.value = templateExerciseIds.map(id => {
    const staticEx = staticExercises.find(e => Number(e.extId) === id);
    return staticEx ? staticEx.name : `Unknown Exercise (${id})`;
  });
  showExercisesPopover.value = true;
}

const showTemplatesModal = ref(false);
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

// Check if an exercise is completed based on the stored completed array
function isExerciseCompleted(exerciseId: string | number) {
  if (!currentWeekPlan.value || !currentWeekPlan.value.completed) return false;
  return currentWeekPlan.value.completed.includes(String(exerciseId));
}

// Add exercise to plan
async function addExerciseToPlan(exerciseId: string | number) {
  const idStr = String(exerciseId);
  
  if (currentWeekPlan.value) {
    // Update existing plan
    const currentExercises = [...currentWeekPlan.value.exercises];
    // Allow duplicates as per requirements
    await update(currentWeekPlan.value.id, {
      exercises: [...currentExercises, idStr]
    });
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

// Format template name for display (Not used in new design but keeping if needed or can remove)
function formatTemplateName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Apply template
async function applyTemplate(template: typeof templates[0]) {
  const templateIds = template.exercises;
  
  // Map numeric template IDs to Firestore UUIDs by name
  // Note: We allow duplicates now as per requirements
  const idsToSave: string[] = [];
  
  templateIds.forEach(templateId => {
    // Find name from static data
    const staticExercise = staticExercises.find(e => Number(e.extId) === templateId);
    if (!staticExercise) return;
    
    // Find corresponding Firestore exercise ID
    const firestoreExercise = exercises.value.find(e => e.name === staticExercise.name);
    if (firestoreExercise) {
      idsToSave.push(firestoreExercise.id);
    }
  });

  if (idsToSave.length === 0) {
    console.warn('No matching exercises found for template');
    return;
  }
  
  if (currentWeekPlan.value) {
    // Merge with existing - user said "Same exercise several times", so duplicates allowed.
    // However, if we append, we might just append.
    // Let's append to existing exercises.
    const currentExercises = [...currentWeekPlan.value.exercises, ...idsToSave];
    
    await update(currentWeekPlan.value.id, {
      exercises: currentExercises,
      exercisesPerWorkout: template.exercisesPerWorkout
    });
  } else {
    if (!currentUser.value) return;
    await create({
      userId: currentUser.value.uid,
      weekStart: props.weekStart.toISOString(),
      exercises: idsToSave,
      completed: [],
      exercisesPerWorkout: template.exercisesPerWorkout
    });
  }
  showTemplatesModal.value = false;
}

// Remove exercise from plan
async function removeExerciseFromPlan(exerciseId: string | number) {
  if (!currentWeekPlan.value) return;
  
  const idStr = String(exerciseId);
  
  await update(currentWeekPlan.value.id, {
    exercises: currentWeekPlan.value.exercises.filter(id => id !== idStr)
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
