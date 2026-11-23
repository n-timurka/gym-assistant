<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonButton,
  IonFooter,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/vue';
import { provideWorkoutDetail } from '@/composables/useWorkoutDetail';
import { WorkoutStatus } from '@/types/firebase.types';
// Components
import WorkoutHeader from '@/components/workout/WorkoutHeader.vue';
import WorkoutPlannedView from '@/components/workout/WorkoutPlannedView.vue';
import WorkoutOngoingView from '@/components/workout/WorkoutOngoingView.vue';
import WorkoutCompletedView from '@/components/workout/WorkoutCompletedView.vue';
import { addOutline } from 'ionicons/icons';

const route = useRoute();
const workoutId = route.params.id as string;

// Firebase composables
const { loading, workout, workoutStatus, openAddModal, startTraining, endTraining } = provideWorkoutDetail(workoutId);
</script>

<template>
  <ion-page>
    <workout-header />

    <ion-content :fullscreen="true">
      <div
        v-if="loading"
        class="ion-text-center ion-padding"
      >
        <ion-spinner />
      </div>

      <div
        v-else-if="workout"
        class="ion-padding-bottom h-full"
      >
        <!-- Planned View -->
        <workout-planned-view v-if="workoutStatus === WorkoutStatus.PLANNED" />

        <!-- Ongoing View -->
        <workout-ongoing-view v-else-if="workoutStatus === WorkoutStatus.ONGOING" />

        <!-- Completed View -->
        <workout-completed-view v-else-if="workoutStatus === WorkoutStatus.COMPLETED" />
      </div>
      <div v-else>
        No workout
      </div>

      <ion-fab
        v-if="workoutStatus === WorkoutStatus.PLANNED"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        class="ion-margin"
      >
        <ion-fab-button @click="openAddModal">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button
          v-if="workoutStatus === WorkoutStatus.ONGOING"
          expand="block"
          color="danger"
          @click="endTraining"
        >
          Stop Training
        </ion-button>
        <ion-button
          v-else-if="workoutStatus === WorkoutStatus.PLANNED"
          expand="block"
          color="success"
          @click="startTraining"
        >
          Start Training
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
