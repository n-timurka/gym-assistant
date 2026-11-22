import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import WorkoutCard from '@/components/workout/WorkoutCard.vue';
import { ExerciseCategory, ExerciseType, WorkoutStatus, type Exercise, type Workout } from '@/types/firebase.types';

const mockCreate = vi.fn();
const mockRemove = vi.fn();
const mockLoading = ref(false);
const mockCurrentUser = ref<{ uid: string; email: string } | null>({
  uid: 'user-123',
  email: 'test@example.com',
});

const mockExercises = ref<Exercise[]>([
  {
    id: 'ex-bench',
    name: 'Bench Press',
    category: ExerciseCategory.CHEST,
    type: ExerciseType.FREE_WEIGHTS,
  },
]);

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}));

vi.mock('@/composables/useFirebase', () => ({
  useFirebase: () => ({
    loading: mockLoading,
    create: mockCreate,
    remove: mockRemove,
  }),
}));

vi.mock('@/stores/exerciseStore', () => ({
  useExerciseStore: () => ({
    exercises: mockExercises,
  }),
}));

// Stubs that render their default and named slots
const commonStubs = {
  IonCard: { template: '<div class="ion-card"><slot /></div>' },
  IonCardHeader: { template: '<div class="ion-card-header"><slot /></div>' },
  IonCardTitle: { template: '<div class="ion-card-title"><slot /></div>' },
  IonCardSubtitle: { template: '<div class="ion-card-subtitle"><slot /></div>' },
  IonCardContent: { template: '<div class="ion-card-content"><slot /></div>' },
  IonList: { template: '<div class="ion-list"><slot /></div>' },
  IonItem: { template: '<div class="ion-item-stub"><slot /><slot name="end" /></div>' },
  IonButton: {
    template: '<button :data-router-link="routerLink" class="ion-btn" @click="$emit(\'click\')"><slot /><slot name="start" /></button>',
    props: ['routerLink'],
  },
  IonIcon: true,
  IonSpinner: true,
  WorkoutStatusLabel: {
    template: '<span class="status-label">{{ status }}</span>',
    props: ['status'],
  },
  ExerciseCategoryLabel: {
    template: '<span class="category-label">{{ category }}</span>',
    props: ['category'],
  },
};

describe('WorkoutCard.vue', () => {
  const selectedDate = new Date(2026, 10, 22);

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockCurrentUser.value = { uid: 'user-123', email: 'test@example.com' };
  });

  it('renders empty state when no workout is planned', () => {
    const wrapper = mount(WorkoutCard, {
      props: {
        date: selectedDate,
        workout: undefined,
      },
      global: {
        stubs: commonStubs,
      },
    });

    expect(wrapper.find('h3').text()).toBe('No Workout');
    expect(wrapper.text()).toContain('Nothing planned for');
    expect(wrapper.find('.ion-btn').text()).toContain('Create a workout');
  });

  it('calls create workout when Create a workout button is clicked', async () => {
    mockCreate.mockResolvedValueOnce('new-workout-id');

    const wrapper = mount(WorkoutCard, {
      props: {
        date: selectedDate,
        workout: undefined,
      },
      global: {
        stubs: commonStubs,
      },
    });

    await wrapper.find('.ion-btn').trigger('click');

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 'user-123',
      date: selectedDate,
      exercises: [],
      status: WorkoutStatus.PLANNED,
    });
  });

  it('renders workout details, status, exercises, and actions when workout is present', () => {
    const workout: Workout = {
      id: 'workout-101',
      userId: 'user-123',
      date: selectedDate,
      status: WorkoutStatus.PLANNED,
      exercises: [
        {
          exerciseId: 'ex-bench',
          sets: [{ weight: 80, reps: 10, isCompleted: false }],
        },
      ],
    };

    const wrapper = mount(WorkoutCard, {
      props: {
        date: selectedDate,
        workout,
      },
      global: {
        stubs: commonStubs,
      },
    });

    expect(wrapper.find('.status-label').text()).toBe(WorkoutStatus.PLANNED);
    expect(wrapper.find('.ion-item-stub').text()).toContain('Bench Press');
    expect(wrapper.find('.category-label').text()).toBe(ExerciseCategory.CHEST);

    const viewDetailsLink = wrapper.find('[data-router-link="/workouts/workout-101"]');
    expect(viewDetailsLink.exists()).toBe(true);
    expect(viewDetailsLink.text()).toContain('View Details');
  });

  it('calls deleteWorkout and removes workout after user confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockRemove.mockResolvedValueOnce(true);

    const workout: Workout = {
      id: 'workout-101',
      userId: 'user-123',
      date: selectedDate,
      status: WorkoutStatus.PLANNED,
      exercises: [],
    };

    const wrapper = mount(WorkoutCard, {
      props: {
        date: selectedDate,
        workout,
      },
      global: {
        stubs: commonStubs,
      },
    });

    const deleteBtn = wrapper.findAll('.ion-btn').find(b => b.text().includes('Delete Workout'));
    expect(deleteBtn).toBeDefined();
    await deleteBtn!.trigger('click');

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this workout?');
    expect(mockRemove).toHaveBeenCalledWith('workout-101');
  });
});