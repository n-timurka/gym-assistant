import WorkoutsPage from '@/views/WorkoutsPage.vue';

describe('<WorkoutsPage />', () => {
  it('mounts and renders the layout with title and navigations', () => {
    cy.mount(WorkoutsPage);

    cy.contains('ion-title', 'Workouts').should('be.visible');
    cy.get('.week-navigation-header').should('be.visible');
    cy.get('.week-days-container').should('be.visible');
    cy.get('.workouts-list-container').should('be.visible');
  });
});
