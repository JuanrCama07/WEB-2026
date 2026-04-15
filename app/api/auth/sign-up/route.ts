import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { AUTH_SESSION_COOKIE, AUTH_USERS_COOKIE, parseCookieJson, type AuthUser } from '@/lib/auth/shared';
import { hashPassword, sanitizeSession } from '@/lib/auth/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: 'Completa nombre, correo y una contraseña de al menos 6 caracteres.' },
      { status: 400 },
    );
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const usersCookie = cookieHeader
    .split('; ')
    .find((entry) => entry.startsWith(`${AUTH_USERS_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=');
  const users = parseCookieJson<AuthUser[]>(usersCookie ? decodeURIComponent(usersCookie) : undefined) ?? [];

  if (users.some((user) => user.email === email)) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo.' }, { status: 409 });
  }

  const user: AuthUser = {
    id: randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [...users, user];
  const response = NextResponse.json({ ok: true, user: sanitizeSession(user) });

  response.cookies.set(AUTH_USERS_COOKIE, JSON.stringify(nextUsers), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set(AUTH_SESSION_COOKIE, JSON.stringify(sanitizeSession(user)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
