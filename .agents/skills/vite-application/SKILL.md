---
name: vite-application
description: Vite Application guidance for this application.
---

# Vite Application

Use for Vite config, environment variables and builds. Inspect existing config first. Only expose browser-safe variables with the configured public prefix (often `VITE_`); never put secrets there. Validate required env at startup. Keep environments distinct. Check aliases, base path, asset paths, code splitting and source maps. Preserve package manager and lockfile. Validate with typecheck and production build.
