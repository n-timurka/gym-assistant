import { formatDate } from '../../src/helpers/date.helper';
import { WorkoutStatus, type WorkoutExercise } from '../../src/types/firebase.types';
import { exercises } from '../../data/exercises';

describe('WorkoutDetailPage - Ongoing Status Journey', () => {
  const TEST_WORKOUT_ID = 'test-ongoing-workout-001';
  let testUserId = 'test-mock-user-uid';
  const today = new Date();
  const formattedToday = formatDate(today);

  const initialWorkoutExercises: WorkoutExercise[] = exercises.slice(0, 5).map((exercise, index) => ({
    ...exercise,
    exerciseId: exercise.extId,
    order: index,
    sets: Array(3).fill({ reps: 10, weight: 50 })
  }));

  before(() => {
    // Resolve authenticated test user UID to match the workout's userId
    cy.env(['USER_PASSWORD']).then(({ USER_PASSWORD }) => {
      const email = Cypress.expose('USER_EMAIL') || 'e2e@example.com';
      const password = USER_PASSWORD || 'Passw0rd!123';
      cy.task<string>('auth:ensureUser', { email, password }).then((uid) => {
        if (uid) testUserId = uid;
      });
    });
  });

  beforeEach(() => {
    // Ensure swiper starts on first slide
    cy.window().then((win) => {
      win.localStorage.setItem('CurrentExerciseIndex', '0');
    });

    // Authenticate user before each test
    cy.login();

    cy.task('firestore:seedBatch', [
      ...exercises.map((ex) => ({ path: `exercises/${ex.extId}`, data: { ...ex, id: ex.extId } })),
      {
        path: `workouts/${TEST_WORKOUT_ID}`,
        data: {
          userId: testUserId,
          status: WorkoutStatus.ONGOING,
          date: today,
          startTime: today.toISOString(),
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
          exercises: initialWorkoutExercises,
        },
      },
    ]);
  });

  it('1 & 2. verifies today’s ongoing workout appears on the Workouts tab with Ongoing status', () => {
    cy.visit('/tabs/workouts');

    // Workout card for today
    cy.contains('ion-card-title', formattedToday).should('be.visible');
    cy.get('workout-status-label, ion-badge').contains('Ongoing').should('be.visible');
    cy.contains('ion-button', 'View Details').should('be.visible');
  });

  it('3. navigates to details page and checks header date and back button', () => {
    cy.visit('/tabs/workouts');
    cy.contains('ion-button', 'View Details').click();

    cy.url().should('include', `/workouts/${TEST_WORKOUT_ID}`);
    cy.get('ion-header ion-title').should('contain', formattedToday);
    cy.get('ion-back-button').should('be.visible');
  });

  it('4. checks initial progress (0%), active exercise details, total count, and navigation', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    // Progress is 0%
    cy.get('.progress-label').should('contain', 'Progress').and('contain', '0%');
    cy.get('ion-progress-bar').should('have.attr', 'aria-valuenow', '0');

    // First active exercise (Barbell Bench Press)
    cy.get('.exercise-title-container h2').should('contain', 'Barbell Bench Press');
    cy.get('.exercise-title-container ion-text').should('contain', '1 of 5');

    // Badges & media
    cy.get('.exercise-badges-overlay').first().within(() => {
      cy.contains('Chest').should('be.visible');
      cy.contains('Free weights').should('be.visible');
    });
    cy.get('exercise-image, .exercise-image-container').should('be.visible');

    // Sets tab rendered by default with 3 sets
    cy.get('.exercise-card').first().within(() => {
      cy.get('.set-row').should('have.length', 3);
    });
  });

  it('5. navigates backward (stays on 1st), navigates forward to 2nd, and navigates to the end', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    const prevButton = () => cy.get('.navigation-header ion-button').first();
    const nextButton = () => cy.get('.navigation-header ion-button').last();

    // Navigating back on first slide does not change slide
    prevButton().click();
    cy.get('.exercise-title-container ion-text').should('contain', '1 of 5');
    cy.get('.exercise-title-container h2').should('contain', 'Barbell Bench Press');

    // Navigating forward moves to exercise 2
    nextButton().click();
    cy.get('.exercise-title-container ion-text').should('contain', '2 of 5');
    cy.get('.exercise-title-container h2').should('contain', 'Barbell Squat');

    // Navigate to end (slides 3, 4, 5)
    nextButton().click();
    cy.get('.exercise-title-container ion-text').should('contain', '3 of 5');
    nextButton().click();
    cy.get('.exercise-title-container ion-text').should('contain', '4 of 5');
    nextButton().click();
    cy.get('.exercise-title-container ion-text').should('contain', '5 of 5');
    cy.get('.exercise-title-container h2').should('contain', 'Assisted Pull-Ups');

    // Cannot advance further than the last slide
    nextButton().click();
    cy.get('.exercise-title-container ion-text').should('contain', '5 of 5');
  });

  it('6. tests options button: Add Exercise (close modal), Swap Exercise, and Delete Exercise', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    // ---- Sub-test A: Add Exercise Modal (and close it) ----
    cy.contains('ion-button', 'Options').click();
    cy.get('ion-action-sheet')
      .should('be.visible')
      .within(() => {
        cy.get('.action-sheet-title').should('contain.text', 'Exercise Options');

        // 3. Find and click a specific button by text
        cy.contains('Add Exercise').click();
      });
    cy.get('ion-action-sheet').should('not.exist');

    cy.get('ion-modal ion-title').should('contain', 'Add Exercise');
    cy.get('ion-modal ion-button').contains('Close').click();
    cy.get('ion-modal').should('not.be.visible');

    // ---- Sub-test B: Swap Existing Exercise ----
    cy.contains('ion-button', 'Options').click();
    cy.get('ion-action-sheet')
      .should('be.visible')
      .within(() => {
        cy.get('.action-sheet-title').should('contain.text', 'Exercise Options');

        // 3. Find and click a specific button by text
        cy.contains('Swap Exercise').click();
      });
    cy.get('ion-action-sheet').should('not.exist');

    cy.get('ion-modal ion-title').should('contain', 'Swap Exercise');
    // Select 'Chest Fly Machine' (seeded under Chest)
    cy.get('ion-modal exercise-list-item, ion-modal ion-item').contains('Chest Fly Machine').click();

    // The current exercise is now swapped to Chest Fly Machine
    cy.get('.exercise-title-container h2').should('contain', 'Chest Fly Machine');

    // ---- Sub-test C: Delete Exercise ----
    cy.contains('ion-button', 'Options').click();
    cy.get('ion-action-sheet')
      .should('be.visible')
      .within(() => {
        cy.get('.action-sheet-title').should('contain.text', 'Exercise Options');

        // 3. Find and click a specific button by text
        cy.contains('Delete Exercise').click();
      });
    cy.get('ion-action-sheet').should('not.exist');

    // Confirm deletion in Ionic alert
    cy.get('ion-alert .alert-button').contains('Delete').click();

    // Exercise count drops from 5 to 4
    cy.get('.exercise-title-container ion-text').should('contain', 'of 4');
  });

  it('7. checks Info tab proper content (description, target muscles, how-to, tips)', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    // Switch to Info tab
    cy.contains('ion-segment-button', 'Info').click();

    cy.get('.info-container').first().within(() => {
      // Description
      cy.get('.description').should('not.be.empty');

      // Target Muscles section
      cy.contains('.detail-title', 'Target Muscles').should('be.visible');
      cy.get('.muscles-list .muscle-tag').should('have.length.at.least', 1);

      // How To section
      cy.contains('.detail-title', 'How To').should('be.visible');
      cy.get('.instruction-list li').should('have.length.at.least', 1);

      // Tips section
      cy.contains('.detail-title', 'Tips').should('be.visible');
      cy.get('.tips-list li').should('have.length.at.least', 1);
    });

    // Switch back to Sets tab
    cy.contains('ion-segment-button', 'Sets').click();
    cy.get('.set-row').should('be.visible');
  });

  it('8. checks Sets tab: add new set, delete set, update weight and reps', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    // 1. Initial sets count is 3
    cy.get('.exercise-card').first().within(() => {
      cy.get('.set-row').should('have.length', 3);
    });

    // 2. Add new set
    cy.get('.exercise-card').first().within(() => {
      cy.contains('ion-button', '+ Add Set').click();
      cy.get('.set-row').should('have.length', 4);
      cy.get('.set-row').last().find('.set-number').should('contain', '4');
    });

    // 3. Delete set
    cy.get('.exercise-card').first().within(() => {
      cy.get('.set-row').last().find('ion-button[color="danger"]').click();
      cy.get('.set-row').should('have.length', 3);
    });

    // 4. Update weight and reps on Set 1
    cy.get('.exercise-card').first().within(() => {
      cy.get('.set-row').first().within(() => {
        // Weight input
        cy.get('ion-input').first().find('input[type="number"]').clear();
        cy.get('ion-input').first().find('input[type="number"]').type('75');
        // Reps input
        cy.get('ion-input').last().find('input[type="number"]').clear();
        cy.get('ion-input').last().find('input[type="number"]').type('12');
      });
    });

    cy.get('.exercise-card').first().within(() => {
      cy.get('.set-row').first().within(() => {
        cy.get('ion-input').first().find('input[type="number"]').should('have.value', '75');
        cy.get('ion-input').last().find('input[type="number"]').should('have.value', '12');
      });
    });
  });

  it('9. checks Done checkbox: timer action sheet opens (click cancel), progress updates', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    // Initial progress 0%
    cy.get('.progress-label').should('contain', '0%');

    // Check Done on Set 1
    cy.get('.set-row').first().find('ion-checkbox').click();

    // Rest Timer Action Sheet opens
    cy.get('ion-action-sheet').should('be.visible');
    cy.contains('ion-action-sheet .action-sheet-title', 'Rest Timer').should('be.visible');

    // Cancel rest timer
    cy.contains('ion-action-sheet .action-sheet-button', 'Cancel').click();
    cy.get('ion-action-sheet').should('not.exist');

    // Progress updates to non-zero (e.g. 1 out of 15 sets = 7%)
    cy.get('.progress-label').should('not.contain', '0%');
  });

  it('10. sets Done for all sets of an exercise and verifies activeExercise automatically advances', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    cy.get('.exercise-title-container ion-text').should('contain', '1 of');
    const firstExerciseName = 'Barbell Bench Press';
    cy.get('.exercise-title-container h2').should('contain', firstExerciseName);

    // Complete all 3 sets for current exercise
    cy.get('.exercise-card').first().find('.set-row').each(($row) => {
      cy.wrap($row).find('ion-checkbox').click();
      // Dismiss the rest timer sheet if it opens
      cy.document().then((doc) => {
        if (doc.querySelector('ion-action-sheet')) {
          cy.contains('ion-action-sheet .action-sheet-button', 'Cancel').click({ force: true });
        }
      });
    });

    // Swiper advances automatically to exercise 2
    cy.get('.exercise-title-container ion-text').should('contain', '2 of');
    cy.get('.exercise-title-container h2').should('not.contain', firstExerciseName);
  });

  it('11. tests timer for all time options and overlay dismissal', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    const timerOptions = [
      { buttonText: '30 Seconds', expectedTime: '00:30' },
      { buttonText: '1 Minute', expectedTime: '01:00' },
      { buttonText: '1.5 Minutes', expectedTime: '01:30' },
      { buttonText: '2 Minutes', expectedTime: '02:00' },
      { buttonText: '3 Minutes', expectedTime: '03:00' },
      { buttonText: 'START TIMER (2 min)', expectedTime: '02:00' },
    ];

    timerOptions.forEach(({ buttonText, expectedTime }) => {
      // Toggle Done checkbox on first set to prompt timer action sheet
      cy.get('.set-row').first().find('ion-checkbox').click();

      // If already checked, unchecking and rechecking re-triggers timer prompt
      cy.get('body').then(($body) => {
        if ($body.find('ion-action-sheet').length === 0) {
          cy.get('.set-row').first().find('ion-checkbox').click();
        }
      });

      // Select timer option
      cy.contains('ion-action-sheet .action-sheet-button', buttonText).click();

      // Check RestTimerModal overlay is active
      cy.get('.timer-overlay').should('be.visible');
      cy.get('.timer-overlay .timer-label').should('contain', 'Rest Time');
      cy.get('.timer-overlay .timer-value').should(($val) => {
        const text = $val.text().trim();
        // Accept exact expectedTime or ticked-down by 1 second
        expect(text === expectedTime || text.startsWith(expectedTime.slice(0, 4))).to.equal(true);
      });

      // Dismiss timer overlay using its close icon
      cy.get('.timer-overlay ion-button').click();
      cy.get('.timer-overlay').should('not.exist');
    });
  });

  it('12. checks Done for all sets of all exercises, confirms 100% progress and Stop Training button', () => {
    cy.visit(`/workouts/${TEST_WORKOUT_ID}`);

    // Cycle through all exercises and mark all sets as completed
    const completeCurrentExerciseAndNext = (exerciseIndex: number, totalExercises: number) => {
      cy.get('.set-row').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('ion-checkbox').then(($cb) => {
            if (!$cb.hasClass('checkbox-checked')) {
              cy.wrap($cb).click();
            }
          });
        });

        // Close timer sheet if triggered
        cy.get('body').then(($body) => {
          if ($body.find('ion-action-sheet').length > 0) {
            cy.contains('ion-action-sheet .action-sheet-button', 'Cancel').click({ force: true });
          }
        });
      });

      // If not on last slide, advance
      if (exerciseIndex < totalExercises) {
        cy.get('.navigation-header ion-button').last().click();
      }
    };

    // Complete sets across all 5 exercises
    for (let i = 1; i <= 5; i++) {
      completeCurrentExerciseAndNext(i, 5);
    }

    // 1. Progress is 100%
    cy.get('.progress-label').should('contain', '100%');
    cy.get('ion-progress-bar').should('have.attr', 'aria-valuenow', '1');

    // 2. Stop Training button is visible in footer with danger color
    cy.get('ion-footer ion-button[color="danger"]')
      .should('be.visible')
      .and('contain', 'Stop Training')
      .click();

    // Confirm end workout alert
    cy.get('ion-alert').should('be.visible');
    cy.get('ion-alert .alert-button').contains('End Workout').click();

    // Workout status transitions to Completed
    cy.get('ion-alert').should('not.exist');
    cy.contains('Workout Summary', { timeout: 8000 }).should('be.visible');
  });
});
