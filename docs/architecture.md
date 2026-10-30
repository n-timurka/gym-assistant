# Gym Assistant — Architecture Documentation

This document describes the architectural principles, component structure, state flow, and system design of **Gym Assistant**.

---

## 1. System Overview

**Gym Assistant** is a cross-platform fitness companion application built for Web, PWA, and Mobile (iOS/Android via Capacitor). It enables users to browse an extensive exercise library, structure workout programs, plan weekly schedules, log ongoing workouts with rest timers, and analyze personal lifting progression.

```mermaid
graph TB
    subgraph Client Application [Client Application (Ionic + Vue 3)]
        direction TB
        subgraph Presentation [Presentation Layer]
            Pages["Views (Workouts, Exercises, Programs, Account)"]
            UIComponents["UI Components & Modals"]
        end

        subgraph DomainState [Domain & State Layer]
            ExerciseStore["Exercise Store (useExerciseStore)"]
            Services["Domain Services (programService, etc.)"]
            Composables["Composables (useAuth, useRestTimer, useNotifications)"]
        end

        subgraph DataAccess [Data Access Layer]
            FirebaseComposable["useFirebase Generic CRUD"]
            FirebaseConfig["firebase.config.ts"]
        end

        subgraph DevicePlatform [Device & Platform Bridge]
            CapacitorBridge["Capacitor Plugins (Filesystem, Haptics, LocalNotifications)"]
            ServiceWorker["PWA Service Worker / CacheStorage"]
        end
    end

    subgraph FirebaseCloud [Firebase Cloud Backend]
        FirebaseAuth["Firebase Authentication"]
        CloudFirestore["Cloud Firestore (Collections: users, exercises, workouts, programs, progress)"]
        CloudStorage["Firebase Cloud Storage (Exercise Media)"]
    end

    Pages --> UIComponents
    Pages --> ExerciseStore
    Pages --> Services
    Pages --> Composables
    ExerciseStore --> FirebaseComposable
    Services --> FirebaseComposable
    Composables --> FirebaseComposable
    Composables --> CapacitorBridge
    Composables --> ServiceWorker
    FirebaseComposable --> FirebaseConfig
    FirebaseConfig --> FirebaseAuth
    FirebaseConfig --> CloudFirestore
    FirebaseConfig --> CloudStorage
```

---

## 2. Technology Stack

| Layer | Technology | Details / Versions |
| :--- | :--- | :--- |
| **UI Framework** | [Vue 3](https://vuejs.org/) | Composition API, `<script setup lang="ts">`, Single File Components |
| **Mobile & Design System** | [Ionic Framework Vue](https://ionicframework.com/) | v8+ (`@ionic/vue`, `@ionic/vue-router`) for native mobile UI parity |
| **Native Runtime** | [Capacitor](https://capacitorjs.com/) | v8+ (`@capacitor/core`, `@capacitor/filesystem`, `@capacitor/haptics`, `@capacitor/local-notifications`) |
| **Bundler & Tooling** | [Vite](https://vitejs.dev/) | Vite 5+, `vite-plugin-pwa`, `vue-tsc` |
| **Backend & Auth** | [Firebase](https://firebase.google.com/) | v12+ (Authentication, Cloud Firestore, Firebase Storage, Firebase Hosting) |
| **Test Runner** | [Vitest](https://vitest.dev/) & [Cypress](https://www.cypress.io/) | Vitest (Unit/Component), Cypress (E2E) |
| **Carousels & Swiping** | [Swiper](https://swiperjs.com/) | v14+ used for workout ongoing card navigation |

---

## 3. Directory Layout

```text
gym-assistant/
├── .github/workflows/       # CI/CD deployment definitions (GitHub Actions)
├── data/                    # Database seeds and initial static exercise catalog
│   ├── exercises.ts         # Pre-configured exercise catalog
│   ├── programs.ts          # Starter programs
│   ├── seed.ts              # Seeding CLI script for Firestore
│   └── users.ts             # Demo user profiles
├── docs/                    # Architectural and developer documentation
│   ├── architecture.md      # This file
│   ├── coding-style.md      # Code standards, formatting, conventions
│   ├── data-schema.md       # Firestore entities, schemas, indexes, rules
│   └── tasks.md             # P0, P1, P2 backlog tasks for implementing agents
├── public/                  # Static assets, sound files (alarm.mp3), PWA manifests
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── program/         # Program-specific components
│   │   └── workout/         # Workout-specific views, cards, modals
│   ├── composables/         # Stateful business logic and service hooks
│   │   ├── useAuth.ts       # Global authentication singleton
│   │   ├── useFirebase.ts   # Generic Firestore collection CRUD composable
│   │   ├── useNotifications.ts # Local push notification abstractions
│   │   ├── useRestTimer.ts  # Rest interval countdown and timer restoration
│   │   └── useSound.ts      # Audio playback abstraction
│   ├── helpers/             # Stateless utilities and device adapters
│   │   ├── capacitor.helper.ts # Native caching and filesystem bridge
│   │   ├── date.helper.ts   # Week boundaries, date formatting, duration math
│   │   └── image-cache.helper.ts # (Deprecated) Web CacheStorage fallback
│   ├── router/              # Ionic Vue Router route definitions and auth guards
│   ├── services/            # Domain service layer (e.g. programService.ts)
│   ├── stores/              # Shared data stores (e.g. exerciseStore.ts)
│   ├── theme/               # Global Ionic CSS palettes and variables
│   ├── types/               # TypeScript interfaces, enums, Firestore document types
│   ├── views/               # Page-level tab and detail views
│   ├── App.vue              # Application root shell, auth loading barrier, timer modal
│   ├── firebase.config.ts   # Firebase client SDK initialization
│   └── main.ts              # App bootstrap and Ionic initialization
├── tests/
│   ├── e2e/                 # Cypress end-to-end specifications
│   └── unit/                # Vitest unit test suites
├── capacitor.config.ts      # Capacitor native runtime configuration
├── firebase.json            # Firebase hosting and project deployment configuration
├── package.json             # NPM dependencies and development scripts
└── vite.config.ts           # Vite build pipeline and PWA Workbox configuration
```

---

## 4. Architectural Layers & Separation of Concerns

### 4.1 Presentation Layer (`src/views/`, `src/components/`)
- **Pages / Views**: Represent Ionic pages (`IonPage`, `IonContent`). Responsible for assembling UI layouts, initiating route transitions, and binding to stores/services.
- **Component Decomposition**:
  - `WorkoutPlannedView.vue`: Displayed before a workout has started; shows planned exercise list, reordering, and workout clearing.
  - `WorkoutOngoingView.vue`: Active workout mode; renders a swipeable Swiper deck of exercises, set logging inputs, and rest timer triggers.
  - `WorkoutCompletedView.vue`: Post-workout summary; lists completion stats and max weights/times.
- **Modals & Dialogs**: Managed via Ionic Vue controllers (`modalController`, `actionSheetController`, `alertController`) or conditional modal wrappers.

### 4.2 State Management & Domain Layer
- **Global Auth Store (`useAuth.ts`)**:
  - Module-scoped reactive refs (`currentUser`, `loading`, `authInitialized`) ensure all consumers share the same auth state.
  - `onAuthStateChanged` is initialized exactly once on first composable call.
- **Exercise Cache Store (`exerciseStore.ts`)**:
  - Encapsulates a single, shared real-time subscription to the `exercises` collection.
  - Prevents redundant network queries when multiple views require exercise metadata.
- **Domain Services (e.g. `programService.ts`)**:
  - Encapsulates Firestore queries, sorting, and user filtering behind semantic methods (e.g., `getUserPrograms(userId)`).
  - Isolates presentation components from raw collection names and query constraints.

### 4.3 Data Access Layer (`useFirebase.ts`)
- **Generic CRUD Composable**:
  - Parameterized with TypeScript types extending `FirestoreDocument`: `useFirebase<T>(collectionName)`.
  - Exposes `getAll(options)`, `getById(id)`, `create(data)`, `update(id, data)`, `remove(id)`, and `subscribe(options, callback)`.
  - Automatic `Timestamp` conversion to native JavaScript `Date` instances.

---

## 5. Cross-Cutting Concerns

### 5.1 Routing & Navigation Guards
- **Route Authorization (`src/router/index.ts`)**:
  - Every route specifies route metadata: `requiresAuth: true` or `requiresGuest: true`.
  - Global `beforeEach` navigation guard awaits `authInitialized` before evaluating route access.
  - Unauthenticated access redirects to `/login`; authenticated users hitting login/signup are redirected to `/tabs/workouts`.

### 5.2 Rest Interval Timer Lifecycle
- `useRestTimer.ts` coordinates rest periods between workout sets:
  - Stores `endTime` and `duration` in `localStorage` to survive page reloads and browser backgrounding.
  - Restores running timers automatically when views re-mount.
  - Broadcasts push notifications via `@capacitor/local-notifications` (native) or service worker messages (web).
  - Floating `RestTimerModal.vue` is rendered at `App.vue` root level so it stays visible across tab changes.

### 5.3 Native vs Web Adaptation
- Platform detection: `isPlatform('ios')` / `isPlatform('android')` from `@ionic/vue`.
- Native operations:
  - Cache exercise images to disk via `@capacitor/filesystem`.
  - Provide haptic feedback on set completion via `@capacitor/haptics`.
  - Schedule local notifications via `@capacitor/local-notifications`.
- Web / PWA fallback:
  - Service worker background notifications.
  - In-memory / HTTP cache headers for media.

---

## 6. Architectural Guidelines for Implementing Agents

1. **Do not introduce Pinia**: The app uses module-scoped reactive stores via the Vue Composition API (`ref`, `computed`, `reactive`). Follow the existing `useExerciseStore` pattern.
2. **Always route exercise access through `useExerciseStore`**: Do not create independent `useFirebase<Exercise>` subscriptions in individual views.
3. **Keep Presentation Components Pure**: Components in `src/components/` should accept typed props and emit typed events. Direct Firestore calls belong in composables or services.
4. **Enforce TypeScript Overloads**: When defining component emits via `defineEmits<{...}>()`, every template `$emit` call must supply matching arguments.
