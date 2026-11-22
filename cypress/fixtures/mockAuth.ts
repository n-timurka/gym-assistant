// tests/fixtures/mockAuth.ts
import { ref, computed } from 'vue';
import { mockAuthUser } from './seedData.fixture';
import type { AuthUser, AuthError } from '../../src/types/firebase.types';

export function createMockAuth(initialUser: AuthUser | null = mockAuthUser) {
  const currentUser = ref<AuthUser | null>(initialUser);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authInitialized = ref(true);

  const isAuthenticated = computed(() => currentUser.value !== null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    if (email === mockAuthUser.email && password === 'ValidPass123!') {
      currentUser.value = { ...mockAuthUser };
      loading.value = false;
      return { success: true };
    }

    const authError: AuthError = {
      code: 'auth/invalid-credential',
      message: 'Invalid email or password.',
    };
    error.value = authError.message;
    loading.value = false;
    return { success: false, error: authError };
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    loading.value = true;
    error.value = null;

    if (password.length < 6) {
      const authError: AuthError = {
        code: 'auth/weak-password',
        message: 'Password is too weak. Please use at least 6 characters.',
      };
      error.value = authError.message;
      loading.value = false;
      return { success: false, error: authError };
    }

    currentUser.value = {
      uid: 'new-user-uid',
      email,
      displayName: displayName || 'New Athlete',
      emailVerified: true,
    };
    loading.value = false;
    return { success: true };
  };

  const logout = async () => {
    loading.value = true;
    currentUser.value = null;
    loading.value = false;
    return { success: true };
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      return { success: false, error: { code: 'auth/invalid-email', message: 'Invalid email address.' } };
    }
    return { success: true };
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    currentUser,
    loading,
    error,
    isAuthenticated,
    authInitialized,
    login,
    signup,
    logout,
    resetPassword,
    clearError,
  };
}
