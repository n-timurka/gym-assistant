import { ref, Ref } from 'vue';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    QueryConstraint,
    DocumentData,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';
import type { FirestoreDocument, QueryOptions } from '../types/firebase.types';

/**
 * Vue Composable for Firebase Firestore operations
 * Provides CRUD operations and real-time listeners
 */
export function useFirebase<T extends FirestoreDocument>(collectionName: string) {
    const documents = ref<T[]>([]) as Ref<T[]>;
    const document = ref<T | null>(null) as Ref<T | null>;
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Convert Firestore timestamp to Date
     */
    const convertTimestamp = (data: DocumentData): any => {
        const converted: any = { ...data };
        Object.keys(converted).forEach(key => {
            if (converted[key] instanceof Timestamp) {
                converted[key] = converted[key].toDate();
            }
        });
        return converted;
    };

    /**
     * Get all documents from a collection
     */
    const getAll = async (options?: QueryOptions): Promise<T[]> => {
        loading.value = true;
        error.value = null;

        try {
            const collectionRef = collection(db, collectionName);
            const constraints: QueryConstraint[] = [];

            // Apply query options
            if (options?.where) {
                options.where.forEach(w => {
                    constraints.push(where(w.field, w.operator, w.value));
                });
            }

            if (options?.orderBy) {
                constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
            }

            if (options?.limit) {
                constraints.push(limit(options.limit));
            }

            const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
            const querySnapshot = await getDocs(q);

            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...convertTimestamp(doc.data())
            })) as T[];

            documents.value = docs;
            return docs;
        } catch (err: any) {
            error.value = err.message;
            console.error('Error getting documents:', err);
            return [];
        } finally {
            loading.value = false;
        }
    };

    /**
     * Get a single document by ID
     */
    const getById = async (id: string): Promise<T | null> => {
        loading.value = true;
        error.value = null;

        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = {
                    id: docSnap.id,
                    ...convertTimestamp(docSnap.data())
                } as T;
                document.value = data;
                return data;
            } else {
                error.value = 'Document not found';
                return null;
            }
        } catch (err: any) {
            error.value = err.message;
            console.error('Error getting document:', err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Create a new document
     */
    const create = async (data: Omit<T, 'id'>): Promise<string | null> => {
        loading.value = true;
        error.value = null;

        try {
            const collectionRef = collection(db, collectionName);
            const docData = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const docRef = await addDoc(collectionRef, docData);
            console.log('Document created with ID:', docRef.id);
            return docRef.id;
        } catch (err: any) {
            error.value = err.message;
            console.error('Error creating document:', err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Update an existing document
     */
    const update = async (id: string, data: Partial<Omit<T, 'id'>>): Promise<boolean> => {
        loading.value = true;
        error.value = null;

        try {
            const docRef = doc(db, collectionName, id);
            const updateData = {
                ...data,
                updatedAt: new Date()
            };

            await updateDoc(docRef, updateData);
            console.log('Document updated:', id);
            return true;
        } catch (err: any) {
            error.value = err.message;
            console.error('Error updating document:', err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Delete a document
     */
    const remove = async (id: string): Promise<boolean> => {
        loading.value = true;
        error.value = null;

        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            console.log('Document deleted:', id);
            return true;
        } catch (err: any) {
            error.value = err.message;
            console.error('Error deleting document:', err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Subscribe to real-time updates for all documents
     */
    const subscribe = (options?: QueryOptions, callback?: (docs: T[]) => void) => {
        const collectionRef = collection(db, collectionName);
        const constraints: QueryConstraint[] = [];

        // Apply query options
        if (options?.where) {
            options.where.forEach(w => {
                constraints.push(where(w.field, w.operator, w.value));
            });
        }

        if (options?.orderBy) {
            constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
        }

        if (options?.limit) {
            constraints.push(limit(options.limit));
        }

        const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...convertTimestamp(doc.data())
                })) as T[];

                documents.value = docs;
                if (callback) callback(docs);
            },
            (err) => {
                error.value = err.message;
                console.error('Error in subscription:', err);
            }
        );

        return unsubscribe;
    };

    /**
     * Subscribe to real-time updates for a single document
     */
    const subscribeToDocument = (id: string, callback?: (doc: T | null) => void) => {
        const docRef = doc(db, collectionName, id);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = {
                        id: docSnap.id,
                        ...convertTimestamp(docSnap.data())
                    } as T;
                    document.value = data;
                    if (callback) callback(data);
                } else {
                    document.value = null;
                    if (callback) callback(null);
                }
            },
            (err) => {
                error.value = err.message;
                console.error('Error in document subscription:', err);
            }
        );

        return unsubscribe;
    };

    return {
        // State
        documents,
        document,
        loading,
        error,

        // Methods
        getAll,
        getById,
        create,
        update,
        remove,
        subscribe,
        subscribeToDocument
    };
}
