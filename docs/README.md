# Starter App delivery docs

Every feature moves through the same pipeline. Each stage writes one file that the next stage reads,
so a human or an AI agent can pick up work at any point with full context.

| Stage          | Folder                         | File                          | Slash command         |
| -------------- | ------------------------------ | ----------------------------- | --------------------- |
| 0. Product     | `00-product/`                  | `vision.md`, `glossary.md`    | —                     |
| 1. Requirement | `01-requirements/`             | `REQ-001-<slug>.md`           | `/requirement <idea>` |
| 2. Plan        | `02-plans/`                    | `PLAN-001-<slug>.md`          | `/plan REQ-001`       |
| 3. Design      | `03-design/`                   | `DES-001-<slug>.md`           | `/design REQ-001`     |
| 4. Build       | `packages/features/src/<slug>` | code + tests                  | `/implement REQ-001`  |
| 5. Test        | `e2e/mobile`, `e2e/web`        | Maestro flow, Playwright spec | `/test REQ-001`       |
| 6. Ship        | `apps/<app>/CHANGELOG.md`      | per-app changelog             | `/ship <app> [bump]`  |
| Decisions      | `04-adr/`                      | `0001-<slug>.md`              | `/adr <decision>`     |

Rules

- The number is shared: `REQ-007` → `PLAN-007` → `DES-007`. Next number = highest existing + 1.
- Every file starts with a status line: `Draft` → `Approved` → `Done`. Agents only build from `Approved`.
- A human approves each stage by changing the status. Agents never approve their own output.
- Templates (`_TEMPLATE.md`) in each folder are the source of truth for structure.
- Requirements declare `Platforms: mobile | web | both`; plans, designs and E2E follow it.
- Guides: [adding CI](guides/adding-ci.md) · [desktop with Electron](guides/desktop-electron.md) ·
  [analytics adapters](guides/analytics-adapters.md) · [enterprise SSO](guides/enterprise-sso.md).
