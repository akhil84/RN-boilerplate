// Public API of @starter/api-client.
export { api } from './api';
export { isApiError, toApiError, type ApiError } from './api-error';
export {
  apiBaseQuery,
  configureApiClient,
  resetApiClient,
  type ApiClientConfig,
  type AuthAdapter,
} from './base-query';
