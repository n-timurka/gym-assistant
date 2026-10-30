# Firebase Setup Guide for Gym Assistant

This guide outlines how to set up, configure, secure, and deploy Firebase services for **Gym Assistant**.

---

## 1. Create and Configure Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and give it a name (e.g., `gym-assistant-app`).
3. (Optional) Enable Google Analytics according to your preference.
4. Once the project is created, click the **Web icon (`</>`)** on the Project Overview page to register a Web App.
5. Enter an app nickname (e.g., `Gym Assistant Web`). You may check **Firebase Hosting** if you plan to deploy directly from Firebase CLI.
6. Copy the Firebase configuration object displayed on screen.

---

## 2. Local Environment Configuration

In the root directory of `gym-assistant`, create or update `.env` based on `.env.example`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

> **Security Note**: Never commit your `.env` file to source control. It is already included in `.gitignore`.

---

## 3. Enable Firebase Services

### 3.1 Authentication
1. Navigate to **Build > Authentication** in the Firebase Console.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable **Email/Password**.
4. (Optional) Disable "Email link (passwordless sign-in)" unless specifically needed.

### 3.2 Cloud Firestore Database
1. Navigate to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select a location geographically close to your target users (e.g., `nam5 (us-central)` or `eur3 (europe-west)`).
4. Start in **Production mode** (security rules must be deployed from this repository).

### 3.3 Cloud Storage
1. Navigate to **Build > Storage**.
2. Click **Get Started**.
3. Select the default Cloud Storage security rules and bucket location.

---

## 4. Security Rules & Composite Indexes

Gym Assistant requires declarative security rules and composite indexes to function properly in production.

### 4.1 Deploying Security Rules

Ensure `firestore.rules` and `storage.rules` are present in your workspace root, referenced by `firebase.json`:

```bash
# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

### 4.2 Composite Indexes

Several views execute compound queries combining equality filters with range queries or ordering:
- `workouts`: `userId` (ASC), `date` (ASC)
- `programs`: `userId` (ASC), `createdAt` (DESC)
- `progress`: `userId` (ASC), `exerciseId` (ASC), `date` (DESC)

Ensure `firestore.indexes.json` is configured and deploy it:

```bash
firebase deploy --only firestore:indexes
```

---

## 5. Database Seeding

To seed the exercise library and initial starter templates into your Firestore database:

```bash
# Run the seed script with tsx or node
npx tsx data/seed.ts

# Or seed a specific collection:
npx tsx data/seed.ts --type exercises
npx tsx data/seed.ts --type programs
```

---

## 6. Hosting Deployment

To deploy the production build to Firebase Hosting:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy hosting
npm run firebase:deploy
```
