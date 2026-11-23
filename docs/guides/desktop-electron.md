# Desktop (Windows, macOS) with Electron

Desktop is out of scope for the starter (ADR-0024), but the code is kept ready for it. This guide
is the path a project follows when it needs a desktop app. Record the decision in a new ADR first.

## Why it is cheap here

- `apps/web` is an Expo **single-page app** (`web.output: "single"`): its export is plain HTML, JS
  and CSS that Electron can load as-is (ADR-0005).
- Networking is plain `fetch` (ADR-0008), which works unchanged in Electron's renderer.
- Token storage is an interface (ADR-0015): desktop adds one strategy instead of changing callers.
- Shared code avoids browser-only APIs outside `.web.ts` files (AGENTS.md rule).

The alternative to Electron is React Native for Windows / macOS, which reuses the native screens
instead of the web build. Compare both in the ADR.

## Steps

1. **Add `apps/desktop`** with Electron and a packager (electron-builder or Electron Forge). It is a
   shell only — no feature code.
2. **Load the web export over a custom protocol**, not `file://`. Expo Router needs real URL paths;
   register an `app://` protocol (`protocol.handle`) that serves files from the exported `dist/`
   and falls back to `index.html` for unknown paths (the same rule as `e2e/web/serve.mjs`).
3. **Lock down the renderer**: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`,
   a strict Content-Security-Policy, and a `preload` script that exposes only the few functions the
   app needs through `contextBridge`.
4. **Store tokens with `safeStorage`**: add a desktop `TokenStorage` strategy in
   `packages/features/src/features/auth/services/token-storage/` that calls the preload bridge, which encrypts with
   Electron's `safeStorage` (OS keychain) in the main process.
5. **OAuth / social sign-in**: popups and redirects need a loopback (`http://127.0.0.1:<port>`) or
   custom-protocol redirect handled in the main process. Google and Apple must allow that redirect.
6. **Sign and notarise**: Apple Developer ID + notarisation on macOS, a code-signing certificate on
   Windows. Without them users see security warnings.
7. **Updates**: Electron apps update separately from EAS Update (e.g. electron-updater).
8. **Tests**: Playwright can drive Electron (`_electron.launch`); reuse the specs in `e2e/web` with
   an Electron project.
