export const AUTH_USERS_COOKIE = 'clearup_users';
export const AUTH_SESSION_COOKIE = 'clearup_session';
export const GOOGLE_REFRESH_TOKEN_COOKIE_PREFIX = 'gc_refresh_token';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type AuthSession = {
  id: string;
  name: string;
  email: string;
};

export function parseCookieJson<T>(value: string | undefined): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getGoogleRefreshTokenCookieName(userId: string) {
  return `${GOOGLE_REFRESH_TOKEN_COOKIE_PREFIX}_${userId}`;
}
