---
description: Write the UI/UX design spec (DES-XXX) — screens, states, testIDs, copy
argument-hint: REQ-XXX
---

Design the UI for $ARGUMENTS.

1. Read the requirement and plan for this number. Read `packages/ui/src/` (tokens, `Button`, `TextField`, `useBreakpoint`) and existing screens in `packages/features/src/` to reuse what exists.
2. Copy `docs/03-design/_TEMPLATE.md` to `docs/03-design/DES-<NNN>-<slug>.md`.
3. For every screen define: route, a `testID` for its title (`<screen>-title`), and loading / empty / error / success states.
4. For `Platforms: web` or `both`, describe the web layout too (sidebar ≥ 768px, menu below) — same screens and `testID`s on every platform.
5. Draw the flow as a mermaid diagram. List all user-facing copy in the Copy table with i18n keys (`<feature>:<key>`).
6. Cover accessibility: labels, roles, focus order, 44pt targets, dark mode.
7. Leave `Status: Draft` and summarise for approval.
