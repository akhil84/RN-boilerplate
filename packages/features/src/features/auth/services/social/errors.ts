/** The user closed the provider's sign-in sheet. Not an error worth showing. */
export class SocialSignInCancelledError extends Error {
  constructor() {
    super('Social sign-in was cancelled');
    this.name = 'SocialSignInCancelledError';
  }
}

/** The provider is not configured for this platform (missing client ID, unsupported OS, …). */
export class SocialSignInUnavailableError extends Error {
  constructor(provider: string) {
    super(`${provider} sign-in is not available on this platform`);
    this.name = 'SocialSignInUnavailableError';
  }
}
