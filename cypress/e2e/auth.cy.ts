describe('Authentication & Navigation Protection', () => {
  const email = Cypress.expose('USER_EMAIL');
  let password: string;

  beforeEach(() => {
    cy.env(['USER_PASSWORD']).then(({ USER_PASSWORD }) => {
      password = USER_PASSWORD
      cy.task('auth:ensureUser', { email, password })
    });
  });

  it('redirects unauthenticated root visit to /login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.contains('Gym Assistant').should('be.visible');
    cy.contains('Sign in to continue').should('be.visible');
  });

  it('protects tabs routes from unauthenticated users', () => {
    cy.visit('/tabs/workouts');
    cy.url().should('include', '/login');

    cy.visit('/tabs/account');
    cy.url().should('include', '/login');
  });

  it('navigates from login to signup page', () => {
    cy.visit('/login');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
    cy.contains('Create Account').should('be.visible');
  });

  it('displays validation error when entering malformed email', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('not-a-valid-email');
    cy.get('input[type="password"]').click(); // blur email input

    cy.contains('Invalid email format').should('be.visible');
    cy.contains('.login-button', 'Sign In').should('be.disabled');
  });

  it('displays auth error message on incorrect password', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type('WrongPass123!');
    cy.contains('.login-button', 'Sign In').click();

    cy.contains('Incorrect password.').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('successfully logs in with seed user credentials', () => {
    cy.login(email, password);
    cy.visit('/tabs/workouts');

    cy.get('ion-tab-bar, .ion-tab-bar').should('be.visible');
    cy.contains('Workouts').should('be.visible');
    cy.contains('Exercises').should('be.visible');
    cy.contains('Account').should('be.visible');
    cy.contains('Programs').should('be.visible');
  });
});
