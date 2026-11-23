// Type-checking entry only. At bundle time Metro picks token-storage.native.ts (iOS / Android) or
// token-storage.web.ts (web) before this file.
export { tokenStorage } from './token-storage.native';
