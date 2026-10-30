# Gym Assistant — Implementation Task Backlog

This document defines the actionable implementation tasks prioritized by urgency (**P0 Blocker**, **P1 High Priority**, **P2 Tech Debt & Quality**). Agents and engineers can pick up tasks using the specified instructions, affected files, and acceptance criteria.

---

## Task Board Summary

| ID | Priority | Title | Scope / Domain | Status |
| :--- | :---: | :--- | :--- | :---: |
| [`TASK-P0-01`](#task-p0-01-fix-typescript-compilation-errors-to-unblock-production-build) | **P0** | Fix TypeScript compilation errors to unblock `npm run build` | Build / Vue SFC | 📋 Ready |
| [`TASK-P0-02`](#task-p0-02-fix-rest-timer-countdown-freeze-and-lifecycle-bug) | **P0** | Fix rest timer countdown freeze on restore and lifecycle bug | Composables / State | 📋 Ready |
| [`TASK-P0-03`](#task-p0-03-fix-capacitors-isnativeplatform-method-call-in-image-cache) | **P0** | Fix Capacitor `isNativePlatform` method call in image cache helper | Native / Helpers | 📋 Ready |
| [`TASK-P1-01`](#task-p1-01-implement-firestore-and-storage-security-rules) | **P1** | Implement Firestore and Storage declarative security rules | Security / Firebase | 📋 Ready |
| [`TASK-P1-02`](#task-p1-02-define-firestore-composite-indexes-for-compound-queries) | **P1** | Define Firestore composite indexes configuration | Cloud / Database | 📋 Ready |
| [`TASK-P1-03`](#task-p1-03-fix-github-actions-ci--deployment-workflow) | **P1** | Fix GitHub Actions CI / Deployment workflow | CI/CD / DevOps | 📋 Ready |
| [`TASK-P1-04`](#task-p1-04-fix-database-seeding-script-and-foreign-key-resolution) | **P1** | Fix database seeding script and 2-pass `similar` ID mapping | Database / CLI | 📋 Ready |
| [`TASK-P1-05`](#task-p1-05-prevent-infinite-hang-in-auth-navigation-guard-and-app-shell) | **P1** | Prevent infinite hang in auth navigation guard and app shell | Routing / Reliability | 📋 Ready |
| [`TASK-P2-01`](#task-p2-01-prune-dead-and-orphaned-components-and-helpers) | **P2** | Prune dead, orphaned components and redundant helper modules | Cleanup / Tech Debt | 📋 Ready |
| [`TASK-P2-02`](#task-p2-02-consolidate-exercise-queries-into-useexercisestore) | **P2** | Consolidate duplicate exercise queries into `useExerciseStore` | State Management | 📋 Ready |
| [`TASK-P2-03`](#task-p2-03-align-data-models-and-resolve-cardio-overload-anti-pattern) | **P2** | Align data models and resolve cardio overload anti-pattern | Data Model / Schema | 📋 Ready |
| [`TASK-P2-04`](#task-p2-04-overhaul-unit-and-e2e-test-suites) | **P2** | Overhaul unit and E2E test suites with real assertions | Testing / Quality | 📋 Ready |
| [`TASK-P2-05`](#task-p2-05-upgrade-tooling-and-configure-code-formatter) | **P2** | Upgrade ESLint/Vitest and configure Prettier code formatting | Tooling / DX | 📋 Ready |

---

## Priority P0: Critical Blockers & High-Severity Bugs

### TASK-P0-01: Fix TypeScript Compilation Errors to Unblock Production Build
- **Priority**: P0 (Blocker)
- **Target Files**:
  - [`src/components/workout/WorkoutExerciseCard.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/components/workout/WorkoutExerciseCard.vue)
  - [`src/components/workout/WorkoutPlannedView.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/components/workout/WorkoutPlannedView.vue)
- **Problem Statement**:
  `npm run build` fails with 3 errors:
  1. `WorkoutExerciseCard.vue(24,29)`: `@ionChange="$emit('update-set')"` does not match emit signature `(e: 'update-set', set: ExerciseSet): void`.
  2. `WorkoutExerciseCard.vue(32,29)`: Same overload error for reps input.
  3. `WorkoutPlannedView.vue(86,23)`: `(setIndex) => ...` has an implicit `any` type under strict TypeScript rules.
  4. Additionally, `WorkoutPlannedView.vue` passes obsolete props (`:exercise-name`, `:is-collapsible`, etc.) that were removed from `WorkoutExerciseCard.vue`, causing planned workouts to render without exercise titles.
- **Implementation Instructions**:
  1. In `WorkoutExerciseCard.vue`:
     - Update the inputs to emit the current set object: `@ionChange="$emit('update-set', set)"`.
     - Alternatively, define an optional overload in `defineEmits`: `(e: 'update-set', set?: ExerciseSet): void;`.
  2. In `WorkoutPlannedView.vue`:
     - Type the set index parameter explicitly: `@remove-set="(setIndex: number) => $emit('remove-set', index, setIndex)"`.
     - Clean up obsolete props passed to `<workout-exercise-card>` or restore the exercise header display in `WorkoutPlannedView` so that planned exercises display their title, category, and thumbnail.
- **Acceptance Criteria**:
  - Running `npm run build` executes `vue-tsc && vite build` and exits with code `0`.
  - No TypeScript compile errors in the console.

---

### TASK-P0-02: Fix Rest Timer Countdown Freeze and Lifecycle Bug
- **Priority**: P0 (High Severity Bug)
- **Target Files**:
  - [`src/composables/useRestTimer.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/composables/useRestTimer.ts)
  - [`src/components/RestTimerModal.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/components/RestTimerModal.vue)
- **Problem Statement**:
  In `useRestTimer.ts:80`, `restoreState()` creates a `setInterval` with an empty comment `/* same update logic */`. When a user refreshes or returns to the app while a timer is running, the timer freezes forever. Additionally, calling `onMounted(restoreState)` inside the composable root causes duplicate interval bindings and Vue warnings when invoked outside an active setup context.
- **Implementation Instructions**:
  1. In `useRestTimer.ts`:
     - Extract the timer tick logic into a reusable function `updateRemaining()`:
       ```typescript
       const updateRemaining = () => {
         if (!timerState.endTime.value) return;
         const now = Date.now();
         const remaining = Math.max(0, Math.ceil((timerState.endTime.value - now) / 1000));
         timerState.remainingSeconds.value = remaining;
         if (remaining <= 0) {
           stopTimer();
         }
       };
       ```
     - Use `updateRemaining` in both `startTimer` and `restoreState`.
     - Remove `onMounted(restoreState)` from the root of `useRestTimer()`.
     - Instead, call `restoreState()` once upon application startup (in `App.vue` or inside `RestTimerModal.vue`).
- **Acceptance Criteria**:
  - Starting a 60s timer and reloading the browser page resumes the countdown smoothly from the remaining seconds without freezing.
  - When the timer reaches 0, `stopTimer()` is invoked cleanly and storage keys are removed.

---

### TASK-P0-03: Fix Capacitor's `isNativePlatform` Method Call in Image Cache
- **Priority**: P0 (High Severity Bug)
- **Target Files**:
  - [`src/helpers/capacitor.helper.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/helpers/capacitor.helper.ts)
- **Problem Statement**:
  Lines 33 and 83 check `!Capacitor.isNativePlatform`. In `@capacitor/core`, `isNativePlatform` is a method (`() => boolean`). Because functions are truthy in JavaScript, `!Capacitor.isNativePlatform` evaluates to `false` always, corrupting native/web fallback routing. Furthermore, generated blob URLs are not tracked or revoked, causing memory leaks.
- **Implementation Instructions**:
  1. In `src/helpers/capacitor.helper.ts`:
     - Change `!Capacitor.isNativePlatform` to `!Capacitor.isNativePlatform()` at lines 33 and 83.
     - Add object URL cleanup or management to prevent leaking memory across exercise image displays.
- **Acceptance Criteria**:
  - In a standard web browser, `Capacitor.isNativePlatform()` correctly evaluates to `false` and branches to the web fallback.
  - Image downloads and caching work without runtime exceptions.

---

## Priority P1: Security, Infrastructure & Data Integrity

### TASK-P1-01: Implement Firestore and Storage Security Rules
- **Priority**: P1 (Security Risk)
- **Target Files**:
  - `firestore.rules` (new file)
  - `storage.rules` (new file)
  - [`firebase.json`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/firebase.json)
- **Problem Statement**:
  No security rules are tracked in version control. User data and exercise catalog documents are at risk of unauthorized deletion or tampering if production rules are permissive.
- **Implementation Instructions**:
  1. Create `firestore.rules` using the specification in [`docs/data-schema.md`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/docs/data-schema.md#5-security-rules-specification-firestorerules).
  2. Create `storage.rules` restricting exercise image writes to admin and allowing read access to authenticated users.
  3. Update `firebase.json` to link the rules:
     ```json
     {
       "firestore": {
         "rules": "firestore.rules",
         "indexes": "firestore.indexes.json"
       },
       "storage": {
         "rules": "storage.rules"
       },
       "hosting": { ... }
     }
     ```
- **Acceptance Criteria**:
  - Validated with Firebase Rules emulator or `firebase deploy --only firestore:rules`.
  - Unauthenticated requests are rejected.
  - Users can only read/write their own workouts, programs, and progress.

---

### TASK-P1-02: Define Firestore Composite Indexes for Compound Queries
- **Priority**: P1 (Runtime Precondition Failure)
- **Target Files**:
  - `firestore.indexes.json` (new file)
  - [`firebase.json`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/firebase.json)
- **Problem Statement**:
  Compound queries in `WorkoutsPage.vue`, `programService.ts`, and `WorkoutDetailPage.vue` fail with `FAILED_PRECONDITION` on unindexed Firebase projects.
- **Implementation Instructions**:
  1. Create `firestore.indexes.json` containing the composite indexes specified in [`docs/data-schema.md`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/docs/data-schema.md#4-required-composite-indexes-firestoreindexesjson).
  2. Reference `firestore.indexes.json` in `firebase.json`.
- **Acceptance Criteria**:
  - Running queries on `workouts` (by user + date range) and `programs` (by user + createdAt) succeed without requiring manual console configuration.

---

### TASK-P1-03: Fix GitHub Actions CI / Deployment Workflow
- **Priority**: P1 (DevOps / Pipeline)
- **Target Files**:
  - [`.github/workflows/deploy.yml`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/.github/workflows/deploy.yml)
- **Problem Statement**:
  Line 41 contains `PROJECT_ID: your-firebase-project-id`. Additionally, `npm run build` runs without Vite environment variables, creating a client build with empty Firebase config.
- **Implementation Instructions**:
  1. Replace hardcoded `your-firebase-project-id` with `${{ secrets.FIREBASE_PROJECT_ID }}`.
  2. Pass `VITE_FIREBASE_*` environment secrets to the `npm run build` step.
- **Acceptance Criteria**:
  - Workflow passes syntax lint and accurately references repository secrets.

---

### TASK-P1-04: Fix Database Seeding Script and Foreign Key Resolution
- **Priority**: P1 (Data Integrity)
- **Target Files**:
  - [`data/seed.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/data/seed.ts)
  - [`data/programs.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/data/programs.ts)
  - [`package.json`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/package.json)
- **Problem Statement**:
  1. `data/seed.ts:14` imports `./templates`, which doesn't exist (it is at `src/data/templates.ts`).
  2. `data/programs.ts` uses an invalid shape for `workouts` (array of exercises instead of `ProgramWorkout[]`).
  3. `seed.ts` does not map `similar: ["10", "11"]` (`extId`s) to newly generated Firestore document IDs. As a result, `SimilarExercisesList.vue` queries return zero results.
- **Implementation Instructions**:
  1. Move or import `templates.ts` correctly.
  2. Implement a two-pass seeding mechanism for exercises:
     - *Pass 1*: Write exercise documents and create a mapping of `extId -> doc.id`.
     - *Pass 2*: For each exercise with `similar` items, replace `extId` values with the resolved Firestore document IDs.
  3. Correct the seed data in `data/programs.ts` to match `ProgramWorkout[]`.
  4. Add an npm script `"seed": "tsx data/seed.ts"` to `package.json` (and add `tsx` to `devDependencies`).
- **Acceptance Criteria**:
  - Running `npm run seed -- --type exercises` populates Firestore with resolved document IDs in `similar`.
  - `SimilarExercisesList.vue` successfully displays alternative exercises.

---

### TASK-P1-05: Prevent Infinite Hang in Auth Navigation Guard and App Shell
- **Priority**: P1 (Reliability)
- **Target Files**:
  - [`src/router/index.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/router/index.ts)
  - [`src/App.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/App.vue)
- **Problem Statement**:
  `router.beforeEach` awaits an unresolved promise if `authInitialized` never turns true (e.g. Firebase offline or blocked network). The app stays frozen on `<IonSpinner />` indefinitely.
- **Implementation Instructions**:
  1. Add a timeout (e.g. 5 seconds) to the `authInitialized` watcher promise in `src/router/index.ts`.
  2. If the timeout triggers, fall back to unauthenticated guest mode and show an offline notice.
  3. In `App.vue`, add an error state with a "Retry" button if authentication fails to resolve within a timeout window.
- **Acceptance Criteria**:
  - If network is disabled at launch, the app does not hang forever; it presents an error/retry UI or allows navigation to login with an offline banner.

---

## Priority P2: Refactoring, Cleanup, Quality & Documentation

### TASK-P2-01: Prune Dead and Orphaned Components and Helpers
- **Priority**: P2 (Code Cleanliness)
- **Target Files**:
  - `src/components/WorkoutsList.vue` (delete)
  - `src/components/ExerciseCard.vue` (delete)
  - `src/components/ExploreContainer.vue` (delete)
  - `src/helpers/image-cache.helper.ts` (delete)
  - `src/composables/useSound.ts` (integrate into timer or remove)
- **Problem Statement**:
  Several unused files and starter leftovers remain in the codebase, creating maintenance confusion.
- **Implementation Instructions**:
  1. Verify zero imports across the project for the listed files.
  2. Safely remove them.
  3. Verify that `npm run build` and `npm run lint` succeed after removal.
- **Acceptance Criteria**:
  - Dead files removed without broken import errors.

---

### TASK-P2-02: Consolidate Exercise Queries into `useExerciseStore`
- **Priority**: P2 (Architecture / Performance)
- **Target Files**:
  - [`src/stores/exerciseStore.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/stores/exerciseStore.ts)
  - [`src/views/ExercisesPage.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/views/ExercisesPage.vue)
  - [`src/views/ExerciseDetailPage.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/views/ExerciseDetailPage.vue)
  - [`src/views/ProgramDetailPage.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/views/ProgramDetailPage.vue)
  - [`src/views/WorkoutDetailPage.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/views/WorkoutDetailPage.vue)
- **Problem Statement**:
  Each page independently subscribes to `Collections.EXERCISES`, triggering redundant network traffic and potential out-of-sync cache states.
- **Implementation Instructions**:
  1. Export reactive helper methods (`exercises`, `loading`, `getExercise(id)`) from `useExerciseStore`.
  2. Refactor the above views to consume `useExerciseStore` rather than creating private subscriptions.
- **Acceptance Criteria**:
  - Navigating between Exercises, Workout Detail, and Program Detail pages uses the shared exercise cache without triggering extra Firestore reads.

---

### TASK-P2-03: Align Data Models and Resolve Cardio Overload Anti-Pattern
- **Priority**: P2 (Data Model)
- **Target Files**:
  - [`src/types/firebase.types.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/types/firebase.types.ts)
  - [`src/components/workout/WorkoutCompletedView.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/components/workout/WorkoutCompletedView.vue)
  - [`src/views/WorkoutDetailPage.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/views/WorkoutDetailPage.vue)
  - [`src/views/AccountPage.vue`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/src/views/AccountPage.vue)
- **Problem Statement**:
  1. Overloading `weight` for Cardio duration causes displays like `"30 kg Best"` for running.
  2. `PersonalData.Name` uses PascalCase while all other fields use camelCase.
  3. `UserProfile` is dead code.
- **Implementation Instructions**:
  1. In `WorkoutCompletedView.vue`, inspect exercise category and render `"X min Best"` for Cardio and `"X kg Best"` for lifting.
  2. Standardize `PersonalData` field names to camelCase (`name: string`) and add migration compatibility for legacy documents.
  3. Remove or consolidate `UserProfile`.
- **Acceptance Criteria**:
  - Cardio summary correctly indicates minutes instead of kilograms.

---

### TASK-P2-04: Overhaul Unit and E2E Test Suites
- **Priority**: P2 (Testing)
- **Target Files**:
  - [`tests/e2e/specs/test.cy.ts`](file:///c:/Users/timme/OneDrive/Documents/GitHub/gym-assistant/gym-assistant/tests/e2e/specs/test.cy.ts)
  - `tests/unit/helpers/date.helper.spec.ts` (new)
  - `tests/unit/composables/useRestTimer.spec.ts` (new)
  - `tests/unit/services/programService.spec.ts` (new)
- **Problem Statement**:
  Unit test coverage is <5% and Cypress E2E test asserts boilerplate "Tab 1 page".
- **Implementation Instructions**:
  1. Rewrite `test.cy.ts` to test actual navigation: visiting `/`, redirecting to `/login`, logging in with mock credentials or viewing tabs.
  2. Write unit tests for `date.helper.ts` (testing `getStartOfWeek`, `getEndOfWeek`, `calculateDuration`).
  3. Write unit tests for `useRestTimer.ts` (start, countdown, stop, restore).
- **Acceptance Criteria**:
  - `npm run test:unit` executes and passes all test suites.
  - `npm run test:e2e` passes against the dev server.

---

### TASK-P2-05: Upgrade Tooling and Configure Code Formatter
- **Priority**: P2 (Quality Tooling)
- **Target Files**:
  - `package.json`
  - `.eslintrc.cjs`
  - `.prettierrc` (new)
  - `tsconfig.json`
- **Problem Statement**:
  ESLint 8 is EOL; Vitest is v0.34; Prettier is not configured; `tsconfig.json` excludes tests and seed data.
- **Implementation Instructions**:
  1. Upgrade `vitest` to current stable version (v1.x/v2.x).
  2. Add Prettier with a standard `.prettierrc` configuration and add a `"format": "prettier --write ."` script.
  3. Update `tsconfig.json` `include` array to include `tests/**/*.ts` and all files under `data/`.
- **Acceptance Criteria**:
  - Formatting and linting scripts run cleanly across the entire codebase.
