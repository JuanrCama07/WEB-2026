import { NextResponse } from 'next/server';

import { AUTH_SESSION_COOKIE, AUTH_USERS_COOKIE, parseCookieJson, type AuthUser } from '@/lib/auth/shared';
import { hashPassword, sanitizeSession } from '@/lib/auth/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Ingresa tu correo y contraseña.' }, { status: 400 });
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const usersCookie = cookieHeader
    .split('; ')
    .find((entry) => entry.startsWith(`${AUTH_USERS_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=');
  const users = parseCookieJson<AuthUser[]>(usersCookie ? decodeURIComponent(usersCookie) : undefined) ?? [];
  const passwordHash = await hashPassword(password);
  const user = users.find((candidate) => candidate.email === email && candidate.passwordHash === passwordHash);

  if (!user) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: sanitizeSession(user) });
  response.cookies.set(AUTH_SESSION_COOKIE, JSON.stringify(sanitizeSession(user)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
