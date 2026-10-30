---
name: cypress-e2e
description: Cypress E2E guidance for this application.
---

# Cypress E2E

Use for browser end-to-end tests. Inspect Cypress version/config/baseUrl and conventions. Prefer accessible selectors or stable `data-cy` attributes. Test critical user journeys and failure paths. Use safe test auth and isolated fixtures; never hardcode production credentials or mutate production data. Use Firebase emulators or dedicated test environments. Prefer Cypress retryability over fixed waits. Browser E2E does not validate native plugin behavior.
