# Gym Assistant

Gym Assistant is a modern fitness tracking application built with **Ionic Vue** and **Firebase**. It helps you manage your workouts, track your progress, and explore a comprehensive library of exercises.

## 🌟 Features

-   **Workout Management**: Create, plan, and track your workouts. Monitor your progress in real-time during training.
-   **Exercise Library**: sophisticated exercise database with detailed descriptions, target muscles (primary/secondary), instructions, and pro-tips.
-   **Similar Exercises**: Smart suggestions for alternative exercises based on muscle groups and movement patterns.
-   **Progress Tracking**: Visual history of your lifts and cardio sessions. Track your "Best Time" or "Max Weight".
-   **Weekly Planning**: Plan your workouts for the week and stay consistent.
-   **Authentication**: Secure user accounts powered by Firebase Authentication.

## 🛠️ Tech Stack

-   **Framework**: [Ionic Framework](https://ionicframework.com/) with [Vue 3](https://vuejs.org/)
-   **Language**: TypeScript
-   **Backend**: Firebase (Firestore, Authentication)
-   **Build Tool**: Vite
-   **State Management**: Vue Composition API

## Demo
You can check the app, using this [link](https://gym-assistant-2e9f7.web.app/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   A [Firebase](https://firebase.google.com/) account and project.

## 🚀 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/n-timurka/gym-assistant.git
    cd gym-assistant
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    -   Create a file named `.env` in the root directory.
    -   Copy the contents from `.env.example` (if available) or use the following template:
        ```env
        VITE_FIREBASE_API_KEY=your_api_key
        VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your_project_id
        VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        VITE_FIREBASE_APP_ID=your_app_id
        ```
    -   Replace the values with your Firebase project credentials found in the Firebase Console (Project Settings > General > Your apps).
    -   *Note: For more details on Firebase setup, check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).*

## 🏃‍♂️ Running the App

Start the development server:

```bash
npm run dev
# or
ionic serve
```

The application will be available at `http://localhost:8100` (or `http://localhost:5173` depending on your setup).

## 📱 User Guide

### 1. Account Setup
-   Sign up for a new account using your email and password.
-   You can verify your email if required by your Firebase settings.

### 2. Browsing Exercises
-   Navigate to the **Exercises** tab.
-   Filter by **Category** (Chest, Back, Legs, etc.) or **Type** (Free Weights, Machines, etc.).
-   Click on any exercise to view details, instructions, and **Similar Exercises**.
-   **Admin Tip**: Use the "Seed" button (download icon) in the header to populate the database with initial exercise data.

### 3. Creating a Workout
-   Go to the **Workouts** tab.
-   Click the **+** button to create a new workout plan.
-   Add exercises from the library.
-   Set your target sets and reps.

### 4. Training
-   Open a planned workout and click **Start Training**.
-   Log your actual weights and reps as you go.
-   Use the built-in rest timer between sets.
-   You can **Swap** exercises on the fly if a machine is busy—Gym Assistant will suggest similar alternatives!
-   Click **End Workout** when finished to save your progress.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
