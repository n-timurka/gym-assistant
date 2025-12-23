import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuth } from '@/composables/useAuth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/workouts'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/SignupPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/workouts'
      },
      {
        path: 'workouts',
        component: () => import('@/views/WorkoutsPage.vue')
      },
      {
        path: 'exercises',
        component: () => import('@/views/ExercisesPage.vue')
      },
      {
        path: 'account',
        component: () => import('@/views/AccountPage.vue')
      }
    ]
  },
  {
    path: '/exercises/:id',
    name: 'ExerciseDetail',
    component: () => import('@/views/ExerciseDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workouts/:id',
    name: 'WorkoutDetail',
    component: () => import('@/views/WorkoutDetailPage.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const { isAuthenticated, authInitialized } = useAuth();

  // Wait for auth to initialize
  if (!authInitialized.value) {
    // Watch for auth initialization
    const unwatch = () => {
      if (authInitialized.value) {
        handleNavigation();
      } else {
        setTimeout(unwatch, 50);
      }
    };
    unwatch();
    return;
  }

  handleNavigation();

  function handleNavigation() {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

    if (requiresAuth && !isAuthenticated.value) {
      // Redirect to login if trying to access protected route
      next('/login');
    } else if (requiresGuest && isAuthenticated.value) {
      // Redirect to app if trying to access login/signup while authenticated
      next('/tabs/workouts');
    } else {
      next();
    }
  }
});

export default router;

