<script setup lang="ts">
import { useFirebase } from '@/composables/useFirebase';
import type { Exercise, Program, ProgramWorkoutExercise } from '@/types/firebase.types';
import { Collections } from '@/types/firebase.types';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem, 
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ExerciseCategoryLabel from '@/components/ExerciseCategoryLabel.vue';
import { add } from 'ionicons/icons';

const emits = defineEmits<{
  (e: 'select-workout', ids: string[]): void,
}>();
const isOpen = defineModel<boolean>();
const currentWorkout = ref();

const {
  documents: programs,
  subscribe,
} = useFirebase<Program>(Collections.PROGRAMS);
const {
  documents: exercises,
  getAll,
} = useFirebase<Exercise>(Collections.EXERCISES);

watch(programs, () => {
  if (programs.value.length < 1 || programs.value[0].workouts.length < 1) return;

  currentWorkout.value = programs.value[0].workouts[0].id
});

const programWithExercises = computed(() => programs.value.map(program => ({
  ...program,
  workouts: program.workouts.map(workout => ({
    ...workout,
    exercises: workout.exercises.map(e => ({
      ...e,
      exercise: exercises.value.find(ex => ex.id === e.exerciseId),
    }))
  }))
})));

const selectWorkout = (exercises: ProgramWorkoutExercise[]) => {
  emits('select-workout', exercises.map(e => e.exerciseId));
}

// Real-time subscription
let unsubscribe: (() => void) | null = null;

/**
 * Setup real-time subscription on component mount
 */
onMounted(async () => {
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
  await getAll();
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

<template>
  <ion-modal :isOpen="isOpen">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Workout</ion-title>
        <template #end>
          <ion-buttons>
            <ion-button @click="isOpen = false">
              Close
            </ion-button>
          </ion-buttons>
        </template>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-accordion-group>
        <ion-accordion
          v-for="program in programWithExercises"
          :key="program.id"
          :value="program.id"
        >
          <template #header>
            <ion-item color="light">
              <template #start>
                <ion-badge>
                  {{ program.workouts.length }}
                </ion-badge>
              </template>
              <ion-label>{{ program.name }}</ion-label>
            </ion-item>
          </template>
          <template #content>
            <div class="ion-padding">
              <ion-accordion-group v-model="currentWorkout">
                <ion-accordion
                  v-for="(workout, index) in program.workouts"
                  :key="workout.id"
                  :value="workout.id"
                >
                  <template #header>
                    <ion-item 
                      color="light"
                    >
                      <template #start>
                        <ion-badge>
                          {{ workout.exercises.length }}
                        </ion-badge>
                      </template>
                      <ion-label>Workout {{ index + 1 }}</ion-label>
                    </ion-item>
                  </template>
                  <template #content>
                    <div>
                      <ion-list>
                        <ion-item
                          v-for="exercise in workout.exercises"
                          :key="exercise.exerciseId"
                        >
                          <ion-label>{{ exercise.exercise?.name }}</ion-label>
                          <template #end>
                            <exercise-category-label
                              v-if="exercise.exercise"
                                                 
                              :category="exercise.exercise?.category"
                            />
                          </template>
                        </ion-item>
                      </ion-list>
                      <div class="ion-display-flex ion-justify-content-center">
                        <ion-button
                          color="primary"
                          @click="selectWorkout(workout.exercises)"
                        >
                          <ion-icon :icon="add" />
                          Add
                        </ion-button>
                      </div>
                    </div>
                  </template>
                </ion-accordion>
              </ion-accordion-group>
            </div>
          </template>
        </ion-accordion>
      </ion-accordion-group>
    </ion-content>
  </ion-modal>
</template>
