<script setup lang="ts">
import { useFirebase } from '@/composables/useFirebase';
import { Collections, Exercise, Program, ProgramWorkoutExercise } from '@/types/firebase.types';
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
  <IonModal :is-open="isOpen">
    <IonHeader>
      <IonToolbar>
        <IonTitle>Add Workout</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="isOpen = false">Close</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <IonAccordionGroup>
        <IonAccordion v-for="program in programWithExercises" :key="program.id" :value="program.id">
          <IonItem slot="header" color="light">
            <IonBadge slot="start">{{ program.workouts.length }}</IonBadge>
            <IonLabel>{{ program.name }}</IonLabel>
          </IonItem>
          <div slot="content" class="ion-padding">
            <IonAccordionGroup v-model="currentWorkout">
              <IonAccordion v-for="(workout, index) in program.workouts" :key="workout.id" :value="workout.id">
                <IonItem slot="header" color="light">
                  <IonBadge slot="start">{{ workout.exercises.length }}</IonBadge>
                  <IonLabel>Workout {{ index + 1 }}</IonLabel>
                </IonItem>
                <div slot="content">
                  <IonList>
                    <IonItem v-for="exercise in workout.exercises" :key="exercise.exerciseId">
                      <IonLabel>{{ exercise.exercise?.name }}</IonLabel>
                      <ExerciseCategoryLabel v-if="exercise.exercise" slot="end" :category="exercise.exercise?.category" />
                    </IonItem>
                  </IonList>
                  <div class="ion-display-flex ion-justify-content-center">
                    <IonButton color="primary" @click="selectWorkout(workout.exercises)">
                      <IonIcon :icon="add" />
                      Add
                    </IonButton>
                  </div>
                </div>
              </IonAccordion>
            </IonAccordionGroup>
          </div>
        </IonAccordion>
      </IonAccordionGroup>
    </IonContent>
  </IonModal>
</template>
