import { cookies } from 'next/headers';

import { AUTH_SESSION_COOKIE, parseCookieJson, type AuthSession, type AuthUser } from './shared';

export async function hashPassword(password: string) {
  const payload = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

export function sanitizeSession(user: AuthUser): AuthSession {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function readServerSession() {
  const cookieStore = await cookies();
  return parseCookieJson<AuthSession>(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}
