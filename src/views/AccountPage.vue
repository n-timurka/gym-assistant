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
} from '@ionic/vue';
import { logOutOutline, trash } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import { clearExerciseCache, getCacheSize } from '@/helpers/capacitor.helper';
import AppLayout from '@/components/AppLayout.vue';
import { computed, onMounted, ref } from 'vue';
import { useRestTimer } from '@/composables/useRestTimer';

const router = useRouter();
const { currentUser, logout } = useAuth();
const cacheSize = ref<number|null>();

onMounted(async () => {
  cacheSize.value = await getCacheSize();
});

const menuItems = computed(() => [
  {
    label: `Clear Cache (${cacheSize.value?.toFixed()} MB)`,
    icon: trash,
    action: async () => {
      await clearExerciseCache();
    },
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

const { startTimer } = useRestTimer();
</script>

<template>
  <AppLayout title="Account">
    <IonCard>
      <IonCardHeader class="ion-display-flex ion-align-items-center ion-flex-column">
        <IonAvatar>
          <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </IonAvatar>
        <IonCardTitle class="ion-margin-vertical">
          {{ currentUser?.displayName }}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
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
        <IonButton @click="startTimer(5)">5 Sec Timer</IonButton>
      </IonCardContent>
    </IonCard>
  </AppLayout>
</template>
