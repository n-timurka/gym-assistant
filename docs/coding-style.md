# Gym Assistant — Coding Style & Guidelines

This document outlines the coding standards, design conventions, and architectural best practices required for developing in the **Gym Assistant** codebase.

---

## 1. TypeScript Standards

### 1.1 Strict Typing
- **No `any`**: Do not use the `any` type. If a type cannot be strictly inferred, use a union type, a typed generic, `unknown`, or an explicit interface.
- **Explicit Parameter & Return Types**: Exported helper functions, composables, and services must declare explicit parameter types and return types.

```typescript
// ❌ Bad
export function formatDate(date: any) { ... }

// ✅ Good
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
```

### 1.2 Type Definitions & Naming
- Store shared domain types and interfaces in `src/types/` (e.g. `src/types/firebase.types.ts`).
- Use **PascalCase** for interfaces, type aliases, and enums (`WorkoutExercise`, `ExerciseCategory`).
- Use **camelCase** for properties within interfaces (`userId`, `birthDate`, `isCompleted`).
- Avoid prefixing interfaces with `I` (e.g., use `Workout`, not `IWorkout`).

---

## 2. Vue 3 & Ionic Framework Conventions

### 2.1 Single File Component Structure
All Vue components must use the `<script setup lang="ts">` syntax. Follow this block order:
1. `<script setup lang="ts">`
2. `<template>`
3. `<style scoped>`

### 2.2 Props & Emits Typing
Always declare props and emits with TypeScript type parameters:

```vue
<script setup lang="ts">
import type { WorkoutExercise, ExerciseSet } from '@/types/firebase.types';

// Props definition
const props = withDefaults(defineProps<{
  exercise: WorkoutExercise;
  isCollapsible?: boolean;
}>(), {
  isCollapsible: false,
});

// Emits definition
const emit = defineEmits<{
  (e: 'update-set', set: ExerciseSet): void;
  (e: 'remove-set', index: number): void;
  (e: 'delete-exercise'): void;
}>();
</script>
```

> **Important**: Ensure that any template `$emit` call strictly satisfies the defined emit signature. Never emit an event without its required payload arguments.

### 2.3 Ionic Component Usage
- Prefer PascalCase tag names for Ionic components in templates (`<IonButton>`, `<IonCard>`, `<IonItem>`, `<IonIcon>`).
- Always specify appropriate slots on Ionic children (`slot="start"`, `slot="end"`, `slot="icon-only"`).
- Manage overlays (action sheets, alerts, toasts) through Ionic controllers (`actionSheetController`, `alertController`, `toastController`). Always ensure instances are dismissed cleanly.

---

## 3. Composables & State Management

### 3.1 Composable Structure
- Prefix all composable filenames and functions with `use` (e.g. `useAuth.ts`, `useRestTimer.ts`).
- When state should be shared globally across the app (singleton state), define reactive variables **outside** the composable function at the module scope:

```typescript
// Shared singleton state
const currentUser = ref<AuthUser | null>(null);
const loading = ref(true);

export function useAuth() {
  // Composable methods referencing shared state
  return { currentUser, loading, login, logout };
}
```

### 3.2 Lifecycle Hooks in Composables
- **Do not invoke Vue lifecycle hooks (such as `onMounted` or `onUnmounted`) at the root of a composable** if that composable may be instantiated outside an active component setup execution.
- If a composable requires setup/teardown, expose explicit initialization or cleanup functions (e.g., `init()`, `destroy()`, or `ensureSubscribed()`).

---

## 4. Asynchronous Code & Error Handling

### 4.1 Promise & Async/Await Rules
- Always use `async` / `await` over chained `.then().catch()` callbacks.
- Wrap external I/O (Firestore queries, Capacitor filesystem access, network fetches) in `try / catch / finally` blocks.
- Set appropriate loading indicators (`loading.value = true` in `try`, `loading.value = false` in `finally`).

```typescript
// ✅ Good
const loadWorkout = async (id: string) => {
  loading.value = true;
  error.value = null;
  try {
    workout.value = await getWorkoutById(id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load workout';
    error.value = message;
    console.error('Error loading workout:', err);
  } finally {
    loading.value = false;
  }
};
```

### 4.2 Guarding Against Infinite Promises
- Never create unresolved `new Promise<void>` in router guards or store loaders without a fallback timeout.
- Always provide an escape hatch or error state if an asynchronous initialization check (e.g. Firebase Auth) fails to settle.

---

## 5. File & Folder Conventions

- **Vue Components**: PascalCase (e.g., `src/components/workout/WorkoutExerciseCard.vue`).
- **Composables**: camelCase with `use` prefix (e.g., `src/composables/useNotifications.ts`).
- **Helpers & Utilities**: camelCase with `.helper.ts` suffix (e.g., `src/helpers/date.helper.ts`).
- **Services**: camelCase with `Service.ts` suffix (e.g., `src/services/programService.ts`).
- **Tests**: Mirror the source file path under `tests/unit/` with `.spec.ts` suffix (e.g., `tests/unit/helpers/date.helper.spec.ts`).

---

## 6. Dead Code Policy

- Do not leave unused components, abandoned helper files, or dead code in the repository.
- Do not leave placeholder comments in place of implementation logic (e.g., `/* same update logic */`).
- Every import must be used; run `npm run lint` before committing changes.
