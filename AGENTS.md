# Project Agent Instructions

## Stack
Vue 3 + TypeScript + Vite, PWA, Firebase, Ionic Vue and Capacitor. Tests: Vitest, Vue Test Utils and Cypress. Use the actual versions and scripts in this repository as authoritative.

## Before work
Read this file, README, package manifest/lockfile, source layout and Vite/TypeScript/lint/test/Cypress/Firebase/Capacitor configuration. Identify which Firebase products, Capacitor plugins and native targets are actually configured.

## Load skills
- Vue: `vue3-typescript`, `typescript-architecture`
- Vite/build: `vite-application`
- PWA: `vite-pwa`, `pwa-deployment`, `ionic-pwa-testing`
- Firebase: `firebase-web`, `firebase-emulator-testing`
- Ionic/native: `ionic-capacitor`, `ionic-pwa-testing`
- Unit/component tests: `vitest-vue-test-utils`
- Browser E2E: `cypress-e2e`
- Lint/type quality: `linting-quality`
- Security/accessibility: `web-security-accessibility`
- Git: `git-workflow`

Skills are guidance, not proof a dependency or capability is installed. Verify configuration.

## Guardrails
Preserve uncommitted changes. Do not add material dependencies without explaining why. Never expose privileged Firebase credentials in client code. Do not target production with tests. Do not deploy, publish, sign or modify production resources without explicit approval. Report checks as PASS/FAIL/BLOCKED/NOT CONFIGURED with exact commands and evidence.
