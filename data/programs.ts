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
        workouts: [],
    },
];
