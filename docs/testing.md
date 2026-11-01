# Testing Guide — Gym Assistant

This guide documents the testing suite for Gym Assistant.

## Running Tests

### Unit & Component Tests (Vitest)
```bash
# Run all unit and component tests once
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Generate code coverage
npm run test:unit:coverage
```

### End-to-End Tests (Cypress)
```bash
# Run Cypress headless
npm run test:e2e

# Open interactive Cypress test runner
npm run test:e2e:open
```

## Test Structure & Conventions
- `tests/fixtures/`: Centralized test fixtures (`seedData.fixture.ts`, `mockAuth.ts`, `ionicStubs.ts`).
- `tests/unit/helpers/`: Pure utility tests (`date.helper.spec.ts`, `capacitor.helper.spec.ts`).
- `tests/unit/views/`: Page-level component tests verifying user interaction and validation states.
- `tests/e2e/specs/`: Real browser specs testing auth guards, routes, and critical flows.