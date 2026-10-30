---
name: firebase-emulator-testing
description: Firebase Emulator Testing guidance for this application.
---

# Firebase Emulator Testing

Use for local Firebase integration/rules tests. Confirm emulator config and ports; do not assume defaults. Use isolated test projects and emulator-only credentials. Test both allowed and denied access, including cross-user boundaries. Reset emulator state deterministically. Make tests fail safely if a non-emulator project is targeted. Never clean shared or production data.
