import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAuth, connectAuthEmulator, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

// Initialize Firebase
export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = initializeAuth(app, {
  persistence: useEmulators
    ? browserLocalPersistence
    : [indexedDBLocalPersistence, browserLocalPersistence],
});
export const db = getFirestore(app);
export const storage = getStorage(app);

// Use local Firebase emulators when specified
if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
