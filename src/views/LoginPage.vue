<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <!-- Login Form -->
        <ion-card class="auth-card">
          <ion-card-content>
            <h2 class="form-title">Gym Assistant</h2>
            <p class="form-subtitle">Sign in to continue</p>

            <!-- Error Alert -->
            <ion-item v-if="authError" lines="none" class="error-item">
              <ion-label class="error-message">
                <ion-icon :icon="alertCircleOutline" slot="start"></ion-icon>
                {{ authError }}
              </ion-label>
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
                placeholder="Enter your password"
                @ion-blur="passwordTouched = true"
                @keyup.enter="handleLogin"
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

            <!-- Forgot Password -->
            <div class="forgot-password">
              <ion-button fill="clear" size="small" @click="handleForgotPassword" :disabled="authLoading">
                Forgot password?
              </ion-button>
            </div>

            <!-- Login Button -->
            <ion-button
              expand="block"
              class="login-button"
              @click="handleLogin"
              :disabled="!isFormValid || authLoading"
            >
              <ion-spinner v-if="authLoading" name="crescent"></ion-spinner>
              <span v-else>Sign In</span>
            </ion-button>

            <!-- Sign Up Link -->
            <div class="signup-link">
              <span>Don't have an account?</span>
              <ion-button fill="clear" size="small" router-link="/signup" :disabled="authLoading">
                Sign Up
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
  IonSpinner,
  alertController
} from '@ionic/vue';
import {
  mailOutline,
  lockClosedOutline,
  barbellOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useAuth } from '@/composables/useAuth';
import type { LoginFormData } from '@/types/firebase.types';

const router = useRouter();
const { login, error: authError, loading: authLoading, clearError } = useAuth();

// Form data
const formData = ref<LoginFormData>({
  email: '',
  password: ''
});

// Form state
const showPassword = ref(false);
const emailTouched = ref(false);
const passwordTouched = ref(false);

// Validation
const emailError = computed(() => {
  if (!formData.value.email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) return 'Invalid email format';
  return '';
});

const passwordError = computed(() => {
  if (!formData.value.password) return 'Password is required';
  return '';
});

const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value;
});

/**
 * Handle login
 */
const handleLogin = async () => {
  emailTouched.value = true;
  passwordTouched.value = true;

  if (!isFormValid.value) return;

  clearError();
  const result = await login(formData.value.email, formData.value.password);

  if (result.success) {
    // Redirect to main app
    router.push('/tabs/workouts');
  }
};

/**
 * Handle forgot password
 */
const handleForgotPassword = async () => {
  const alert = await alertController.create({
    header: 'Reset Password',
    message: 'Enter your email address to receive a password reset link.',
    inputs: [
      {
        name: 'email',
        type: 'email',
        placeholder: 'your@email.com',
        value: formData.value.email
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Send',
        handler: async (data) => {
          if (data.email) {
            const { resetPassword } = useAuth();
            const result = await resetPassword(data.email);
            
            if (result.success) {
              const successAlert = await alertController.create({
                header: 'Email Sent',
                message: 'Password reset email has been sent. Please check your inbox.',
                buttons: ['OK']
              });
              await successAlert.present();
            }
          }
        }
      }
    ]
  });

  await alert.present();
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
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

.forgot-password {
  text-align: right;
  margin: 0.5rem 0 1.5rem 0;
}

.login-button {
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.signup-link {
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
