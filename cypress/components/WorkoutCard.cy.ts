import WorkoutCard from '@/components/workout/WorkoutCard.vue';
import { ExerciseCategory, ExerciseType, WorkoutStatus, type Workout } from '@/types/firebase.types';

describe('<WorkoutCard />', () => {
  const testDate = new Date(2026, 10, 22);

  it('renders empty state when no workout is passed', () => {
    cy.mount(WorkoutCard, {
      props: {
        date: testDate,
        workout: undefined,
      },
    });

    cy.contains('h3', 'No Workout').should('be.visible');
    cy.contains('ion-button', 'Create a workout').should('be.visible');
  });

  it('renders workout card with status, exercises and action buttons', () => {
    const workout: Workout = {
      id: 'test-w-1',
      userId: 'test-user',
      date: testDate,
      status: WorkoutStatus.PLANNED,
      exercises: [],
    };

    cy.mount(WorkoutCard, {
      props: {
        date: testDate,
        workout,
      },
    });

    cy.contains('ion-badge', WorkoutStatus.PLANNED).should('be.visible');
    cy.contains('ion-button', 'View Details')
      .should('be.visible')
      .and('have.attr', 'routerLink', '/workouts/test-w-1');
    cy.contains('ion-button', 'Delete Workout').should('be.visible');
  });
});
