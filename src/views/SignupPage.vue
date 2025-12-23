<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="signup-container">
        <!-- Logo/Header -->
        <div class="header-section">
          <ion-icon :icon="barbellOutline" class="logo-icon"></ion-icon>
          <h1 class="app-title">Gym Assistant</h1>
          <p class="app-subtitle">Start your fitness journey</p>
        </div>

        <!-- Signup Form -->
        <ion-card class="auth-card">
          <ion-card-content>
            <h2 class="form-title">Create Account</h2>
            <p class="form-subtitle">Sign up to get started</p>

            <!-- Error Alert -->
            <ion-item v-if="authError" lines="none" class="error-item">
              <ion-label class="error-message">
                <ion-icon :icon="alertCircleOutline" slot="start"></ion-icon>
                {{ authError }}
              </ion-label>
            </ion-item>

            <!-- Display Name Input -->
            <ion-item class="input-item">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.displayName"
                type="text"
                label="Name (Optional)"
                label-placement="floating"
                placeholder="Your name"
                :disabled="authLoading"
              ></ion-input>
            </ion-item>

            <!-- Email Input -->
            <ion-item class="input-item" :class="{ 'ion-invalid': emailError && emailTouched }">
              <ion-icon :icon="mailOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.email"
                type="email"
                label="Email"
                label-placement="floating"
                placeholder="your@email.com"
                @ion-blur="emailTouched = true"
                :disabled="authLoading"
              ></ion-input>
            </ion-item>
            <div v-if="emailError && emailTouched" class="validation-error">
              {{ emailError }}
            </div>

            <!-- Password Input -->
            <ion-item class="input-item" :class="{ 'ion-invalid': passwordError && passwordTouched }">
              <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                label-placement="floating"
                placeholder="At least 6 characters"
                @ion-blur="passwordTouched = true"
                :disabled="authLoading"
              ></ion-input>
              <ion-button
                slot="end"
                fill="clear"
                @click="showPassword = !showPassword"
                :disabled="authLoading"
              >
                <ion-icon
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                  slot="icon-only"
                ></ion-icon>
              </ion-button>
            </ion-item>
            <div v-if="passwordError && passwordTouched" class="validation-error">
              {{ passwordError }}
            </div>

            <!-- Confirm Password Input -->
            <ion-item class="input-item" :class="{ 'ion-invalid': confirmPasswordError && confirmPasswordTouched }">
              <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirm Password"
                label-placement="floating"
                placeholder="Re-enter password"
                @ion-blur="confirmPasswordTouched = true"
                @keyup.enter="handleSignup"
                :disabled="authLoading"
              ></ion-input>
              <ion-button
                slot="end"
                fill="clear"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="authLoading"
              >
                <ion-icon
                  :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
                  slot="icon-only"
                ></ion-icon>
              </ion-button>
            </ion-item>
            <div v-if="confirmPasswordError && confirmPasswordTouched" class="validation-error">
              {{ confirmPasswordError }}
            </div>

            <!-- Password Strength Indicator -->
            <div v-if="formData.password" class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrength.class"
                  :style="{ width: passwordStrength.width }"
                ></div>
              </div>
              <span class="strength-text" :class="passwordStrength.class">
                {{ passwordStrength.text }}
              </span>
            </div>

            <!-- Signup Button -->
            <ion-button
              expand="block"
              class="signup-button"
              @click="handleSignup"
              :disabled="!isFormValid || authLoading"
            >
              <ion-spinner v-if="authLoading" name="crescent"></ion-spinner>
              <span v-else>Create Account</span>
            </ion-button>

            <!-- Login Link -->
            <div class="login-link">
              <span>Already have an account?</span>
              <ion-button fill="clear" size="small" router-link="/login" :disabled="authLoading">
                Sign In
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonLabel,
  IonSpinner
} from '@ionic/vue';
import {
  mailOutline,
  lockClosedOutline,
  barbellOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import type { SignupFormData } from '@/types/firebase.types';

const router = useRouter();
const { signup, error: authError, loading: authLoading, clearError } = useAuth();

// Form data
const formData = ref<SignupFormData>({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
});

// Form state
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const emailTouched = ref(false);
const passwordTouched = ref(false);
const confirmPasswordTouched = ref(false);

// Validation
const emailError = computed(() => {
  if (!formData.value.email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) return 'Invalid email format';
  return '';
});

const passwordError = computed(() => {
  if (!formData.value.password) return 'Password is required';
  if (formData.value.password.length < 6) return 'Password must be at least 6 characters';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!formData.value.confirmPassword) return 'Please confirm your password';
  if (formData.value.password !== formData.value.confirmPassword) return 'Passwords do not match';
  return '';
});

const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && !confirmPasswordError.value;
});

// Password strength
const passwordStrength = computed(() => {
  const password = formData.value.password;
  if (!password) return { width: '0%', text: '', class: '' };

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 2) {
    return { width: '33%', text: 'Weak', class: 'weak' };
  } else if (strength <= 3) {
    return { width: '66%', text: 'Medium', class: 'medium' };
  } else {
    return { width: '100%', text: 'Strong', class: 'strong' };
  }
});

/**
 * Handle signup
 */
const handleSignup = async () => {
  emailTouched.value = true;
  passwordTouched.value = true;
  confirmPasswordTouched.value = true;

  if (!isFormValid.value) return;

  clearError();
  const result = await signup(
    formData.value.email,
    formData.value.password,
    formData.value.displayName || undefined
  );

  if (result.success) {
    // Redirect to main app
    router.push('/tabs/workouts');
  }
};
</script>

<style scoped>
.signup-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 4rem;
  color: var(--ion-color-primary);
  margin-bottom: 1rem;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  color: var(--ion-color-medium);
  margin-top: 0.5rem;
  font-size: 1rem;
}

.auth-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-dark);
}

.form-subtitle {
  color: var(--ion-color-medium);
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.error-item {
  --background: var(--ion-color-danger-tint);
  --border-radius: 8px;
  margin-bottom: 1rem;
}

.error-message {
  color: var(--ion-color-danger);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-item {
  --border-radius: 8px;
  --background: var(--ion-color-light);
  margin-bottom: 0.5rem;
  --padding-start: 12px;
}

.input-item.ion-invalid {
  --border-color: var(--ion-color-danger);
  --border-width: 1px;
}

.validation-error {
  color: var(--ion-color-danger);
  font-size: 0.75rem;
  margin: -0.25rem 0 1rem 0.75rem;
}

.password-strength {
  margin: 0.5rem 0 1.5rem 0;
}

.strength-bar {
  height: 4px;
  background: var(--ion-color-light);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.weak {
  background: var(--ion-color-danger);
}

.strength-fill.medium {
  background: var(--ion-color-warning);
}

.strength-fill.strong {
  background: var(--ion-color-success);
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 600;
}

.strength-text.weak {
  color: var(--ion-color-danger);
}

.strength-text.medium {
  color: var(--ion-color-warning);
}

.strength-text.strong {
  color: var(--ion-color-success);
}

.signup-button {
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.login-link {
  text-align: center;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

ion-spinner {
  width: 20px;
  height: 20px;
}
</style>
