// tests/e2e/specs/account.cy.ts
describe('Account Page & Logout Flow', () => {
  beforeEach(() => {
    cy.clearFirebaseSession();
    cy.viewport('iphone-x');
    cy.loginAsMockUser();
  });

  it('navigates to Account tab and renders personal data items', () => {
    cy.visit('/tabs/account');

    cy.contains('Account').should('be.visible');
    cy.contains('Birth date').should('be.visible');
    cy.contains('Height').should('be.visible');
    cy.contains('Weight').should('be.visible');
    cy.contains('BMI').should('be.visible');
    cy.contains('Weight history').should('be.visible');
  });

  it('opens and closes the personal data edit modal', () => {
    cy.visit('/tabs/account');

    // Click edit pencil button
    cy.get('.edit-profile-button').click({force: true});

    cy.contains('Personal data').should('be.visible');
    cy.contains('Cancel').click();
    cy.get('.ion-modal').should('not.exist');
  });

  it('logs out the user and confirms session termination', () => {
    cy.visit('/tabs/account');

    // Click Log Out menu item
    cy.contains('Log Out').click();

    // Verify redirected to Login page
    cy.url().should('include', '/login');
    cy.contains('Sign in to continue').should('be.visible');

    // Verify user cannot navigate back to /tabs/account
    cy.visit('/tabs/account');
    cy.url().should('include', '/login');
  });
});