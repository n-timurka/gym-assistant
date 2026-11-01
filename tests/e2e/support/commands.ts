// tests/e2e/support/commands.ts
/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsMockUser(email?: string, password?: string): Chainable<void>;
      logoutMockUser(): Chainable<void>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

Cypress.Commands.add('loginAsMockUser', (email = 'test_user@gymhelper.com', password = 'ValidPass123!') => {
  cy.visit('/login');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.contains('.login-button', 'Sign In').click();
  cy.url().should('include', '/tabs/workouts');
});

Cypress.Commands.add('logoutMockUser', () => {
  cy.visit('/tabs/account');
  cy.contains('Log Out').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('clearFirebaseSession', () => {
  // Clear local storage and cookies
  cy.clearLocalStorage();
  cy.clearAllCookies();
  cy.clearAllSessionStorage();

  // Explicitly delete the Firebase IndexedDB database
  cy.window().then((win) => {
    return new Promise((resolve) => {
      const deleteRequest = win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
    });
  });
});

export {};