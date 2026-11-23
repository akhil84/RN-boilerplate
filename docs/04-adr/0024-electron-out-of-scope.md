# ADR-0024: Electron desktop out of scope, path documented

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q38.

## Context

Desktop (Windows, macOS) may be needed later. Options: document the path and keep code
desktop-safe; ship a minimal `apps/desktop` Electron shell now (adds upgrades, security config,
packaging, signing and a third E2E target before any project needs it).

## Decision

- No `apps/desktop` in the starter.
- `docs/guides/desktop-electron.md` covers: loading the `apps/web` export over a custom `app://`
  protocol, `safeStorage` for tokens, loopback / custom-protocol OAuth redirects, electron-builder
  or Electron Forge packaging, and code signing / notarisation.
- AGENTS.md rule: no browser-only APIs in shared code outside `.web.ts` files.

## Consequences

- No desktop maintenance cost now.
- Adding desktop later is a contained project-level ADR thanks to ADR-0005 and ADR-0015.

## Implementation notes (2026-11-23)

- Implemented as decided: `docs/guides/desktop-electron.md`; AGENTS.md forbids browser-only APIs outside `.web.ts` files.
