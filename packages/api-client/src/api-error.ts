import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * The one error shape features handle (ADR-0008). `status` is the HTTP status, or a string for
 * failures that never produced a response.
 */
export type ApiError = {
  status: number | 'FETCH_ERROR' | 'TIMEOUT_ERROR' | 'PARSING_ERROR' | 'CUSTOM_ERROR';
  code: string;
  message: string;
};

function readBody(data: unknown): { code?: string; message?: string } {
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    return {
      code: typeof body.code === 'string' ? body.code : undefined,
      message: typeof body.message === 'string' ? body.message : undefined,
    };
  }
  return {};
}

export function toApiError(error: FetchBaseQueryError): ApiError {
  if (typeof error.status === 'number') {
    const body = readBody(error.data);
    return {
      status: error.status,
      code: body.code ?? `HTTP_${error.status}`,
      message: body.message ?? `Request failed with status ${error.status}`,
    };
  }

  switch (error.status) {
    case 'FETCH_ERROR':
      return { status: 'FETCH_ERROR', code: 'FETCH_ERROR', message: error.error };
    case 'TIMEOUT_ERROR':
      return { status: 'TIMEOUT_ERROR', code: 'TIMEOUT_ERROR', message: error.error };
    case 'PARSING_ERROR':
      return { status: 'PARSING_ERROR', code: 'PARSING_ERROR', message: error.error };
    default:
      return {
        status: 'CUSTOM_ERROR',
        code: 'CUSTOM_ERROR',
        message: String((error as { error?: unknown }).error ?? 'Unexpected error'),
      };
  }
}

export function isApiError(value: unknown): value is ApiError {
  return (
    !!value &&
    typeof value === 'object' &&
    'status' in value &&
    'code' in value &&
    'message' in value
  );
}
