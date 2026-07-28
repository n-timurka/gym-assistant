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
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItemDivider,
  IonModal,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { logOutOutline, pencil, timeOutline, trash } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import { clearExerciseCache, getCacheSize } from '@/helpers/capacitor.helper';
import AppLayout from '@/components/AppLayout.vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRestTimer } from '@/composables/useRestTimer';
import { db } from '@/firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { PersonalData } from '@/types/firebase.types';

const router = useRouter();
const { currentUser, logout } = useAuth();
const { startTimer } = useRestTimer();
const cacheSize = ref<number|null>();
const personalData = ref<PersonalData | null>(null);
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

const loadPersonalData = async (uid: string) => {
  isLoadingProfile.value = true;
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    personalData.value = snapshot.exists()
      ? ({ id: snapshot.id, ...snapshot.data() } as PersonalData)
      : null;
  } catch (error) {
    console.error('Unable to load personal data:', error);
  } finally {
    isLoadingProfile.value = false;
  }
};

watch(
  () => currentUser.value?.uid,
  (uid) => {
    personalData.value = null;
    if (uid) loadPersonalData(uid);
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
    await setDoc(doc(db, 'users', uid), updatedData, { merge: true });
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
    action: async () => {
      await clearExerciseCache();
    },
  },
  {
    label: 'Check Timer',
    icon: timeOutline,
    action: () => startTimer(5),
  },
  {
    icon: logOutOutline,
    label: "Log Out",
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
  <AppLayout title="Account">
    <IonCard class="account-card">
      <IonButton
        class="edit-profile-button"
        fill="clear"
        aria-label="Edit personal data"
        @click="openEditModal">
        <IonIcon :icon="pencil" />
      </IonButton>
      <IonCardHeader class="ion-display-flex ion-align-items-center ion-flex-column">
        <IonAvatar>
          <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </IonAvatar>
        <IonCardTitle class="ion-margin-vertical">
          {{ personalData?.Name || currentUser?.displayName || 'Your account' }}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div v-if="isLoadingProfile" class="ion-text-center ion-padding">
          <IonSpinner aria-label="Loading personal data" />
        </div>
        <IonList v-else lines="full" class="personal-data-list">
          <IonItem>
            <IonLabel>Birth date</IonLabel>
            <IonNote slot="end">{{ personalData?.birthDate || 'Not set' }}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>Height</IonLabel>
            <IonNote slot="end">{{ personalData?.height ? `${personalData.height} cm` : 'Not set' }}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>Weight</IonLabel>
            <IonNote slot="end">{{ personalData?.weight ? `${personalData.weight} kg` : 'Not set' }}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>BMI</IonLabel>
            <IonNote slot="end">{{ personalData?.bmi || 'Not set' }}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>Body composition</IonLabel>
            <IonNote slot="end">{{ personalData?.bodyComposition || 'Not set' }}</IonNote>
          </IonItem>
          <IonItemDivider>Weight history</IonItemDivider>
          <IonItem v-if="!personalData?.weightHistory?.length">
            <IonNote>No weight entries yet.</IonNote>
          </IonItem>
          <IonItem v-for="entry in personalData?.weightHistory || []" :key="entry.date">
            <IonLabel>{{ new Date(entry.date).toLocaleDateString() }}</IonLabel>
            <IonNote slot="end">{{ entry.weight }} kg</IonNote>
          </IonItem>
        </IonList>
        <IonList lines="none">
          <IonItem
            v-for="item in menuItems"
            :key="item.label"
            :button="true"
            @click="item.action">
            <IonIcon slot="start" :icon="item.icon" />
            <IonLabel>{{ item.label }}</IonLabel>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>

    <IonModal :is-open="isEditOpen" @did-dismiss="isEditOpen = false">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Personal data</IonTitle>
          <IonButtons slot="start">
            <IonButton :disabled="isSaving" @click="isEditOpen = false">Cancel</IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton :strong="true" :disabled="isSaving" @click="savePersonalData">
              {{ isSaving ? 'Saving…' : 'Save' }}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding">
        <IonList>
          <IonItem>
            <IonInput v-model="form.Name" label="Name" label-placement="stacked" placeholder="Your name" />
          </IonItem>
          <IonItem>
            <IonInput v-model="form.birthDate" type="date" label="Birth date" label-placement="stacked" />
          </IonItem>
          <IonItem>
            <IonInput v-model.number="form.height" type="number" min="1" label="Height (cm)" label-placement="stacked" />
          </IonItem>
          <IonItem>
            <IonInput v-model.number="form.weight" type="number" min="1" step="0.1" label="Weight (kg)" label-placement="stacked" />
          </IonItem>
          <IonItem>
            <IonInput :model-value="bmi?.toString() || ''" readonly label="BMI" label-placement="stacked" placeholder="Calculated from height and weight" />
          </IonItem>
          <IonItem>
            <IonInput v-model="form.bodyComposition" label="Body composition" label-placement="stacked" placeholder="e.g. 18% body fat" />
          </IonItem>
        </IonList>
        <IonNote v-if="saveError" color="danger" class="ion-padding-top">{{ saveError }}</IonNote>
      </IonContent>
    </IonModal>
  </AppLayout>
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
