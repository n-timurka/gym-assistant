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

    await wrapper.find('input[name="name"]').setValue('Athlete');
    await wrapper.find('input[name="email"]').setValue('athlete@test.com');
    const password = wrapper.find('input[name="password"]');
    await password.setValue('123');
    await password.trigger('blur');

    expect(wrapper.text()).toContain('Password must be at least 6 characters');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('validates password and confirm password matching', async () => {
    const wrapper = mountSignupPage();

    await wrapper.find('input[name="password"]').setValue('Password123!');
    const confirm = wrapper.find('input[name="confirm"]');
    await confirm.setValue('DifferentPassword!');
    await confirm.trigger('blur');

    expect(wrapper.text()).toContain('Passwords do not match');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('calculates password strength accurately', async () => {
    const wrapper = mountSignupPage();
    const password = wrapper.find('input[name="password"]');
    
    await password.setValue('weak');
    await password.trigger('blur');
    const passwordStrength = wrapper.find('.password-strength');
    const strengthText = wrapper.find('.strength-text');
    expect(passwordStrength.isVisible()).toBe(true);
    expect(strengthText.classes()).toContain('weak');
    expect(strengthText.text()).toContain('Weak');

    await password.setValue('Medium1');
    await password.trigger('blur');
    expect(passwordStrength.isVisible()).toBe(true);
    expect(strengthText.classes()).toContain('medium');
    expect(strengthText.text()).toContain('Medium');

    await password.setValue('StrongPass123!@#');
    await password.trigger('blur');
    expect(passwordStrength.isVisible()).toBe(true);
    expect(strengthText.classes()).toContain('strong');
    expect(strengthText.text()).toContain('Strong');
  });

  it('successfully creates account and navigates to workouts tab', async () => {
    const wrapper = mountSignupPage();

    await wrapper.find('input[name="name"]').setValue('Champion Lifter');
    await wrapper.find('input[name="email"]').setValue('champion@gym.app');
    await wrapper.find('input[name="password"]').setValue('Secret123!');
    const confirm = wrapper.find('input[name="confirm"]');
    await confirm.setValue('Secret123!');
    await confirm.trigger('blur');

    await wrapper.find('button[type="submit"]').trigger('click');
    
    expect(mockAuth.currentUser.value?.displayName).toBe('Champion Lifter');
    expect(mockRouterPush).toHaveBeenCalledWith('/tabs/workouts');
  });
});
