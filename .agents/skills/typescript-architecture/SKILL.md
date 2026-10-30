---
name: typescript-architecture
description: TypeScript Architecture guidance for this application.
---

# TypeScript Architecture

Use for domain types and module boundaries. Organize by feature/domain consistent with repo. Separate UI, domain logic and infrastructure. Validate/narrow untrusted data. Prefer discriminated unions for state. Map external DTOs into stable internal models. Keep module APIs small, avoid circular dependencies and do not over-generalize one-off code.
