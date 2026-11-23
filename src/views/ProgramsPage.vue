<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
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
  modalController,
  alertController,
  IonChip,
} from '@ionic/vue';
import { add, trash, pencil } from 'ionicons/icons';
import { programService } from '@/services/programService';
import { useAuth } from '@/composables/useAuth';
import type { Program } from '@/types/firebase.types';
import ProgramSettingsModal from '@/components/ProgramSettingsModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import AppLayout from '@/components/AppLayout.vue';

const { currentUser } = useAuth();
const router = useRouter();
const programs = ref<Program[]>([]);
const loading = ref(true);
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
    component: ProgramSettingsModal
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data) {
    await programService.createProgram({
      userId: currentUser.value?.uid || '',
      ...data,
      workouts: []
    });
  }
};

const openEditModal = async (program: Program) => {
  const modal = await modalController.create({
    component: ProgramSettingsModal,
    componentProps: {
      program: program
    }
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data) {
    await programService.updateProgram(program.id, data);
  }
};

const openProgram = (program: Program) => {
  router.push(`/programs/${program.id}`);
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
          await programService.deleteProgram(program.id);
        }
      }
    ]
  });
  await alert.present();
};
</script>

<template>
  <app-layout
    title="Programs"
    :loading="loading"
  >
    <!-- Empty State -->
    <div
      v-if="programs.length === 0"
      class="empty-state"
    >
      <empty-state
        title="No programs yet"
        description="Create your first workout program to get started!"
        :action="{ label: 'Create Program', onClick: openCreateModal }"
      />
    </div>

    <!-- Programs List -->
    <ion-list v-else>
      <ion-card
        v-for="program in programs"
        :key="program.id"
        button
        color="light"
        @click="openProgram(program)"
      >
        <ion-card-header class="ion-flex-column">
          <ion-card-subtitle class="ion-display-flex ion-align-items-center ion-justify-content-between">
            <ion-badge :color="program.isActive ? 'success' : 'danger'">
              {{ program.isActive ? 'Active' : 'Inactive' }}
            </ion-badge>
            <span>{{ program.difficultyLevel }}</span>
          </ion-card-subtitle>
          <ion-card-title>{{ program.name }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p v-if="program.description">
            {{ program.description }}
          </p>
          <div class="ion-display-flex ion-align-items-center ion-justify-content-between">
            <ion-chip color="medium">
              Workouts: {{ program.workouts.length }}
            </ion-chip>
            <div>
              <ion-button
                shape="round"
                @click.stop="openEditModal(program)"
              >
                <ion-icon 
                  slot="icon-only"
                  :icon="pencil"
                />
              </ion-button>
              <ion-button
                shape="round"
                color="danger"
                @click.stop="confirmDelete(program)"
              >
                <ion-icon 
                  slot="icon-only"
                  :icon="trash"
                />
              </ion-button>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-list>

    <!-- FAB for creating new program -->
    <ion-fab
      slot="fixed"
      vertical="bottom"
      horizontal="end"
    >
      <ion-fab-button @click="openCreateModal">
        <ion-icon :icon="add" />
      </ion-fab-button>
    </ion-fab>
  </app-layout>
</template>
