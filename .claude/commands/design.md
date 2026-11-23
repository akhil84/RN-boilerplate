---
description: Write the UI/UX design spec (DES-XXX) — screens, states, testIDs, copy
argument-hint: REQ-XXX
---

Design the UI for $ARGUMENTS.

1. Read the requirement and plan for this number. Read `src/constants/theme.ts` and `src/components/` to reuse what exists.
2. Copy `docs/03-design/_TEMPLATE.md` to `docs/03-design/DES-<NNN>-<slug>.md`.
3. For every screen define: route, a `testID` for its title (`<screen>-title`), and loading / empty / error / success states.
4. Draw the flow as a mermaid diagram. List all user-facing copy in the Copy table.
5. Cover accessibility: labels, roles, focus order, 44pt targets, dark mode.
6. Leave `Status: Draft` and summarise for approval.
