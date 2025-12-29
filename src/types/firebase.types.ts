// TypeScript types for Firebase/Firestore
import type { DocumentReference } from 'firebase/firestore';

// Authentication types
export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
}

export interface AuthError {
    code: string;
    message: string;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData {
    email: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
}


export interface FirestoreDocument {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Example: Workout data type for gym assistant
export enum ExerciseCategory {
    CHEST = "Chest",
    BACK = "Back",
    SHOULDERS = "Shoulders",
    BICEPS = "Biceps",
    TRICEPS = "Triceps",
    LEGS = "Legs",
    ABS = "Abs",
    CARDIO = "Cardio",
}

export enum ExerciseType {
    FREE_WEIGHTS = "Free weights",
    MACHINES = "Machines",
    CABLE_MACHINE = "Cable Machine",
    NO_EQUIPMENT = "No Equipment",
}

export interface Exercise extends FirestoreDocument {
    name: string;
    description?: string;
    picture?: string;
    videoUrl?: string;
    category: ExerciseCategory;
    type: ExerciseType;
    extId?: string;
    howTo?: string[];
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    tips?: string[];
    similar?: string[];
}

export interface ExerciseSet {
    weight: number;
    reps: number;
    isCompleted: boolean;
}

export interface WorkoutExercise {
    date: string;
    exerciseId: string;
    sets: ExerciseSet[];
    order?: number;
}

export enum WorkoutStatus {
    PLANNED = "Planned",
    ONGOING = "Ongoing",
    COMPLETED = "Completed",
}

export interface Workout extends FirestoreDocument {
    userId: string;
    exercises: WorkoutExercise[];
    status: WorkoutStatus;
    startTime?: string;
    endTime?: string;
    date: Date;
}

// Example: User profile type
export interface UserProfile extends FirestoreDocument {
    displayName: string;
    email: string;
    photoURL?: string;
    goals?: string[];
    preferences?: Record<string, any>;
}

// Progress tracking
export interface Progress extends FirestoreDocument {
    userId: string;
    exerciseId: string; // Exercise document ID for easy querying
    exerciseRef: DocumentReference; // Exercise document reference for data integrity
    date: Date;
    weight: number;
}

// Collection names
export enum Collections {
    WORKOUTS = 'workouts',
    USERS = 'users',
    EXERCISES = 'exercises',
    WEEK_PLANS = 'week_plans',
    PROGRESS = 'progress'
}

export interface WeekPlan extends FirestoreDocument {
    userId: string;
    weekStart: string; // ISO string of the Monday of the week
    exercises: string[]; // Array of exercise IDs
    completed?: string[]; // Array of completed exercise IDs
    exercisesPerWorkout?: number; // Number of exercises to assign per workout
}

// Query options
export interface QueryOptions {
    limit?: number;
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    where?: {
        field: string;
        operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
        value: any;
    }[];
}
