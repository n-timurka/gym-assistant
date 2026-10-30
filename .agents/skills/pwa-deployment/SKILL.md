---
name: pwa-deployment
description: PWA Deployment guidance for this application.
---

# PWA Deployment

Use for hosting and production PWA rollout. Verify HTTPS, SPA fallback, rewrite rules, manifest/service-worker paths and cache headers. Avoid long-lived caching of HTML and service-worker scripts; use fingerprinted immutable assets. Check service-worker update/rollback, environment-specific Firebase config, offline launch and auth-data privacy. Do not deploy without explicit authorization.
