// tests/fixtures/seedData.fixture.ts
import { exercises } from '../../data/exercises';
import { programs } from '../../data/programs';
import { users } from '../../data/users';
import { Exercise, Program, AuthUser, PersonalData } from '../../src/types/firebase.types';

/**
 * Standard test user extracted from users seed data
 */
export const mockAuthUser: AuthUser = {
  uid: users[0].extId, // "demo-user"
  email: users[0].email, // "demo@gym-assistant.local"
  displayName: users[0].displayName,
  emailVerified: true,
};

/**
 * Realistic personal data for AccountPage tests
 */
export const mockPersonalData: PersonalData = {
  id: mockAuthUser.uid,
  userId: mockAuthUser.uid,
  Name: 'Demo Athlete',
  birthDate: '1995-05-15',
  height: 180,
  weight: 80,
  bmi: 24.7,
  bodyComposition: '15% body fat',
  weightHistory: [
    { date: '2026-01-01T08:00:00.000Z', weight: 82 },
    { date: '2026-02-01T08:00:00.000Z', weight: 80 },
  ],
};

/**
 * Seed catalog mapped into typed Exercise documents
 */
export const mockExercises: Exercise[] = exercises.map((item) => ({
  id: item.extId || String(Math.random()),
  name: item.name,
  category: item.category,
  type: item.type,
  description: item.description,
  howTo: item.howTo,
  primaryMuscles: item.primaryMuscles,
  secondaryMuscles: item.secondaryMuscles,
  tips: item.tips,
  similar: item.similar,
}));

export const benchPressExercise = mockExercises.find((e) => e.name === 'Barbell Bench Press')!;
export const squatExercise = mockExercises.find((e) => e.name === 'Barbell Squat')!;

/**
 * Seed programs mapped into typed Program documents
 */
export const mockPrograms: Program[] = programs.map((p) => ({
  id: p.extId,
  userId: p.userId,
  name: p.name,
  description: p.description,
  workoutsPerWeek: p.workoutsPerWeek,
  difficultyLevel: p.difficultyLevel,
  isActive: p.isActive,
  workouts: p.workouts.map((w) => ({
    exerciseId: w.exerciseId,
    sets: w.sets,
    reps: w.reps,
  })),
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}));
