import { ExerciseType } from '@/types/firebase.types';
import ExerciseTypeLabel from '@/components/ExerciseTypeLabel.vue';

// Map of expected Ionic color classes
const colorMap: Record<ExerciseType, string> = {
  [ExerciseType.FREE_WEIGHTS]: 'ion-color-primary',
  [ExerciseType.MACHINES]: 'ion-color-secondary',
  [ExerciseType.CABLE_MACHINE]: 'ion-color-tertiary',
  [ExerciseType.NO_EQUIPMENT]: 'ion-color-default',
};

describe('<ExerciseTypeLabel />', () => {
  it('renders the exercise type label', () => {
    cy.mount(ExerciseTypeLabel, {
      props: {
        type: ExerciseType.FREE_WEIGHTS,
      },
    });

    cy.get('ion-chip').should('be.visible');
    cy.get('ion-label').should('contain.text', ExerciseType.FREE_WEIGHTS);
  });

  it('applies the correct color for each ExerciseType', () => {
    Object.entries(colorMap).forEach(([type, expectedClass]) => {
      cy.mount(ExerciseTypeLabel, {
        props: { type: type as ExerciseType },
      });

      cy.get('ion-chip')
        .should('have.class', expectedClass)
        .and('contain.text', type);
    });
  });

  it('applies small size styles when size="sm"', () => {
    cy.mount(ExerciseTypeLabel, {
      props: {
        type: ExerciseType.CABLE_MACHINE,
        size: 'sm',
      },
    });

    cy.get('ion-chip')
      .should('have.attr', 'style')
      .and('include', 'min-height: 8px')
      .and('include', 'padding: 2px 12px');
  });

  it('renders correctly with size="md" explicitly', () => {
    cy.mount(ExerciseTypeLabel, {
      props: {
        type: ExerciseType.NO_EQUIPMENT,
        size: 'md',
      },
    });

    cy.get('ion-chip').should('be.visible');
    cy.get('ion-label').should('contain.text', ExerciseType.NO_EQUIPMENT);
  });
});
