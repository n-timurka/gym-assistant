import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '@/views/LoginPage.vue';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  clearError: vi.fn(),
  push: vi.fn(),
  error: { __v_isRef: true, value: null as string | null },
  loading: { __v_isRef: true, value: false },
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    login: mocks.login,
    clearError: mocks.clearError,
    error: mocks.error,
    loading: mocks.loading,
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

const passthroughStub = { template: '<div><slot /></div>' };

const mountLoginPage = () => mount(LoginPage, {
  global: {
    stubs: {
      IonPage: passthroughStub,
      IonContent: passthroughStub,
      IonCard: passthroughStub,
      IonCardContent: passthroughStub,
      IonItem: passthroughStub,
      IonLabel: passthroughStub,
      IonIcon: true,
      IonSpinner: true,
      IonInput: {
        props: ['modelValue'],
        emits: ['update:modelValue', 'ion-blur'],
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'ion-blur\')" />',
      },
      IonButton: {
        props: ['disabled'],
        template: '<button :disabled="disabled"><slot /></button>',
      },
    },
  },
});

describe('LoginPage', () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.clearError.mockReset();
    mocks.push.mockReset();
    mocks.error.value = null;
    mocks.loading.value = false;
  });

  it('renders the sign-in form', () => {
    const wrapper = mountLoginPage();

    expect(wrapper.text()).toContain('Gym Assistant');
    expect(wrapper.text()).toContain('Sign in to continue');
    expect(wrapper.find('.login-button').attributes('disabled')).toBeDefined();
  });

  it('shows validation errors and does not submit invalid credentials', async () => {
    const wrapper = mountLoginPage();
    const inputs = wrapper.findAll('input');

    await inputs[0].trigger('blur');
    await inputs[1].trigger('blur');

    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates after a successful login', async () => {
    mocks.login.mockResolvedValue({ success: true });
    const wrapper = mountLoginPage();
    const inputs = wrapper.findAll('input');

    await inputs[0].setValue('athlete@example.com');
    await inputs[1].setValue('secure-password');
    await wrapper.find('.login-button').trigger('click');
    await flushPromises();

    expect(mocks.clearError).toHaveBeenCalledOnce();
    expect(mocks.login).toHaveBeenCalledWith('athlete@example.com', 'secure-password');
    expect(mocks.push).toHaveBeenCalledWith('/tabs/workouts');
  });

  it('does not navigate when login fails', async () => {
    mocks.login.mockResolvedValue({ success: false });
    const wrapper = mountLoginPage();
    const inputs = wrapper.findAll('input');

    await inputs[0].setValue('athlete@example.com');
    await inputs[1].setValue('wrong-password');
    await wrapper.find('.login-button').trigger('click');
    await flushPromises();

    expect(mocks.push).not.toHaveBeenCalled();
  });
});
