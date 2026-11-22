import { formatDate } from '../../src/helpers/date.helper';

describe('Workouts Page User Journey', () => {
  const email = Cypress.expose('USER_EMAIL');
  let password: string;
  let userId: string;

  beforeEach(() => {
    cy.env(['USER_PASSWORD']).then(({ USER_PASSWORD }) => {
      password = USER_PASSWORD;
      cy.task('auth:ensureUser', { email, password }).then((uid) => {
        userId = uid as string;
        cy.login(email, password);
      });
    });
  });

  it('handles empty state and navigates to workout detail on creation', () => {
    cy.visit('/tabs/workouts');

    // 1. User opens page and sees "No workout"
    cy.contains('h3', 'No Workout').should('be.visible');
    cy.contains('ion-button', 'Create a workout').should('be.visible');

    // 2. Click "Create a workout"
    cy.contains('ion-button', 'Create a workout').click();

    // Workout card is created with status Planned
    cy.contains('ion-badge', 'Planned').should('be.visible');
    cy.contains('ion-button', 'View Details').should('be.visible').click();

    // Leads to WorkoutDetailPage
    cy.url().should('include', '/workouts/');
    cy.contains('Start Training').should('be.visible');
  });

  it('completes the full multi-week workout lifecycle', () => {
    const now = new Date();
    // Noon avoids time-zone shifts across midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    const prevWeekDate = new Date(today);
    prevWeekDate.setDate(today.getDate() - 7);

    const nextWeekDate = new Date(today);
    nextWeekDate.setDate(today.getDate() + 7);

    const exerciseId = 'seed-exercise-bench';
    const todayWorkoutId = 'workout-today-123';
    const prevWorkoutId = 'workout-prev-123';
    const nextWorkoutId = 'workout-next-123';

    // Seed exercise catalog definition
    cy.task('firestore:seed', {
      path: `exercises/${exerciseId}`,
      data: {
        name: 'Barbell Bench Press',
        category: 'Chest',
        type: 'Free weights',
      },
    });

    // Seed workouts for today, previous week, and next week
    cy.task('firestore:seedBatch', [
      {
        path: `workouts/${todayWorkoutId}`,
        data: {
          userId,
          date: today.toISOString(),
          status: 'Planned',
          exercises: [
            {
              exerciseId,
              sets: [{ weight: 80, reps: 10, isCompleted: false }],
            },
          ],
        },
      },
      {
        path: `workouts/${prevWorkoutId}`,
        data: {
          userId,
          date: prevWeekDate.toISOString(),
          status: 'Planned',
          exercises: [],
        },
      },
      {
        path: `workouts/${nextWorkoutId}`,
        data: {
          userId,
          date: nextWeekDate.toISOString(),
          status: 'Planned',
          exercises: [],
        },
      },
    ]);

    // Visit workouts tab
    cy.visit('/tabs/workouts');

    // Check workout indicator in expected day of current week
    cy.get('.day-card.active .workout-indicator').should('be.visible');

    // Workout card is displayed with status, exercises and formatted date
    cy.contains('ion-card-title', formatDate(today)).should('be.visible');
    cy.contains('ion-badge', 'Planned').should('be.visible');
    cy.contains('ion-item', 'Barbell Bench Press').should('be.visible');
    cy.contains('Barbell Bench Press').should('be.visible');

    // Click on View Details button leads to workoutdetail page
    cy.contains('ion-button', 'View Details').click();
    cy.url().should('include', `/workouts/${todayWorkoutId}`);
    cy.contains('Start Training').should('be.visible');

    // Return to Workouts tab
    cy.visit('/tabs/workouts');

    // Click Delete Workout button and confirm
    cy.on('window:confirm', (text) => {
      expect(text).to.contain('Are you sure you want to delete this workout?');
      return true;
    });
    cy.contains('ion-button', 'Delete Workout').click();

    // Verify there is no workout for this day anymore
    cy.contains('h3', 'No Workout').should('be.visible');
    cy.get('.day-card.active .workout-indicator').should('not.exist');

    // Navigate to next week and verify created workout displays properly
    cy.get('.week-navigation-header ion-button').last().click();
    cy.get('.day-card')
      .contains(nextWeekDate.getDate().toString())
      .closest('.day-card')
      .within(() => {
        cy.get('.workout-indicator').should('exist');
      })
    cy.get('.day-card')
      .contains(nextWeekDate.getDate().toString())
      .closest('.day-card').click();

    cy.contains('ion-card-title', formatDate(nextWeekDate)).should('be.visible');
    cy.contains('ion-badge', 'Planned').should('be.visible');

    // Navigate to previous week (two clicks back) and verify created workout displays properly
    cy.get('.week-navigation-header ion-button').first().click(); // back to current
    cy.get('.week-navigation-header ion-button').first().click(); // back to previous

    cy.get('.day-card')
      .contains(prevWeekDate.getDate().toString())
      .closest('.day-card')
      .within(() => {
        cy.get('.workout-indicator').should('exist');
      })
    cy.get('.day-card')
      .contains(prevWeekDate.getDate().toString())
      .closest('.day-card').click();

    cy.contains('ion-card-title', formatDate(prevWeekDate)).should('be.visible');
    cy.contains('ion-badge', 'Planned').should('be.visible');
  });
});
