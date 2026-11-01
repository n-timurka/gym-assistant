import type { UserProfile } from "@/types/firebase.types";

export const users: (Omit<UserProfile, "id"> & { extId: string })[] = [
    {
        extId: "demo-user",
        displayName: "Demo User",
        email: "demo@gym-assistant.local",
        goals: ["Build strength", "Improve consistency"],
        preferences: {
            units: "metric",
            workoutsPerWeek: 3,
        },
    },
];
