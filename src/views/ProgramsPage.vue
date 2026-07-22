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
    component: ProgramSettingsModal
  });
  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data) {
    try {
      await programService.createProgram({
        userId: currentUser.value?.uid || '',
        ...data,
        workouts: []
      });
    } catch (err: any) {
      error.value = err.message;
    }
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
    try {
      await programService.updateProgram(program.id, data);
    } catch (err: any) {
      error.value = err.message;
    }
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

<template>
  <AppLayout title="Workout Programs" :loading="loading">
    <!-- Empty State -->
    <div v-if="programs.length === 0" class="empty-state">
      <EmptyState
        title="No programs yet"
        description="Create your first workout program to get started!"
        :action="{ label: 'Create Program', onClick: openCreateModal }"
      />
    </div>

    <!-- Programs List -->
    <IonList v-else>
      <IonCard
        v-for="program in programs"
        :key="program.id"
        button
        color="light"
        @click="openProgram(program)">
        <IonCardHeader class="ion-flex-column">
          <IonCardSubtitle class="ion-display-flex ion-align-items-center ion-justify-content-between">
            <IonBadge :color="program.isActive ? 'success' : 'danger'">
              {{ program.isActive ? 'Active' : 'Inactive' }}
            </IonBadge>
            <span>{{ program.difficultyLevel }}</span>
          </IonCardSubtitle>
          <IonCardTitle>{{ program.name }}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p v-if="program.description">{{ program.description }}</p>
          <div class="ion-display-flex ion-align-items-center ion-justify-content-between">
            <IonChip color="medium">Workouts: {{ program.workouts.length }}</IonChip>
            <div>
            <IonButton shape="round" @click.stop="openEditModal(program)">
              <IonIcon slot="icon-only" :icon="pencil" />
            </IonButton>
            <IonButton shape="round" color="danger" @click.stop="confirmDelete(program)">
              <IonIcon slot="icon-only" :icon="trash" />
            </IonButton>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </IonList>

    <!-- FAB for creating new program -->
    <template #fab>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="openCreateModal">
          <IonIcon :icon="add" />
        </IonFabButton>
      </IonFab>
    </template>
  </AppLayout>
</template>
