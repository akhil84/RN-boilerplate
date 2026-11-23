---
description: Turn a feature idea into a requirement doc (REQ-XXX) with testable acceptance criteria
argument-hint: <feature idea in plain words>
---

Write a requirement for: $ARGUMENTS

1. Read `docs/00-product/vision.md`, `docs/00-product/glossary.md`, and list `docs/01-requirements/` to find the next number.
2. If the idea is ambiguous, ask me up to 5 sharp questions first (users, edge cases, scope). Do not guess on scope.
3. Copy `docs/01-requirements/_TEMPLATE.md` to `docs/01-requirements/REQ-<NNN>-<kebab-slug>.md` and fill it in.
   - Every acceptance criterion is Given/When/Then and observable in the UI or via a function result.
   - Include error, empty and offline states as ACs, not just the happy path.
4. Leave `Status: Draft`. Summarise the ACs and open questions for me to approve.
