// tests/unit/views/SignupPage.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SignupPage from '@/views/SignupPage.vue';
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

describe('SignupPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser.value = null;
  });

  const mountSignupPage = () => mount(SignupPage, {
    global: { stubs: ionicStubs },
  });

  it('renders signup form and title', () => {
    const wrapper = mountSignupPage();
    expect(wrapper.text()).toContain('Create Account');
    expect(wrapper.text()).toContain('Sign up to get started');
  });

  it('validates minimum password length (at least 6 characters)', async () => {
    const wrapper = mountSignupPage();
    wrapper.vm.formData.email = 'athlete@test.com';
    wrapper.vm.formData.password = '123';
    wrapper.vm.passwordTouched = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Password must be at least 6 characters');
    expect(wrapper.vm.isFormValid).toBe(false);
  });

  it('validates password and confirm password matching', async () => {
    const wrapper = mountSignupPage();
    wrapper.vm.formData.password = 'Password123!';
    wrapper.vm.formData.confirmPassword = 'DifferentPassword!';
    wrapper.vm.confirmPasswordTouched = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Passwords do not match');
    expect(wrapper.vm.isFormValid).toBe(false);
  });

  it('calculates password strength accurately', async () => {
    const wrapper = mountSignupPage();

    wrapper.vm.formData.password = 'weak';
    expect(wrapper.vm.passwordStrength.class).toBe('weak');

    wrapper.vm.formData.password = 'Medium1';
    expect(wrapper.vm.passwordStrength.class).toBe('medium');

    wrapper.vm.formData.password = 'StrongPass123!@#';
    expect(wrapper.vm.passwordStrength.class).toBe('strong');
  });

  it('successfully creates account and navigates to workouts tab', async () => {
    const wrapper = mountSignupPage();
    wrapper.vm.formData.displayName = 'Champion Lifter';
    wrapper.vm.formData.email = 'champion@gym.app';
    wrapper.vm.formData.password = 'Secret123!';
    wrapper.vm.formData.confirmPassword = 'Secret123!';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isFormValid).toBe(true);

    await wrapper.vm.handleSignup();
    expect(mockAuth.currentUser.value?.displayName).toBe('Champion Lifter');
    expect(mockRouterPush).toHaveBeenCalledWith('/tabs/workouts');
  });
});
