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
    wrapper.vm.formData.email = 'invalid-email-address';
    wrapper.vm.formData.password = 'Pass123!';
    wrapper.vm.emailTouched = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Invalid email format');
    expect(wrapper.vm.isFormValid).toBe(false);
  });

  it('requires password input', async () => {
    const wrapper = mountLoginPage();
    wrapper.vm.formData.email = 'valid@gym.app';
    wrapper.vm.formData.password = '';
    wrapper.vm.passwordTouched = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Password is required');
    expect(wrapper.vm.isFormValid).toBe(false);
  });

  it('toggles password visibility between password and text', async () => {
    const wrapper = mountLoginPage();
    expect(wrapper.vm.showPassword).toBe(false);

    wrapper.vm.showPassword = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showPassword).toBe(true);
  });

  it('displays auth error message when login fails', async () => {
    const wrapper = mountLoginPage();
    wrapper.vm.formData.email = 'demo@gym-assistant.local';
    wrapper.vm.formData.password = 'WrongPassword!';
    await wrapper.vm.$nextTick();

    await wrapper.vm.handleLogin();

    expect(mockAuth.error.value).toBe('Invalid email or password.');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Invalid email or password.');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('submits valid credentials and routes to /tabs/workouts', async () => {
    const wrapper = mountLoginPage();
    wrapper.vm.formData.email = 'demo@gym-assistant.local';
    wrapper.vm.formData.password = 'ValidPass123!';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isFormValid).toBe(true);

    await wrapper.vm.handleLogin();
    expect(mockAuth.currentUser.value).not.toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith('/tabs/workouts');
  });
});
