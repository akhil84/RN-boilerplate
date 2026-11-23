import { createMockFetch, type MockHandler } from '@api-client/mock-fetch';

const handlers: MockHandler[] = [
  { method: 'GET', path: '/items', respond: () => ({ status: 200, body: [{ id: '1' }] }) },
  {
    method: 'POST',
    path: '/echo',
    respond: ({ body, headers }) => ({
      status: 201,
      body: { received: body, auth: headers.get('Authorization') },
    }),
  },
  {
    method: 'GET',
    path: /^\/items\/\w+$/,
    respond: ({ path }) => ({ status: 200, body: { path } }),
  },
];

const mockFetch = createMockFetch(handlers, { baseUrl: 'https://api.test/v1', latencyMs: 0 });

describe('createMockFetch', () => {
  it('answers a matching handler relative to the base path', async () => {
    const response = await mockFetch('https://api.test/v1/items');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: '1' }]);
  });

  it('passes the parsed body and headers to the handler', async () => {
    const response = await mockFetch(
      new Request('https://api.test/v1/echo', {
        method: 'POST',
        body: JSON.stringify({ a: 1 }),
        headers: { Authorization: 'Bearer t' },
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ received: { a: 1 }, auth: 'Bearer t' });
  });

  it('matches dynamic paths with a RegExp', async () => {
    const response = await mockFetch('https://api.test/v1/items/abc');

    expect(await response.json()).toEqual({ path: '/items/abc' });
  });

  it('returns 404 for unmocked routes', async () => {
    const response = await mockFetch('https://api.test/v1/nope', { method: 'DELETE' });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: 'MOCK_NOT_FOUND' });
  });
});
