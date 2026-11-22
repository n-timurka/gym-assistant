import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import WorkoutsPage from '@/views/WorkoutsPage.vue';
import { WorkoutStatus, type Workout, type QueryOptions } from '@/types/firebase.types';

vi.mock('@/components/workout/WorkoutCard.vue', () => ({
  default: {
    name: 'WorkoutCard',
    props: ['date', 'workout'],
    template: '<div class="workout-card-stub" :data-id="workout?.id" />',
  },
}));

const mockUnsubscribe = vi.fn();
const mockSubscribe = vi.fn(
  (_options?: QueryOptions, _callback?: (docs: Workout[]) => void) => mockUnsubscribe,
);
const mockWorkouts = ref<Workout[]>([]);
const mockCurrentUser = ref<{ uid: string; email: string } | null>({
  uid: 'user-abc',
  email: 'test@example.com',
});

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}));
vi.mock('@/composables/useFirebase', () => ({
  useFirebase: () => ({
    documents: mockWorkouts,
    subscribe: mockSubscribe,
  }),
}));

describe('WorkoutsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkouts.value = [];
    mockCurrentUser.value = { uid: 'user-abc', email: 'test@example.com' };
  });

  it('subscribes to workouts for the current week on mount', () => {
    mount(WorkoutsPage);

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    const [queryConfig] = mockSubscribe.mock.calls[0] ?? [];

    expect(queryConfig?.where).toEqual(
      expect.arrayContaining([
        { field: 'userId', operator: '==', value: 'user-abc' },
      ])
    );
    expect(queryConfig?.orderBy).toEqual({
      field: 'date',
      direction: 'asc',
    });
  });

  it('passes selectedDateWorkout to WorkoutCard when workout matches selected date', () => {
    const today = new Date();
    const todayWorkout: Workout = {
      id: 'w-today',
      userId: 'user-abc',
      date: today,
      status: WorkoutStatus.PLANNED,
      exercises: [],
    };
    mockWorkouts.value = [todayWorkout];

    const wrapper = mount(WorkoutsPage);

    const workoutCard = wrapper.findComponent({ name: 'WorkoutCard' });
    expect(workoutCard.exists()).toBe(true);
    expect(workoutCard.props('workout')).toEqual(todayWorkout);
  });

  it('renders layout title Workouts', () => {
    const wrapper = mount(WorkoutsPage);
    const appLayout = wrapper.findComponent({ name: 'AppLayout' });
    expect(appLayout.props('title')).toBe('Workouts');
  });
});
