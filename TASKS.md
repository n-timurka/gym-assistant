# Gym Assistant — Tasks Overview

All implementation tasks for Gym Assistant have been prioritized into **P0 (Blockers & Critical Bugs)**, **P1 (Security & Infrastructure)**, and **P2 (Tech Debt & Quality)**.

Please refer to the full task backlog specification:

👉 **[Detailed Task Backlog (`docs/tasks.md`)](./docs/tasks.md)**

---

## Quick Reference

| Priority | Task ID | Summary |
| :---: | :--- | :--- |
| **P0** | [`TASK-P0-01`](./docs/tasks.md#task-p0-01-fix-typescript-compilation-errors-to-unblock-production-build) | Fix TypeScript errors in `WorkoutExerciseCard.vue` & `WorkoutPlannedView.vue` to unblock `npm run build` |
| **P0** | [`TASK-P0-02`](./docs/tasks.md#task-p0-02-fix-rest-timer-countdown-freeze-and-lifecycle-bug) | Fix rest timer countdown freeze on restore & lifecycle hook in `useRestTimer.ts` |
| **P0** | [`TASK-P0-03`](./docs/tasks.md#task-p0-03-fix-capacitors-isnativeplatform-method-call-in-image-cache) | Fix Capacitor `isNativePlatform()` method call in `capacitor.helper.ts` |
| **P1** | [`TASK-P1-01`](./docs/tasks.md#task-p1-01-implement-firestore-and-storage-security-rules) | Create `firestore.rules` and `storage.rules` |
| **P1** | [`TASK-P1-02`](./docs/tasks.md#task-p1-02-define-firestore-composite-indexes-for-compound-queries) | Create `firestore.indexes.json` for compound queries |
| **P1** | [`TASK-P1-03`](./docs/tasks.md#task-p1-03-fix-github-actions-ci--deployment-workflow) | Fix hardcoded project ID and secrets injection in `.github/workflows/deploy.yml` |
| **P1** | [`TASK-P1-04`](./docs/tasks.md#task-p1-04-fix-database-seeding-script-and-foreign-key-resolution) | Fix missing templates import, 2-pass `similar` ID mapping, and CLI script |
| **P1** | [`TASK-P1-05`](./docs/tasks.md#task-p1-05-prevent-infinite-hang-in-auth-navigation-guard-and-app-shell) | Add timeout fallback to router navigation guard & auth loading state |
| **P2** | [`TASK-P2-01`](./docs/tasks.md#task-p2-01-prune-dead-and-orphaned-components-and-helpers) | Remove dead components (`WorkoutsList.vue`, `ExerciseCard.vue`, `ExploreContainer.vue`, etc.) |
| **P2** | [`TASK-P2-02`](./docs/tasks.md#task-p2-02-consolidate-exercise-queries-into-useexercisestore) | Migrate views to shared `useExerciseStore` |
| **P2** | [`TASK-P2-03`](./docs/tasks.md#task-p2-03-align-data-models-and-resolve-cardio-overload-anti-pattern) | Resolve cardio weight/time overload and standardize `PersonalData` casing |
| **P2** | [`TASK-P2-04`](./docs/tasks.md#task-p2-04-overhaul-unit-and-e2e-test-suites) | Rewrite obsolete Cypress tests and add Vitest test suites |
| **P2** | [`TASK-P2-05`](./docs/tasks.md#task-p2-05-upgrade-tooling-and-configure-code-formatter) | Upgrade Vitest/ESLint, add Prettier, update `tsconfig.json` |
