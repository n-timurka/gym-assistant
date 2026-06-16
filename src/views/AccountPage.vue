<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Account</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ currentUser?.displayName }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item v-for="item in menuItems" :key="item.label">
                <ion-label>
                  <ion-button
                    v-if="item.action"
                    size="default" color="danger" expand="block" fill="clear"
                    :disabled="loading"
                    @click="item.action">
                    <ion-icon v-if="item.icon" :icon="item.icon" slot="start"></ion-icon>
                    {{ item.label }}
                  </ion-button>
                  <template v-else>{{ item.label }}</template>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { currentUser, logout, loading } = useAuth();

/**
 * Handle logout
 */
const handleLogout = async () => {
  const result = await logout();

  if (result.success) {
    router.push('/login');
  }
}

const menuItems = [
  // { icon: personOutline, label: "Settings" },
  // { icon: personOutline, label: "Notifications" },
  // { icon: personOutline, label: "Help & Support" },
  {
    icon: logOutOutline,
    label: "Log Out",
    action: handleLogout,
  },
];
</script>

<style scoped>
ion-spinner {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
</style>

