import WeekNavigation from '@/components/WeekNavigation.vue';

describe('<WeekNavigation />', () => {
  it('displays the week header and emits updated dates on navigation buttons', () => {
    const startDate = new Date(2026, 10, 16); // Mon Nov 16 2026
    const onUpdate = cy.spy().as('updateModel');

    cy.mount(WeekNavigation, {
      props: {
        modelValue: startDate,
        'onUpdate:modelValue': onUpdate,
      },
    });

    cy.get('h2').should('be.visible').and('contain', 'Nov 16');

    // Click Prev Week
    cy.get('.week-navigation-header ion-button').first().click();
    cy.get('@updateModel').should('have.been.called');

    // Click Next Week
    cy.get('.week-navigation-header ion-button').last().click();
    cy.get('@updateModel').should('have.been.calledTwice');
  });
});
