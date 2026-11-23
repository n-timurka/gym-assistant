<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonButton,
  IonNote,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItemDivider,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { logOutOutline, timeOutline, trash } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import { clearExerciseCache, getCacheSize } from '@/helpers/capacitor.helper';
import AppLayout from '@/components/AppLayout.vue';
import { computed, onMounted, reactive, ref, watch, inject } from 'vue';
import { useRestTimer } from '@/composables/useRestTimer';
import { useFirebase } from '@/composables/useFirebase';
import { Collections, type PersonalData } from '@/types/firebase.types';

const appVersion = inject('appVersion');
const {
  document: personalData,
  getById,
  update
} = useFirebase<PersonalData>(Collections.USERS);

const router = useRouter();
const { currentUser, logout } = useAuth();
const { startTimer } = useRestTimer();
const cacheSize = ref<number|null>();
const isLoadingProfile = ref(false);
const isEditOpen = ref(false);
const isSaving = ref(false);
const saveError = ref<string | null>(null);
const form = reactive({
  Name: '',
  birthDate: '',
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  bodyComposition: '',
});

onMounted(async () => {
  cacheSize.value = await getCacheSize();
});

const bmi = computed(() => {
  if (!form.height || !form.weight || form.height <= 0 || form.weight <= 0) return null;
  return Number((form.weight / Math.pow(form.height / 100, 2)).toFixed(1));
});

watch(
  () => currentUser.value?.uid,
  (uid) => {
    personalData.value = null;
    if (uid) getById(uid);
  },
  { immediate: true },
);

const openEditModal = () => {
  const profile = personalData.value;
  form.Name = profile?.Name || currentUser.value?.displayName || '';
  form.birthDate = profile?.birthDate || '';
  form.height = profile?.height;
  form.weight = profile?.weight;
  form.bodyComposition = profile?.bodyComposition || '';
  saveError.value = null;
  isEditOpen.value = true;
};

const savePersonalData = async () => {
  const uid = currentUser.value?.uid;
  if (!uid || !form.Name.trim() || !form.birthDate || !form.height || !form.weight || !bmi.value) {
    saveError.value = 'Please provide your name, birth date, height, and weight.';
    return;
  }

  isSaving.value = true;
  saveError.value = null;
  const previous = personalData.value;
  const weightHistory = [...(previous?.weightHistory || [])];

  if (!previous || previous.weight !== form.weight) {
    weightHistory.push({ date: new Date().toISOString(), weight: form.weight });
  }

  const updatedData: Omit<PersonalData, 'id'> = {
    userId: uid,
    Name: form.Name.trim(),
    birthDate: form.birthDate,
    height: form.height,
    weight: form.weight,
    bmi: bmi.value,
    bodyComposition: form.bodyComposition.trim(),
    weightHistory,
  };

  try {
    await update(uid, updatedData);
    personalData.value = { id: uid, ...updatedData };
    isEditOpen.value = false;
  } catch (error) {
    console.error('Unable to save personal data:', error);
    saveError.value = 'Your personal data could not be saved. Please try again.';
  } finally {
    isSaving.value = false;
  }
};

const menuItems = computed(() => [
  {
    label: `Clear Cache (${cacheSize.value?.toFixed()} MB)`,
    icon: trash,
    id: 'clear-cache-btn',
    action: async () => {
      await clearExerciseCache();
    },
  },
  {
    label: 'Check Timer',
    icon: timeOutline,
    id: 'check-timer-btn',
    action: () => startTimer(5),
  },
  {
    icon: logOutOutline,
    label: "Log Out",
    id: 'logout-btn',
    action: async () => {
      const result = await logout();

      if (result.success) {
        router.push('/login');
      }
    },
  },
]);
</script>

<template>
  <app-layout title="Account">
    <ion-card class="account-card">
      <ion-button
        class="edit-profile-button"
        fill="clear"
        aria-label="Edit personal data"
        @click="openEditModal"
      >
        Edit
      </ion-button>
      <ion-card-header class="ion-display-flex ion-align-items-center ion-flex-column">
        <ion-avatar>
          <img
            alt=""
            src="https://ionicframework.com/docs/img/demos/avatar.svg"
          >
        </ion-avatar>
        <ion-card-title class="ion-margin-vertical">
          {{ personalData?.Name || currentUser?.displayName || 'Your account' }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div
          v-if="isLoadingProfile"
          class="ion-text-center ion-padding"
        >
          <ion-spinner aria-label="Loading personal data" />
        </div>
        <ion-list
          v-else
          lines="full"
          class="personal-data-list"
        >
          <ion-item>
            <ion-label>Birth date</ion-label>
            <ion-note slot="end">
              {{ personalData?.birthDate || 'Not set' }}
            </ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Height</ion-label>
            <ion-note slot="end">
              {{ personalData?.height ? `${personalData.height} cm` : 'Not set' }}
            </ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Weight</ion-label>
            <ion-note slot="end">
              {{ personalData?.weight ? `${personalData.weight} kg` : 'Not set' }}
            </ion-note>
          </ion-item>
          <ion-item>
            <ion-label>BMI</ion-label>
            <ion-note slot="end">
              {{ personalData?.bmi || 'Not set' }}
            </ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Body composition</ion-label>
            <ion-note slot="end">
              {{ personalData?.bodyComposition || 'Not set' }}
            </ion-note>
          </ion-item>
          <ion-item-divider>Weight history</ion-item-divider>
          <ion-item v-if="!personalData?.weightHistory?.length">
            <ion-note>No weight entries yet.</ion-note>
          </ion-item>
          <ion-item
            v-for="entry in personalData?.weightHistory || []"
            :key="entry.date"
          >
            <ion-label>{{ new Date(entry.date).toLocaleDateString() }}</ion-label>
            <ion-note slot="end">
              {{ entry.weight }} kg
            </ion-note>
          </ion-item>
        </ion-list>
        <ion-list lines="none">
          <ion-item
            v-for="item in menuItems"
            :id="item.id"
            :key="item.label"
            :button="true"
            @click="item.action"
          >
            <ion-icon
              slot="start"
              :icon="item.icon"
            />
            <ion-label>{{ item.label }}</ion-label>
          </ion-item>
          <ion-item>
            <ion-note class="ion-text-center">
              Version: {{ appVersion }}
            </ion-note>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>

    <ion-modal
      :isOpen="isEditOpen"
      @did-dismiss="isEditOpen = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Personal data</ion-title>
          <ion-buttons slot="start">
            <ion-button
              :disabled="isSaving"
              @click="isEditOpen = false"
            >
              Cancel
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button
              :strong="true"
              :disabled="isSaving"
              @click="savePersonalData"
            >
              {{ isSaving ? 'Saving…' : 'Save' }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item>
            <ion-input
              v-model="form.Name"
              label="Name"
              labelPlacement="stacked"
              placeholder="Your name"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="form.birthDate"
              type="date"
              label="Birth date"
              labelPlacement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model.number="form.height"
              type="number"
              min="1"
              label="Height (cm)"
              labelPlacement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model.number="form.weight"
              type="number"
              min="1"
              step="0.1"
              label="Weight (kg)"
              labelPlacement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-input
              :modelValue="bmi?.toString() || ''"
              readonly
              label="BMI"
              labelPlacement="stacked"
              placeholder="Calculated from height and weight"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="form.bodyComposition"
              label="Body composition"
              labelPlacement="stacked"
              placeholder="e.g. 18% body fat"
            />
          </ion-item>
        </ion-list>
        <ion-note
          v-if="saveError"
          color="danger"
          class="ion-padding-top"
        >
          {{ saveError }}
        </ion-note>
      </ion-content>
    </ion-modal>
  </app-layout>
</template>

<style scoped>
.account-card {
  position: relative;
}

.edit-profile-button {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
}

.personal-data-list {
  margin-bottom: 16px;
}

.user-id {
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
