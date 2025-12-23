<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Account</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- User Profile Card -->
        <ion-card v-if="currentUser">
          <ion-card-header>
            <ion-card-title>Profile</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-if="currentUser.displayName">
                <ion-icon :icon="personOutline" slot="start"></ion-icon>
                <ion-label>
                  <h3>Name</h3>
                  <p>{{ currentUser.displayName }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon :icon="mailOutline" slot="start"></ion-icon>
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ currentUser.email }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon :icon="shieldCheckmarkOutline" slot="start"></ion-icon>
                <ion-label>
                  <h3>Email Verified</h3>
                  <p>{{ currentUser.emailVerified ? 'Yes' : 'No' }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Account Actions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Account</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button
              expand="block"
              color="danger"
              @click="handleLogout"
              :disabled="loading"
            >
              <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Logout</span>
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
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
  IonSpinner
} from '@ionic/vue';
import {
  personOutline,
  mailOutline,
  logOutOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
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
};
</script>

<style scoped>
ion-spinner {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
</style>

