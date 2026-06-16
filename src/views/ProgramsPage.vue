<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout Programs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- Loading State -->
        <div v-if="loading" class="ion-text-center ion-padding">
          <ion-spinner></ion-spinner>
        </div>

        <!-- Error State -->
        <ion-card v-else-if="error" color="danger">
          <ion-card-content>
            <p>{{ error }}</p>
          </ion-card-content>
        </ion-card>

        <!-- Empty State -->
        <div v-else-if="programs.length === 0" class="empty-state">
          <empty-state
            title="No programs yet"
            description="Create your first workout program to get started!"
            :action="{ label: 'Create Program', onClick: openCreateModal }"
          />
        </div>

        <!-- Programs List -->
        <ion-list v-else>
          <ion-card v-for="program in programs" :key="program.id" class="program-card">
            <ion-card-header>
              <div class="program-header">
                <ion-card-title>{{ program.name }}</ion-card-title>
                <ion-badge :color="program.isActive ? 'success' : 'medium'">
                  {{ program.isActive ? 'Active' : 'Inactive' }}
                </ion-badge>
              </div>
              <ion-card-subtitle>{{ program.difficultyLevel }} • {{ program.workoutsPerWeek }} workouts/week</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <p v-if="program.description">{{ program.description }}</p>
              <div class="program-actions">
                <ion-button fill="clear" @click="openEditModal(program)">Edit</ion-button>
                <ion-button fill="clear" color="danger" @click="confirmDelete(program)">Delete</ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </ion-list>
      </div>

      <!-- FAB for creating new program -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openCreateModal">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSpinner,
  modalController,
  alertController
} from '@ionic/vue';
import { add, listOutline, barbellOutline } from 'ionicons/icons';
import { programService } from '@/services/programService';
import { useAuth } from '@/composables/useAuth';
import type { Program } from '@/types/firebase.types';
import CreateProgramModal from '@/components/CreateProgramModal.vue';
import EmptyState from '@/components/EmptyState.vue';

const { currentUser } = useAuth();
const programs = ref<Program[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (currentUser.value) {
    loading.value = true;
    unsubscribe = programService.subscribeUserPrograms(currentUser.value.uid, (data) => {
      programs.value = data;
      loading.value = false;
    });
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const openCreateModal = async () => {
  const modal = await modalController.create({
    component: CreateProgramModal
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data) {
    try {
      await programService.createProgram(data);
    } catch (err: any) {
      error.value = err.message;
    }
  }
};

const openEditModal = async (program: Program) => {
  const modal = await modalController.create({
    component: CreateProgramModal,
    componentProps: {
      program: program
    }
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data) {
    try {
      await programService.updateProgram(program.id, data);
    } catch (err: any) {
      error.value = err.message;
    }
  }
};

const confirmDelete = async (program: Program) => {
  const alert = await alertController.create({
    header: 'Delete Program',
    message: `Are you sure you want to delete "${program.name}"?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await programService.deleteProgram(program.id);
          } catch (err: any) {
            error.value = err.message;
          }
        }
      }
    ]
  });
  await alert.present();
};
</script>

<style scoped>
.header-section {
  margin-bottom: 2rem;
}

.header-section h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.header-section p {
  color: var(--ion-color-medium);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--ion-color-medium);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.program-card {
  margin: 0 0 1rem 0;
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.program-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
