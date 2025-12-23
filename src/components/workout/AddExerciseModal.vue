<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="segment">
          <ion-segment-button value="plan">
            <ion-label>Week Plan</ion-label>
          </ion-segment-button>
          <ion-segment-button value="catalog">
            <ion-label>Catalog</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Week Plan Tab -->
      <div v-if="segment === 'plan'">
        <div v-if="plannedExercises.length">
           <ion-list v-for="(exercises, category) in groupedPlannedExercises" :key="category">
            <ion-list-header>
                <ion-label>{{ category }}</ion-label>
            </ion-list-header>
            <ion-item 
                v-for="ex in exercises" 
                :key="ex.id" 
                button 
                :disabled="isDisabled(ex.id)"
                @click="$emit('add-exercise', ex.id)"
            >
                <ion-thumbnail slot="start">
                    <ion-img :src="getExerciseImage(ex)" @ionError="(e) => (e.target as any).src = '/assets/icon/icon.png'"></ion-img>
                </ion-thumbnail>
                <ion-label :class="{ 'disabled-exercise': isDisabled(ex.id) }">
                <h2>{{ ex.name }}</h2>
                <p v-if="isCompleted(ex.id)" class="already-done-text">Completed this week</p>
                <p v-else>{{ ex.category }}</p>
                </ion-label>
                <ion-icon 
                :icon="isExerciseInWorkout(ex.id) ? checkmarkCircleOutline : (isCompleted(ex.id) ? checkmarkDoneCircleOutline : addCircleOutline)" 
                slot="end" 
                :color="isExerciseInWorkout(ex.id) ? 'success' : (isCompleted(ex.id) ? 'medium' : 'primary')"
                ></ion-icon>
            </ion-item>
           </ion-list>
        </div>
        <div v-else class="ion-padding ion-text-center">
          <p>No exercises planned for this week.</p>
        </div>
      </div>

      <!-- Catalog Tab -->
      <div v-if="segment === 'catalog'">
        <ion-searchbar v-model="searchQuery" placeholder="Search exercises..."></ion-searchbar>
        <ion-list v-for="(exercises, category) in sortedFilteredCatalog" :key="category">
          <ion-list-header>
            <ion-label>{{ category }}</ion-label>
          </ion-list-header>
          <ion-item
            v-for="ex in exercises"
            :key="ex.id"
            button 
            :disabled="isExerciseInWorkout(ex.id)"
            @click="$emit('add-exercise', ex.id)"
          >
            <ion-label :class="{ 'disabled-exercise': isExerciseInWorkout(ex.id) }">
              <h2>{{ ex.name }}</h2>
              <p>{{ ex.category }}</p>
            </ion-label>
            <ion-icon 
              :icon="isExerciseInWorkout(ex.id) ? checkmarkCircleOutline : addCircleOutline" 
              slot="end" 
              :color="isExerciseInWorkout(ex.id) ? 'success' : 'primary'"
            ></ion-icon>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonSearchbar,
  IonListHeader,
  IonThumbnail,
  IonImg
} from '@ionic/vue';
import { addCircleOutline, checkmarkCircleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';
import { Exercise, ExerciseCategory } from '@/types/firebase.types';

const props = defineProps<{
  isOpen: boolean;
  plannedExercises: Exercise[];
  allExercises: Exercise[]; // Pass all exercises to filter visually here
  isExerciseInWorkout: (id: string | number) => boolean;
  completedExerciseIds?: Set<string>;
  currentExerciseId?: string | null;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'add-exercise', id: string | number): void;
}>();

const segment = ref('plan');
const searchQuery = ref('');

const groupedPlannedExercises = computed(() => {
  const data: Record<string, Exercise[]> = {};
  props.plannedExercises.forEach(e => {
    if (!data[e.category]) {
      data[e.category] = [];
    }
    data[e.category].push(e);
  });
  return data;
});

const isCompleted = (id: string | number) => {
    if (!props.completedExerciseIds) return false;
    return props.completedExerciseIds.has(String(id));
};

const isDisabled = (id: string | number) => {
    return props.isExerciseInWorkout(id) || isCompleted(id);
};

const getExerciseImage = (ex: Exercise) => {
    return ex.picture ? ex.picture : `/assets/exercises/${ex.extId}.png`;
};

const filteredCatalog = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filtered = props.allExercises.filter(e => 
    e.name.toLowerCase().includes(query) || 
    e.category.toLowerCase().includes(query)
  );
  
  const data: Record<string, Exercise[]> = {};
  filtered.forEach(e => {
    if (!data[e.category]) {
      data[e.category] = [];
    }
    data[e.category].push(e);
  });

  return data;
});

const sortedFilteredCatalog = computed(() => {
    const catalog = filteredCatalog.value;
    
    // If not swapping, just return catalog
    if (!props.currentExerciseId) return catalog;

    let similarIds: string[] = [];
    const current = props.allExercises.find(e => String(e.id) === String(props.currentExerciseId));
    if (current && current.similar) {
        similarIds = current.similar;
    }
    
    if (similarIds.length === 0) return catalog;
    
    const result: Record<string, Exercise[]> = {};
    
    // prioritized exercises
    const similarExs = props.allExercises.filter(e => similarIds.includes(e.id));
    
    if (similarExs.length > 0) {
        // We put them in a special "Recommended" category or just keep them in their categories but prioritize?
        // User said: "show similar ones first".
        // A "Recommended" section at top makes most sense.
        result['Recommended'] = similarExs;
    }
    
    // Copy the rest
    for (const [cat, exs] of Object.entries(catalog)) {
        // Filter out those we already showed in Recommended to avoid duplicates?
        // Or keep them? Duplicates might be confusing but removing them from their category might also be confusing if user looks for "Chest" and doesn't see "Bench Press" there because it's in Recommended.
        // Let's filter them out from their original categories to avoid clutter.
        const remaining = exs.filter(e => !similarIds.includes(e.id));
        if (remaining.length > 0) {
            result[cat] = remaining;
        }
    }
    
    return result;
});
</script>

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
