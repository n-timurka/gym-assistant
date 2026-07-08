<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title>{{ program ? 'Edit' : 'Create' }} Program</ion-title>
      <ion-buttons slot="end">
        <ion-button :strong="true" :disabled="!isValid" @click="confirm">
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
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
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
  modalController
} from '@ionic/vue';
import type { Program } from '@/types/firebase.types';

const props = defineProps<{
  program?: Program;
}>();

const formData = reactive({
  name: props.program?.name || '',
  description: props.program?.description || '',
  workoutsPerWeek: props.program?.workoutsPerWeek || 3,
  difficultyLevel: props.program?.difficultyLevel || 'Beginner',
  isActive: props.program?.isActive ?? false
});

const isValid = computed(() => {
  return formData.name.trim().length > 0 && formData.workoutsPerWeek > 0;
});

const cancel = () => modalController.dismiss(null, 'cancel');

const confirm = () => {
  modalController.dismiss({
    name: formData.name.trim(),
    description: formData.description?.trim() || '',
    workoutsPerWeek: formData.workoutsPerWeek,
    difficultyLevel: formData.difficultyLevel,
    isActive: formData.isActive
  }, 'confirm');
};
</script>
