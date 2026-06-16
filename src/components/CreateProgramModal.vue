<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title>{{ program ? 'Edit' : 'Create' }} Program</ion-title>
      <ion-buttons slot="end">
        <ion-button :strong="true" @click="confirm" :disabled="!isValid">
          {{ program ? 'Update' : 'Create' }}
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-list>
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Basic Information</ion-label>
        </ion-item-divider>
        <ion-item>
          <ion-label position="stacked">Program Name</ion-label>
          <ion-input v-model="formData.name" placeholder="e.g. 5x5 Stronglifts" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Description</ion-label>
          <ion-textarea v-model="formData.description" placeholder="Short description of the program" :rows="3"></ion-textarea>
        </ion-item>
      </ion-item-group>

      <ion-item-group>
        <ion-item-divider>
          <ion-label>Settings</ion-label>
        </ion-item-divider>
        <ion-item>
          <ion-label position="stacked">Workouts per Week</ion-label>
          <ion-input type="number" v-model.number="formData.workoutsPerWeek" min="1" max="7"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Difficulty Level</ion-label>
          <ion-select v-model="formData.difficultyLevel">
            <ion-select-option value="Beginner">Beginner</ion-select-option>
            <ion-select-option value="Intermediate">Intermediate</ion-select-option>
            <ion-select-option value="Advanced">Advanced</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label>Active Program</ion-label>
          <ion-toggle v-model="formData.isActive" slot="end"></ion-toggle>
        </ion-item>
      </ion-item-group>

      <ion-item-group>
        <ion-item-divider>
          <ion-label>Workouts / Exercises</ion-label>
          <ion-button slot="end" fill="clear" @click="addWorkout" size="small">
            <ion-icon slot="start" :icon="addOutline"></ion-icon>
            Add
          </ion-button>
        </ion-item-divider>
        
        <div v-if="formData.workouts.length === 0" class="ion-padding ion-text-center">
          <p>No workouts added yet. Add exercises to your program.</p>
        </div>

        <ion-item-sliding v-for="(workout, index) in formData.workouts" :key="index">
          <ion-item>
            <ion-label>
              <h3>{{ getExerciseName(workout.exerciseId) }}</h3>
              <p>{{ workout.sets }} sets x {{ workout.reps }} reps</p>
            </ion-label>
            <ion-buttons slot="end">
                <ion-button @click="editWorkout(index)">
                    <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
                </ion-button>
            </ion-buttons>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="removeWorkout(index)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-item-group>
    </ion-list>

    <!-- Workout Detail Modal (nested or side-car) -->
    <ion-modal :is-open="showWorkoutModal" @didDismiss="showWorkoutModal = false">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ editingWorkoutIndex !== null ? 'Edit' : 'Add' }} Exercise</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="saveWorkout">Save</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-label position="stacked">Exercise</ion-label>
                <ion-select v-model="currentWorkout.exerciseId" placeholder="Select Exercise">
                    <ion-select-option v-for="ex in exercises" :key="ex.id" :value="ex.id">
                        {{ ex.name }}
                    </ion-select-option>
                </ion-select>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Sets</ion-label>
                <ion-input type="number" v-model.number="currentWorkout.sets" min="1"></ion-input>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Reps</ion-label>
                <ion-input type="number" v-model.number="currentWorkout.reps" min="1"></ion-input>
            </ion-item>
        </ion-content>
    </ion-modal>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonItemDivider,
  IonItemGroup,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonModal,
  modalController
} from '@ionic/vue';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { useFirebase } from '@/composables/useFirebase';
import { Collections, type Program, type Exercise, type ProgramWorkout } from '@/types/firebase.types';
import { useAuth } from '@/composables/useAuth';

const props = defineProps<{
  program?: Program;
}>();

const { currentUser } = useAuth();
const { documents: exercises, getAll: fetchExercises } = useFirebase<Exercise>(Collections.EXERCISES);

const formData = reactive({
  name: props.program?.name || '',
  description: props.program?.description || '',
  workoutsPerWeek: props.program?.workoutsPerWeek || 3,
  difficultyLevel: props.program?.difficultyLevel || 'Beginner',
  isActive: props.program?.isActive ?? false,
  workouts: props.program?.workouts ? [...props.program.workouts] : [] as ProgramWorkout[]
});

const isValid = computed(() => {
  return formData.name.trim().length > 0 && formData.workoutsPerWeek > 0;
});

const showWorkoutModal = ref(false);
const editingWorkoutIndex = ref<number | null>(null);
const currentWorkout = reactive<ProgramWorkout>({
    exerciseId: '',
    sets: 3,
    reps: 10
});

onMounted(async () => {
    if (exercises.value.length === 0) {
        await fetchExercises();
    }
});

const getExerciseName = (id: string) => {
    return exercises.value.find(ex => ex.id === id)?.name || 'Unknown Exercise';
};

const addWorkout = () => {
    editingWorkoutIndex.value = null;
    currentWorkout.exerciseId = '';
    currentWorkout.sets = 3;
    currentWorkout.reps = 10;
    showWorkoutModal.value = true;
};

const editWorkout = (index: number) => {
    editingWorkoutIndex.value = index;
    const workout = formData.workouts[index];
    currentWorkout.exerciseId = workout.exerciseId;
    currentWorkout.sets = workout.sets;
    currentWorkout.reps = workout.reps;
    showWorkoutModal.value = true;
};

const saveWorkout = () => {
    if (!currentWorkout.exerciseId) return;
    
    if (editingWorkoutIndex.value !== null) {
        formData.workouts[editingWorkoutIndex.value] = { ...currentWorkout };
    } else {
        formData.workouts.push({ ...currentWorkout });
    }
    showWorkoutModal.value = false;
};

const removeWorkout = (index: number) => {
    formData.workouts.splice(index, 1);
};

const cancel = () => modalController.dismiss(null, 'cancel');

const confirm = () => {
    const programData: Omit<Program, 'id'> = {
        userId: currentUser.value?.uid || '',
        name: formData.name,
        description: formData.description,
        workoutsPerWeek: formData.workoutsPerWeek,
        difficultyLevel: formData.difficultyLevel,
        isActive: formData.isActive,
        workouts: formData.workouts
    };
    modalController.dismiss(programData, 'confirm');
};
</script>

<style scoped>
ion-item-divider {
    --background: var(--ion-color-light);
    --color: var(--ion-color-medium);
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}
</style>
