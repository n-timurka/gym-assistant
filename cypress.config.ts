import { defineConfig } from 'cypress';
import { registerTasks } from './cypress/support/tasks';

export default defineConfig({
  expose: {
    PROJECT_ID: 'demo-my-app',
    AUTH_URL: 'http://127.0.0.1:9099',
    USER_EMAIL: 'e2e@example.com'
  },
  env: {
    USER_PASSWORD: 'Passw0rd!123'
  },
  video: false,
  retries: { runMode: 2, openMode: 0 },
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    setupNodeEvents(on, config) {
      registerTasks(on, config.expose.PROJECT_ID)
      return config
    },
  },
  component: {
    devServer: { framework: 'vue', bundler: 'vite' },
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
    specPattern: 'cypress/components/**/*.cy.ts',
  },
});
