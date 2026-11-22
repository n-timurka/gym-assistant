import WeekDayNavigation from '@/components/WeekDayNavigation.vue';
import { WorkoutStatus, type Workout } from '@/types/firebase.types';

describe('<WeekDayNavigation />', () => {
  it('renders week days and highlights selected day with workout indicator', () => {
    const selectedDate = new Date(2026, 10, 18); // Wednesday
    const workouts: Workout[] = [
      {
        id: 'w-1',
        userId: 'u-1',
        date: selectedDate,
        status: WorkoutStatus.PLANNED,
        exercises: [],
      },
    ];

    const onUpdate = cy.spy().as('updateSelected');

    cy.mount(WeekDayNavigation, {
      props: {
        modelValue: selectedDate,
        workouts,
        'onUpdate:modelValue': onUpdate,
      },
    });

    cy.get('.day-card').should('have.length', 7);
    cy.get('.day-card.active').should('contain', '18');
    cy.get('.day-card.active .workout-indicator').should('exist');

    // Click first day (Monday)
    cy.get('.day-card').first().click();
    cy.get('@updateSelected').should('have.been.called');
  });
});
