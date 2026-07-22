<template>
  <AppLayout
    :title="program?.name || 'Program'"
    :loading="loading"
    no-padding
    back-route="/tabs/programs">
      <div v-if="program" class="ion-padding-horizontal">
        <section class="ion-padding-vertical">
          <div class="ion-display-flex ion-align-items-center ion-justify-content-between">
            <h1 class="ion-no-margin">{{ program.name }}</h1>
            <IonBadge :color="program.isActive ? 'success' : 'medium'">
              {{ program.isActive ? 'Active' : 'Inactive' }}
            </IonBadge>
          </div>
          <p v-if="program.description">{{ program.description }}</p>
          <p><strong>Difficulty:</strong> {{ program.difficultyLevel }}</p>
        </section>

        <div class="ion-display-flex ion-justify-content-between ion-align-items-center">
          <h2>Workouts <IonBadge>{{ program.workouts.length }}</IonBadge></h2>
          <IonButton size="small" @click="addWorkout">
            <IonIcon slot="start" :icon="addOutline" />
            Workout
          </IonButton>
        </div>

        <EmptyState
          v-if="programWorkouts.length === 0"
          title="No workouts yet"
          description="Add a workout, then fill it with exercises."
          :action="{ label: 'Add Workout', onClick: addWorkout }"
        />

        <IonAccordionGroup>
          <ProgramWorkout
            v-for="(workout, index) in programWorkouts"
            :key="workout.id"
            :exercises="workout.exercises"
            :index="index"
            @delete-workout="confirmDeleteWorkout"
            @add-exercise="openExerciseModal"
            @delete-exercise="removeExercise" />
        </IonAccordionGroup>
      </div>

      <div v-else class="ion-padding ion-text-center">
        Program not found...
      </div>

      <AddExerciseModal
        :is-open="showExerciseModal"
        :all-exercises="exercises"
        :is-exercise-in-workout="() => false"
        @add-exercise="addExerciseToSelectedWorkout"
        @close="closeExerciseModal" />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonIcon,
  alertController,
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { programService } from '@/services/programService';
import { Collections, type Exercise, type Program } from '@/types/firebase.types';
import EmptyState from '@/components/EmptyState.vue';
import AddExerciseModal from '@/components/workout/AddExerciseModal.vue';
import AppLayout from '@/components/AppLayout.vue';
import ProgramWorkout from '@/components/program/ProgramWorkout.vue';

const route = useRoute();
const programId = route.params.id as string;

const showExerciseModal = ref(false);
const selectedWorkoutIndex = ref<number | null>(null);
const exerciseSearch = ref('');
let unsubscribeExercises: (() => void) | null = null;

const {
  documents: exercises,
  subscribe: subscribeExercises,
} = useFirebase<Exercise>(Collections.EXERCISES);
const {
  document: program,
  getById,
  loading,
} = useFirebase<Program>(Collections.PROGRAMS);

const programWorkouts = computed(() => program.value?.workouts.map(w => ({
  ...w,
  exercises: w.exercises.map(e => ({
    ...e,
    exercise: exercises.value.find(exercise => exercise.id === e.exerciseId),
  }))
})) || []);

const saveProgram = async () => {
  if (!program.value) return;

  program.value.workouts.forEach((workout, workoutIndex) => {
    workout.name = workout.name.trim() || `Workout ${workoutIndex + 1}`;
    workout.exercises.forEach((exercise, exerciseIndex) => {
      exercise.sets = Math.max(1, Number(exercise.sets) || 1);
      exercise.reps = Math.max(1, Number(exercise.reps) || 1);
      exercise.order = exerciseIndex;
    });
  });

  await programService.updateProgram(programId, {
    workouts: program.value.workouts
  });
};

const addWorkout = async () => {
  if (!program.value) return;

  program.value.workouts.push({
    id: `workout-${Date.now()}`,
    name: `Workout ${program.value.workouts.length + 1}`,
    exercises: []
  });

  await saveProgram();
};

const confirmDeleteWorkout = async (workoutIndex: number) => {
  const workout = program.value?.workouts[workoutIndex];
  if (!workout) return;

  const alert = await alertController.create({
    header: 'Delete Workout',
    message: `Delete "${workout.name}" from this program?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          program.value!.workouts.splice(workoutIndex, 1);
          await saveProgram();
        }
      }
    ]
  });

  await alert.present();
};

const openExerciseModal = (workoutIndex: number) => {
  selectedWorkoutIndex.value = workoutIndex;
  exerciseSearch.value = '';
  showExerciseModal.value = true;
};

const closeExerciseModal = () => {
  showExerciseModal.value = false;
  selectedWorkoutIndex.value = null;
};

const addExerciseToSelectedWorkout = async (exerciseId: string) => {
  if (!program.value || selectedWorkoutIndex.value === null) return;

  const workout = program.value.workouts[selectedWorkoutIndex.value];
  workout.exercises.push({
    exerciseId,
    sets: 3,
    reps: 10,
    order: workout.exercises.length
  });

  await saveProgram();
  closeExerciseModal();
};

const removeExercise = async (workoutIndex: number, exerciseIndex: number) => {
  if (!program.value) return;

  program.value.workouts[workoutIndex].exercises.splice(exerciseIndex, 1);
  await saveProgram();
};

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await getById(id);
  }
  unsubscribeExercises = subscribeExercises({
    orderBy: {
      field: 'name',
      direction: 'asc'
    }
  });
});

onUnmounted(() => {
  if (unsubscribeExercises) unsubscribeExercises();
});
</script>

<style scoped>
.program-summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.program-summary h1 {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.program-summary p {
  margin: 0;
  color: var(--ion-color-medium);
}

.program-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.section-header,
.workout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.workout-card {
  margin: 1rem 0;
}

.workout-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.empty-workout {
  color: var(--ion-color-medium);
  padding: 0.75rem 0;
}

.exercise-controls {
  display: grid;
  grid-template-columns: 3.5rem auto 3.5rem;
  gap: 0.35rem;
  align-items: center;
}

.exercise-controls ion-input {
  --padding-start: 0.4rem;
  --padding-end: 0.4rem;
  text-align: center;
}

.add-exercise-button {
  margin-top: 0.75rem;
}
</style>
