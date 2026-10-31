import type { Program } from "@/types/firebase.types";

export const programs: (Omit<Program, "id"> & { extId: string })[] = [
    {
        extId: "demo-fullbody-strength",
        userId: "demo-user",
        name: "Demo Fullbody Strength",
        description: "A starter fullbody program for validating seeded data.",
        workoutsPerWeek: 3,
        difficultyLevel: "Beginner",
        isActive: true,
        workouts: [
            {
                exerciseId: "1",
                sets: 3,
                reps: 8,
            },
            {
                exerciseId: "2",
                sets: 3,
                reps: 8,
            },
            {
                exerciseId: "12",
                sets: 3,
                reps: 10,
            },
        ],
    },
];
