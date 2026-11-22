// tests/unit/views/AccountPage.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import AccountPage from '@/views/AccountPage.vue';
import { createMockAuth } from '../../../cypress/fixtures/mockAuth';
import { mockPersonalData, mockAuthUser } from '../../../cypress/fixtures/seedData.fixture';
import { ionicStubs } from '../../../cypress/fixtures/ionicStubs';

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

    expect(wrapper.text()).toContain('Demo User');
    expect(wrapper.text()).toContain('Version: 1.0.0-test');
  });

  it('logs out user and navigates to /login', async () => {
    const wrapper = mountAccountPage();

    const logoutMenuItem = wrapper.find('#logout-btn');
    expect(logoutMenuItem).toBeDefined();

    await logoutMenuItem.trigger('click');

    expect(mockAuth.currentUser.value).toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });
});
