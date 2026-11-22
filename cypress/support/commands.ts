/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      clearFirebaseSession(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email?: string, password?: string) => {
  cy.env(['USER_PASSWORD']).then(({ USER_PASSWORD }) => {
    const user = email ?? Cypress.expose('USER_EMAIL')
    const pass = password ?? USER_PASSWORD

    cy.task('auth:ensureUser', { email: user, password: pass })

    cy.session(
      ['login', user],
      () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type(user);
        cy.get('input[type="password"]').type(pass, { log: false });
        cy.contains('.login-button', 'Sign In').click();
        cy.url().should('include', '/tabs/workouts');
      },
      {
        validate() {
          cy.visit('/')
          cy.location('pathname').should('not.eq', '/login')
        },
        cacheAcrossSpecs: true,
      },
    );
  });
});

Cypress.Commands.add('logout', () => {
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
    return new Promise<void>((resolve) => {
      const deleteRequest = win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
    });
  });
});

export {};