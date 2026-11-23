import type { BaseQueryApi } from '@reduxjs/toolkit/query';

import { apiBaseQuery, configureApiClient, resetApiClient, type AuthAdapter } from '../base-query';

type Reply = { status: number; body?: unknown };

function mockFetch(...replies: Reply[]) {
  const queue = [...replies];
  const fetchMock = jest.fn(async (input: Request) => {
    const reply = queue.shift() ?? { status: 500 };
    return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
      status: reply.status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const api = (): BaseQueryApi => ({
  signal: new AbortController().signal,
  abort: jest.fn(),
  dispatch: jest.fn(),
  getState: jest.fn(),
  extra: undefined,
  endpoint: 'test',
  type: 'query',
});

function authAdapter(overrides: Partial<AuthAdapter> = {}): AuthAdapter {
  let token = 'old-token';
  return {
    getAccessToken: jest.fn(async () => token),
    refresh: jest.fn(async () => {
      token = 'new-token';
      return true;
    }),
    onSessionExpired: jest.fn(),
    ...overrides,
  };
}

const authHeader = (fetchMock: jest.Mock, call: number) =>
  (fetchMock.mock.calls[call][0] as Request).headers.get('Authorization');

describe('apiBaseQuery', () => {
  beforeEach(() => {
    resetApiClient();
    configureApiClient({ baseUrl: 'https://api.test', retryDelayMs: 0 });
  });

  it('prefixes the configured base URL and returns data', async () => {
    const fetchMock = mockFetch({ status: 200, body: { id: 1 } });

    const result = await apiBaseQuery('/items/1', api(), {});

    expect(result.data).toEqual({ id: 1 });
    expect((fetchMock.mock.calls[0][0] as Request).url).toBe('https://api.test/items/1');
  });

  it('sends the access token as a bearer header', async () => {
    const fetchMock = mockFetch({ status: 200, body: {} });
    configureApiClient({ auth: authAdapter() });

    await apiBaseQuery('/me', api(), {});

    expect(authHeader(fetchMock, 0)).toBe('Bearer old-token');
  });

  it('normalises HTTP errors into ApiError', async () => {
    mockFetch({ status: 404, body: { code: 'NOT_FOUND', message: 'No such item' } });

    const result = await apiBaseQuery('/items/9', api(), {});

    expect(result.error).toEqual({ status: 404, code: 'NOT_FOUND', message: 'No such item' });
  });

  it('gives HTTP errors without a body a generic message', async () => {
    mockFetch({ status: 403 });

    const result = await apiBaseQuery('/secret', api(), {});

    expect(result.error).toMatchObject({ status: 403, code: 'HTTP_403' });
    expect(result.error?.message).toMatch(/403/);
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const fetchMock = mockFetch({ status: 401 }, { status: 200, body: { ok: true } });
    const auth = authAdapter();
    configureApiClient({ auth });

    const result = await apiBaseQuery('/me', api(), {});

    expect(result.data).toEqual({ ok: true });
    expect(auth.refresh).toHaveBeenCalledTimes(1);
    expect(authHeader(fetchMock, 1)).toBe('Bearer new-token');
  });

  it('shares one refresh between parallel requests that get 401', async () => {
    mockFetch({ status: 401 }, { status: 401 }, { status: 200, body: 1 }, { status: 200, body: 2 });
    let finishRefresh: (value: boolean) => void = () => {};
    const auth = authAdapter({
      refresh: jest.fn(() => new Promise<boolean>((resolve) => (finishRefresh = resolve))),
    });
    configureApiClient({ auth });

    const both = Promise.all([apiBaseQuery('/a', api(), {}), apiBaseQuery('/b', api(), {})]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    finishRefresh(true);
    const results = await both;

    expect(auth.refresh).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.data)).toEqual([1, 2]);
  });

  it('signs out when the refresh fails', async () => {
    mockFetch({ status: 401 });
    const auth = authAdapter({ refresh: jest.fn(async () => false) });
    configureApiClient({ auth });

    const result = await apiBaseQuery('/me', api(), {});

    expect(result.error).toMatchObject({ status: 401 });
    expect(auth.onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('retries idempotent requests on server errors', async () => {
    const fetchMock = mockFetch({ status: 503 }, { status: 200, body: 'ok' });

    const result = await apiBaseQuery('/flaky', api(), {});

    expect(result.data).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry mutations, so they are never sent twice', async () => {
    const fetchMock = mockFetch({ status: 503 }, { status: 200 });

    const result = await apiBaseQuery({ url: '/orders', method: 'POST', body: {} }, api(), {});

    expect(result.error).toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry client errors', async () => {
    const fetchMock = mockFetch({ status: 400 }, { status: 200 });

    await apiBaseQuery('/bad', api(), {});

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports network failures as FETCH_ERROR', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    configureApiClient({ maxRetries: 0 });

    const result = await apiBaseQuery('/offline', api(), {});

    expect(result.error).toMatchObject({ status: 'FETCH_ERROR', code: 'FETCH_ERROR' });
  });
});
