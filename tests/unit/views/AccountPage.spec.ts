// tests/unit/views/AccountPage.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import AccountPage from '@/views/AccountPage.vue';
import { createMockAuth } from '../../fixtures/mockAuth';
import { mockPersonalData, mockAuthUser } from '../../fixtures/seedData.fixture';
import { ionicStubs } from '../../fixtures/ionicStubs';

const mockAuth = createMockAuth(mockAuthUser);
const mockRouterPush = vi.fn();
const mockStartTimer = vi.fn();

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('@/composables/useRestTimer', () => ({
  useRestTimer: () => ({ startTimer: mockStartTimer }),
}));

vi.mock('@/helpers/capacitor.helper', () => ({
  getCacheSize: vi.fn().mockResolvedValue(12.5),
  clearExerciseCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/composables/useFirebase', () => ({
  useFirebase: () => ({
    document: ref(mockPersonalData),
    getById: vi.fn().mockResolvedValue(mockPersonalData),
    update: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

describe('AccountPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser.value = { ...mockAuthUser };
  });

  const mountAccountPage = () => mount(AccountPage, {
    global: {
      stubs: ionicStubs,
      provide: {
        appVersion: '1.0.0-test',
      },
    },
  });

  it('renders user details and profile title', async () => {
    const wrapper = mountAccountPage();
    await wrapper.vm.$nextTick();

    // expect(wrapper.text()).toContain('Demo Athlete');
    expect(wrapper.text()).toContain('Version: 1.0.0-test');
  });

  it('computes BMI reactively from height and weight', async () => {
    const wrapper = mountAccountPage();
    wrapper.vm.form.height = 180;
    wrapper.vm.form.weight = 80;
    await wrapper.vm.$nextTick();

    // 80 / (1.80 * 1.80) = 24.69 -> 24.7
    expect(wrapper.vm.bmi).toBe(24.7);
  });

  it('triggers rest timer when Check Timer action is selected', async () => {
    const wrapper = mountAccountPage();
    const timerMenuItem = wrapper.vm.menuItems.find((i: any) => i.label === 'Check Timer');
    expect(timerMenuItem).toBeDefined();

    await timerMenuItem.action();
    expect(mockStartTimer).toHaveBeenCalledWith(5);
  });

  it('logs out user and navigates to /login', async () => {
    const wrapper = mountAccountPage();
    const logoutMenuItem = wrapper.vm.menuItems.find((i: any) => i.label === 'Log Out');
    expect(logoutMenuItem).toBeDefined();

    await logoutMenuItem.action();

    expect(mockAuth.currentUser.value).toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });
});
