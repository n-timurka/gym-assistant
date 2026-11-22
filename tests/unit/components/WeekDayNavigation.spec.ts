import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekDayNavigation from '@/components/WeekDayNavigation.vue';
import { WorkoutStatus, type Workout } from '@/types/firebase.types';

describe('WeekDayNavigation.vue', () => {
  const wednesday = new Date(2026, 10, 18); // Nov 18, 2026
  const mockWorkouts: Workout[] = [
    {
      id: 'w-1',
      userId: 'user-1',
      date: new Date(2026, 10, 18),
      status: WorkoutStatus.PLANNED,
      exercises: [],
    },
    {
      id: 'w-2',
      userId: 'user-1',
      date: new Date(2026, 10, 20),
      status: WorkoutStatus.COMPLETED,
      exercises: [],
    },
  ];

  it('renders 7 days of the week starting from Monday', () => {
    const wrapper = mount(WeekDayNavigation, {
      props: {
        modelValue: wednesday,
        workouts: [],
      },
    });

    const dayCards = wrapper.findAll('.day-card');
    expect(dayCards).toHaveLength(7);

    // Monday Nov 16 to Sunday Nov 22
    expect(dayCards[0].find('.day-number').text()).toBe('16');
    expect(dayCards[6].find('.day-number').text()).toBe('22');
  });

  it('marks the currently selected date with active class', () => {
    const wrapper = mount(WeekDayNavigation, {
      props: {
        modelValue: wednesday,
        workouts: [],
      },
    });

    const dayCards = wrapper.findAll('.day-card');
    // Wednesday is index 2
    expect(dayCards[2].classes()).toContain('active');
    expect(dayCards[0].classes()).not.toContain('active');
  });

  it('shows workout indicator only on days that have workouts', () => {
    const wrapper = mount(WeekDayNavigation, {
      props: {
        modelValue: wednesday,
        workouts: mockWorkouts,
      },
    });

    const dayCards = wrapper.findAll('.day-card');
    // Wednesday (index 2) has workout
    expect(dayCards[2].find('.workout-indicator').exists()).toBe(true);
    // Friday (index 4) has workout
    expect(dayCards[4].find('.workout-indicator').exists()).toBe(true);
    // Monday (index 0) has no workout
    expect(dayCards[0].find('.workout-indicator').exists()).toBe(false);
  });

  it('emits update:modelValue with the clicked date when a day card is clicked', async () => {
    const wrapper = mount(WeekDayNavigation, {
      props: {
        modelValue: wednesday,
        workouts: mockWorkouts,
      },
    });

    const dayCards = wrapper.findAll('.day-card');
    // Click Monday (Nov 16)
    await dayCards[0].trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    const newSelected = emitted![0][0] as Date;
    expect(newSelected.getDate()).toBe(16);
  });
});
