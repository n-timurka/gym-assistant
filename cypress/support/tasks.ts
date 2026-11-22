import { initializeApp, getApps, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

function convertDates(value: unknown, key?: string): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (key === 'date' || key === 'createdAt' || key === 'updatedAt') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => convertDates(item));
  }
  if (typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = convertDates(v, k);
    }
    return result;
  }
  return value;
}

export function registerTasks(on: Cypress.PluginEvents, projectId: string) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'
  
  const app = getApps().length
    ? getApp()
    : initializeApp({ projectId, storageBucket: `${projectId}.firebasestorage.app` })
  const auth = getAuth(app)
  const db = getFirestore(app)
  const bucket = getStorage(app).bucket()

  on('task', {
    async 'firestore:clear'() {
      await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${projectId}/databases/(default)/documents`, {
        method: 'DELETE'
      });
      return null;
    },

    async 'storage:clear'() {
      await bucket.deleteFiles({ force: true })
      return null
    },

    async 'firestore:seed'({ path, data }: { path: string; data: Record<string, unknown> }) {
      await db.doc(path).set(convertDates(data) as Record<string, unknown>)
      return null;
    },

    async 'firestore:seedBatch'(docs: { path: string; data: Record<string, unknown> }[]) {
      const batch = db.batch();
      docs.forEach(({ path, data }) => {
        batch.set(db.doc(path), convertDates(data) as Record<string, unknown>);
      });
      await batch.commit();
      return null;
    },

    async 'auth:ensureUser'({ email, password }: { email: string; password: string }) {
      try {
        return (await auth.getUserByEmail(email)).uid
      } catch {
        return (await auth.createUser({ email, password, emailVerified: true })).uid
      }
    }
  })
}
