import { ref, Ref, computed } from 'vue';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase.config';
import type { AuthUser, AuthError } from '../types/firebase.types';

/**
 * Vue Composable for Firebase Authentication
 * Provides authentication operations and user state management
 */

// Global state for authentication
const currentUser = ref<AuthUser | null>(null) as Ref<AuthUser | null>;
const loading = ref(true); // Start as true to check initial auth state
const error = ref<string | null>(null);
const authInitialized = ref(false);

// Initialize auth state listener (only once)
let authListenerInitialized = false;

const initializeAuthListener = () => {
    if (authListenerInitialized) return;

    authListenerInitialized = true;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser.value = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || undefined,
                photoURL: user.photoURL || undefined,
                emailVerified: user.emailVerified
            };
        } else {
            currentUser.value = null;
        }
        loading.value = false;
        authInitialized.value = true;
    });
};

export function useAuth() {
    // Initialize listener on first use
    if (!authListenerInitialized) {
        initializeAuthListener();
    }

    const isAuthenticated = computed(() => currentUser.value !== null);

    /**
     * Sign up a new user with email and password
     */
    const signup = async (
        email: string,
        password: string,
        displayName?: string
    ): Promise<{ success: boolean; error?: AuthError }> => {
        loading.value = true;
        error.value = null;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name if provided
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }

            return { success: true };
        } catch (err: any) {
            const authError = handleAuthError(err);
            error.value = authError.message;
            return { success: false, error: authError };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Sign in an existing user with email and password
     */
    const login = async (
        email: string,
        password: string
    ): Promise<{ success: boolean; error?: AuthError }> => {
        loading.value = true;
        error.value = null;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (err: any) {
            const authError = handleAuthError(err);
            error.value = authError.message;
            return { success: false, error: authError };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Sign out the current user
     */
    const logout = async (): Promise<{ success: boolean; error?: AuthError }> => {
        loading.value = true;
        error.value = null;

        try {
            await signOut(auth);
            return { success: true };
        } catch (err: any) {
            const authError = handleAuthError(err);
            error.value = authError.message;
            return { success: false, error: authError };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Send password reset email
     */
    const resetPassword = async (
        email: string
    ): Promise<{ success: boolean; error?: AuthError }> => {
        loading.value = true;
        error.value = null;

        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (err: any) {
            const authError = handleAuthError(err);
            error.value = authError.message;
            return { success: false, error: authError };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Clear error message
     */
    const clearError = () => {
        error.value = null;
    };

    return {
        // State
        currentUser,
        loading,
        error,
        isAuthenticated,
        authInitialized,

        // Methods
        signup,
        login,
        logout,
        resetPassword,
        clearError
    };
}

/**
 * Handle Firebase Auth errors and return user-friendly messages
 */
function handleAuthError(err: any): AuthError {
    const code = err.code || 'unknown';
    let message = 'An error occurred. Please try again.';

    switch (code) {
        case 'auth/email-already-in-use':
            message = 'This email is already registered. Please login instead.';
            break;
        case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
        case 'auth/operation-not-allowed':
            message = 'Email/password authentication is not enabled.';
            break;
        case 'auth/weak-password':
            message = 'Password is too weak. Please use at least 6 characters.';
            break;
        case 'auth/user-disabled':
            message = 'This account has been disabled.';
            break;
        case 'auth/user-not-found':
            message = 'No account found with this email.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
        case 'auth/invalid-credential':
            message = 'Invalid email or password.';
            break;
        case 'auth/too-many-requests':
            message = 'Too many failed attempts. Please try again later.';
            break;
        default:
            message = err.message || message;
    }

    return {
        code,
        message
    };
}
