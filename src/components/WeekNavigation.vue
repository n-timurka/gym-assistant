<script setup lang="ts">
import { getEndOfWeek, getWeekDisplay } from '@/helpers/date.helper';
import { IonButton, IonIcon } from '@ionic/vue';
import {  chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { computed } from 'vue';

const currentWeekStart = defineModel<Date>({ required: true })

const prevWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() - 7);
  currentWeekStart.value = newDate;
};
const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() + 7);
  currentWeekStart.value = newDate;
};

const weekDisplay = computed(() => {
  const start = currentWeekStart.value;
  const end = getEndOfWeek(start);
  
  return getWeekDisplay(start, end)
});
</script>

<template>
  <div class="week-navigation-header">
    <IonButton fill="clear" @click="prevWeek">
      <IonIcon slot="icon-only" :icon="chevronBackOutline" />
    </IonButton>
    <h2>{{ weekDisplay }}</h2>
    <IonButton fill="clear" @click="nextWeek">
      <IonIcon slot="icon-only" :icon="chevronForwardOutline" />
    </IonButton>
  </div>
</template>

<style scoped>
.week-navigation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  ion-button {
    --background: var(--ion-color-secondary);
    --color: var(--ion-color-muted-foreground);
    border-radius: 0.75rem; 
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms; 

    ion-icon {
      width: 1.25rem; 
      height: 1.25rem; 
      padding: 0.5rem; 
    }
  }
}

.week-navigation-header h2 {
  font-size: 0.875rem;
  line-height: 1.25rem; 
  font-weight: 700; 
  color: var(--ion-color-foreground);
}
</style>
