<script setup lang="ts">
import { getStartOfWeek, isSameDay } from '@/helpers/date.helper';
import { Workout } from '@/types/firebase.types';
import { computed } from 'vue';

const selectedDate = defineModel<Date>({ required: true });
const { workouts = [] } = defineProps<{
  workouts: Workout[],
}>();

// Generate days for the current week view
const currentWeekDays = computed(() => {
  const days = [];
  const start = getStartOfWeek(selectedDate.value);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      dayNumber: d.getDate()
    });
  }
  return days;
});

// Check if a specific date has any workouts
const hasWorkout = (date: Date) => {
  return workouts.some(w => {
    const wDate = w.date ? new Date(w.date) : (w.createdAt ? new Date(w.createdAt) : new Date());
    return isSameDay(wDate, date);
  });
};
</script>

<template>
  <div class="week-days-container">
    <div 
      v-for="day in currentWeekDays" 
      :key="day.date.toISOString()"
      class="day-card"
      :class="{ 'active': isSameDay(day.date, selectedDate) }"
      @click="selectedDate = day.date"
    >
      <span class="day-name">{{ day.dayName }}</span>
      <span class="day-number">{{ day.dayNumber }}</span>
      <div class="workout-indicator" v-if="hasWorkout(day.date)"></div>
    </div>
  </div>
</template>

<style scoped>
.week-days-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem 0 0;
}

.day-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 60px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-card.active {
  background-color: var(--ion-color-primary);
  color: white;
  box-shadow: 0 4px 10px rgba(var(--ion-color-primary-rgb), 0.3);
}

.day-name {
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.8;
}

.day-number {
  font-size: 1rem;
  font-weight: 700;
}

.workout-indicator {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--ion-color-primary);
}

.day-card.active .workout-indicator {
  background-color: white;
}
</style>
