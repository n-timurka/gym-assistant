---
name: vue3-typescript
description: Vue 3 + TypeScript guidance for this application.
---

# Vue 3 + TypeScript

Use for Vue components, composables, routing and UI state. Prefer Composition API and `<script setup lang="ts">` when consistent with the repo. Type props/emits and external data; use `unknown` at untrusted boundaries and narrow it. Keep components cohesive, extract reusable state into composables, use computed for derived state, and clean up listeners/subscriptions. Model loading, empty, error and success states. Avoid prop mutation and client-side authorization assumptions.
