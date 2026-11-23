import { z } from 'zod';

/**
 * API contract for auth. Responses are validated with Zod, so backend drift surfaces as a clear
 * error at the boundary instead of a crash deep in a screen. Adjust these to your backend.
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
});
export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  // Absent when the backend keeps the refresh token in an httpOnly cookie (web cookie mode).
  refreshToken: z.string().min(1).nullable().optional(),
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).nullable().optional(),
});

export type SocialProvider = 'google' | 'apple';
export type SignInMethod = 'password' | SocialProvider;

/** Endpoint paths — change these to match your backend (ADR-0015, ADR-0016). */
export const AUTH_PATHS = {
  login: '/auth/login',
  social: '/auth/social',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
} as const;
