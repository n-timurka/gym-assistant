import { useFirebase } from '../composables/useFirebase';
import { Collections, Program } from '../types/firebase.types';

const { getAll, getById, create, update, remove, subscribe } = useFirebase<Program>(Collections.PROGRAMS);

export const programService = {
    /**
     * Get all programs for a specific user
     */
    getUserPrograms: async (userId: string) => {
        return await getAll({
            where: [
                {
                    field: 'userId',
                    operator: '==',
                    value: userId
                }
            ],
            orderBy: {
                field: 'createdAt',
                direction: 'desc'
            }
        });
    },

    /**
     * Get a program by ID
     */
    getProgramById: async (id: string) => {
        return await getById(id);
    },

    /**
     * Create a new program
     */
    createProgram: async (programData: Omit<Program, 'id'>) => {
        return await create(programData);
    },

    /**
     * Update an existing program
     */
    updateProgram: async (id: string, programData: Partial<Omit<Program, 'id'>>) => {
        return await update(id, programData);
    },

    /**
     * Delete a program
     */
    deleteProgram: async (id: string) => {
        return await remove(id);
    },

    /**
     * Subscribe to real-time updates for a user's programs
     */
    subscribeUserPrograms: (userId: string, callback: (programs: Program[]) => void) => {
        return subscribe(
            {
                where: [
                    {
                        field: 'userId',
                        operator: '==',
                        value: userId
                    }
                ],
                orderBy: {
                    field: 'createdAt',
                    direction: 'desc'
                }
            },
            callback
        );
    }
};
