// tests/unit/views/LoginPage.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '@/views/LoginPage.vue';
import { createMockAuth } from '../../fixtures/mockAuth';
import { ionicStubs } from '../../fixtures/ionicStubs';

const mockAuth = createMockAuth(null);
const mockRouterPush = vi.fn();

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

describe('LoginPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser.value = null;
  });

  const mountLoginPage = () => mount(LoginPage, {
    global: { stubs: ionicStubs },
  });

  it('renders application branding and header', () => {
    const wrapper = mountLoginPage();
    expect(wrapper.text()).toContain('Gym Assistant');
    expect(wrapper.text()).toContain('Sign in to continue');
  });

  it('validates email format and disables login button when invalid', async () => {
    const wrapper = mountLoginPage();

    const email = wrapper.find('input[name="email"]');
    await email.setValue('invalid-email-address');
    await email.trigger('blur');

    expect(wrapper.text()).toContain('Invalid email format');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('requires password input', async () => {
    const wrapper = mountLoginPage();

    await wrapper.find('input[name="email"]').setValue('valid@gym.app');
    await wrapper.find('input[name="password"]').setValue('');
    await wrapper.find('input[name="password"]').trigger('blur');

    expect(wrapper.text()).toContain('Password is required');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('displays auth error message when login fails', async () => {
    const wrapper = mountLoginPage();

    await wrapper.find('input[name="email"]').setValue('demo@gym-assistant.local');
    await wrapper.find('input[name="password"]').setValue('WrongPassword!');

    await wrapper.find('button[type="submit"]').trigger('click');

    expect(mockAuth.error.value).toBe('Invalid email or password.');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Invalid email or password.');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('submits valid credentials and routes to /tabs/workouts', async () => {
    const wrapper = mountLoginPage();

    await wrapper.find('input[name="email"]').setValue('demo@gym-assistant.local');
    await wrapper.find('input[name="password"]').setValue('ValidPass123!');
    await wrapper.find('button[type="submit"]').trigger('click');

    expect(mockAuth.currentUser.value).not.toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith('/tabs/workouts');
  });
});
