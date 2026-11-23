/**
 * In-app mock backend. With mocks on, requests never leave the device: each request is matched
 * against `handlers` and answered locally, so the starter runs (and E2E tests are deterministic)
 * without a real API. Enabled via EXPO_PUBLIC_API_MOCKS; never in production builds.
 */
export type MockRequest = {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Headers;
  body: unknown;
};

export type MockResponse = { status: number; body?: unknown };

export type MockHandler = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path relative to the API base URL, e.g. `/items`. A RegExp matches dynamic segments. */
  path: string | RegExp;
  respond: (request: MockRequest) => MockResponse | Promise<MockResponse>;
};

export type MockFetchOptions = { baseUrl: string; latencyMs?: number };

async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function createMockFetch(
  handlers: MockHandler[],
  { baseUrl, latencyMs = 300 }: MockFetchOptions,
): typeof fetch {
  return async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url);
    const basePath = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const path = url.pathname.slice(basePath.length) || '/';
    const method = request.method.toUpperCase();

    const handler = handlers.find(
      (candidate) =>
        candidate.method === method &&
        (typeof candidate.path === 'string' ? candidate.path === path : candidate.path.test(path)),
    );

    if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs));

    const reply = handler
      ? await handler.respond({
          method,
          path,
          query: url.searchParams,
          headers: request.headers,
          body: await readBody(request),
        })
      : { status: 404, body: { code: 'MOCK_NOT_FOUND', message: `No mock for ${method} ${path}` } };

    return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
      status: reply.status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
