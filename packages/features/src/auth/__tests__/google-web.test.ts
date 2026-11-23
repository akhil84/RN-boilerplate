// The web Google flow (Google Identity Services One Tap), driven with a fake `window.google`.
import { SocialSignInCancelledError } from '../social/errors';
import { getIdToken } from '../social/get-id-token.web';

process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'web-client.apps.googleusercontent.com';

type Moment = {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
};

function fakeGoogle(
  run: (callback: (r: { credential?: string }) => void, listener: (m: Moment) => void) => void,
) {
  let callback: (r: { credential?: string }) => void = () => {};
  (globalThis as unknown as { window: Record<string, unknown> }).window.google = {
    accounts: {
      id: {
        initialize: ({ callback: cb }: { callback: typeof callback }) => (callback = cb),
        prompt: (listener: (m: Moment) => void) => run(callback, listener),
      },
    },
  };
}

describe('web Google sign-in', () => {
  it('resolves the credential even when the "credential_returned" dismissal arrives first', async () => {
    fakeGoogle((callback, listener) => {
      listener({ isDismissedMoment: () => true, getDismissedReason: () => 'credential_returned' });
      callback({ credential: 'google-id-token' });
    });

    await expect(getIdToken('google')).resolves.toBe('google-id-token');
  });

  it('treats a user dismissal as a cancel', async () => {
    fakeGoogle((_callback, listener) => {
      listener({ isDismissedMoment: () => true, getDismissedReason: () => 'cancel_called' });
    });

    await expect(getIdToken('google')).rejects.toBeInstanceOf(SocialSignInCancelledError);
  });

  it('copes with FedCM notifications that lack the older status methods', async () => {
    fakeGoogle((callback, listener) => {
      listener({}); // no isNotDisplayed / isSkippedMoment under FedCM
      callback({ credential: 'fedcm-token' });
    });

    await expect(getIdToken('google')).resolves.toBe('fedcm-token');
  });
});
