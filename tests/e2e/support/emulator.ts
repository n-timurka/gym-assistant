// tests/e2e/support/emulator.ts
import { ExerciseCategory, ExerciseType, WorkoutStatus, type Exercise, type Workout } from '@/types/firebase.types';

const FIRESTORE_EMULATOR_HOST = 'http://localhost:8080';
const AUTH_EMULATOR_HOST = 'http://localhost:9099';
const STORAGE_EMULATOR_HOST = 'http://localhost:9199';
const PROJECT_ID = cy.env(['FIREBASE_PROJECT_ID']);

export const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    extId: '1',
    name: 'Barbell Bench Press',
    category: ExerciseCategory.CHEST,
    type: ExerciseType.FREE_WEIGHTS,
    description: 'A compound chest exercise that builds upper body strength.',
    primaryMuscles: ['Chest (Pectoralis Major)'],
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    howTo: ['Lie flat on bench.', 'Grip bar shoulder-width.', 'Lower bar to mid-chest.', 'Press bar upward.'],
    tips: ['Keep shoulder blades retracted.', 'Do not bounce the bar.'],
  },
  {
    id: 'ex-2',
    extId: '2',
    name: 'Barbell Squat',
    category: ExerciseCategory.LEGS,
    type: ExerciseType.FREE_WEIGHTS,
    description: 'A fundamental compound lower body exercise.',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    howTo: ['Stand feet shoulder-width apart.', 'Lower hips to parallel.', 'Drive back up.'],
    tips: ['Keep knees tracking over toes.'],
  },
  {
    id: 'ex-3',
    extId: '3',
    name: 'Deadlift',
    category: ExerciseCategory.BACK,
    type: ExerciseType.FREE_WEIGHTS,
    description: 'A compound exercise for the posterior chain.',
    primaryMuscles: ['Lower Back', 'Erector Spinae'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    howTo: ['Stand feet hip-width.', 'Keep spine neutral.', 'Lift to full hip extension.'],
    tips: ['Keep bar close to body.'],
  },
  {
    id: 'ex-4',
    extId: '4',
    name: 'Overhead Barbell Press',
    category: ExerciseCategory.SHOULDERS,
    type: ExerciseType.FREE_WEIGHTS,
    description: 'A vertical pressing exercise for shoulders.',
    primaryMuscles: ['Shoulders (Deltoids)'],
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    howTo: ['Hold bar at shoulder level.', 'Press overhead until arms locked.'],
    tips: ['Keep core braced.'],
  },
  {
    id: 'ex-5',
    extId: '5',
    name: 'Assisted Pull-Ups',
    category: ExerciseCategory.BACK,
    type: ExerciseType.NO_EQUIPMENT,
    description: 'A vertical pulling exercise for back width.',
    primaryMuscles: ['Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    howTo: ['Grip handles.', 'Pull chest toward bar.', 'Lower under control.'],
    tips: ['Avoid swinging.'],
  },
  {
    id: 'ex-6',
    extId: '6',
    name: 'Chest Fly Machine',
    category: ExerciseCategory.CHEST,
    type: ExerciseType.MACHINES,
    description: 'An isolation exercise emphasizing chest contraction.',
    primaryMuscles: ['Chest (Pectoralis Major)'],
    secondaryMuscles: ['Front Deltoids'],
    howTo: ['Sit with back flat.', 'Bring handles together in front of chest.', 'Slowly return.'],
    tips: ['Squeeze chest at peak contraction.'],
  },
];

export function toFirestoreDocument(fields: Record<string, any>) {
  const formatted: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val === null || val === undefined) continue;
    if (typeof val === 'string') formatted[key] = { stringValue: val };
    else if (typeof val === 'number') {
      formatted[key] = Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    } else if (typeof val === 'boolean') formatted[key] = { booleanValue: val };
    else if (val instanceof Date) formatted[key] = { timestampValue: val.toISOString() };
    else if (Array.isArray(val)) {
      formatted[key] = {
        arrayValue: {
          values: val.map((item) => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'object') return { mapValue: { fields: toFirestoreDocument(item) } };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof val === 'object') {
      formatted[key] = { mapValue: { fields: toFirestoreDocument(val) } };
    }
  }
  return formatted;
}

export function resetFirestoreEmulator() {
  return cy.request({
    method: 'DELETE',
    url: `${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    failOnStatusCode: false,
  });
}

export function seedExercises() {
  SEED_EXERCISES.forEach((exercise) => {
    const { id, ...data } = exercise;
    cy.request({
      method: 'PATCH',
      url: `${FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/exercises/${id}`,
      body: { fields: toFirestoreDocument(data) },
    });
  });
}

export function seedOngoingWorkout(workoutId: string, userId: string, date: Date = new Date()) {
  const workoutData = {
    userId,
    status: WorkoutStatus.ONGOING,
    date: date.toISOString(),
    startTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { exerciseId: 'ex-1', order: 0, sets: [{ weight: 50, reps: 10, isCompleted: false }, { weight: 50, reps: 10, isCompleted: false }, { weight: 50, reps: 10, isCompleted: false }] },
      { exerciseId: 'ex-2', order: 1, sets: [{ weight: 70, reps: 10, isCompleted: false }, { weight: 70, reps: 10, isCompleted: false }, { weight: 70, reps: 10, isCompleted: false }] },
      { exerciseId: 'ex-3', order: 2, sets: [{ weight: 90, reps: 8, isCompleted: false }, { weight: 90, reps: 8, isCompleted: false }, { weight: 90, reps: 8, isCompleted: false }] },
      { exerciseId: 'ex-4', order: 3, sets: [{ weight: 35, reps: 10, isCompleted: false }, { weight: 35, reps: 10, isCompleted: false }, { weight: 35, reps: 10, isCompleted: false }] },
      { exerciseId: 'ex-5', order: 4, sets: [{ weight: 0, reps: 10, isCompleted: false }, { weight: 0, reps: 10, isCompleted: false }, { weight: 0, reps: 10, isCompleted: false }] },
    ],
  };

  return cy.request({
    method: 'PATCH',
    url: `${FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/workouts/${workoutId}`,
    body: { fields: toFirestoreDocument(workoutData) },
  });
}
