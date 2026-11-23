// Public API of @starter/api-client.
export { api } from './api';
export { isApiError, toApiError, type ApiError } from './api-error';
export {
  apiBaseQuery,
  apiRequest,
  configureApiClient,
  getApiBaseUrl,
  resetApiClient,
  type ApiClientConfig,
  type ApiExtraOptions,
  type AuthAdapter,
} from './base-query';
export {
  createMockFetch,
  type MockFetchOptions,
  type MockHandler,
  type MockRequest,
  type MockResponse,
} from './mock-fetch';
