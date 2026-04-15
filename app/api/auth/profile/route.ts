import { NextResponse } from 'next/server';

import { AUTH_SESSION_COOKIE, AUTH_USERS_COOKIE, parseCookieJson, type AuthSession, type AuthUser } from '@/lib/auth/shared';
import { hashPassword, sanitizeSession } from '@/lib/auth/server';

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!name || !email) {
    return NextResponse.json({ error: 'Completa tu nombre y correo.' }, { status: 400 });
  }

  if (password && password.length < 6) {
    return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const sessionCookie = cookieHeader
    .split('; ')
    .find((entry) => entry.startsWith(`${AUTH_SESSION_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=');
  const usersCookie = cookieHeader
    .split('; ')
    .find((entry) => entry.startsWith(`${AUTH_USERS_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  const session = parseCookieJson<AuthSession>(sessionCookie ? decodeURIComponent(sessionCookie) : undefined);
  const users = parseCookieJson<AuthUser[]>(usersCookie ? decodeURIComponent(usersCookie) : undefined) ?? [];

  if (!session) {
    return NextResponse.json({ error: 'Tu sesión ya no está activa.' }, { status: 401 });
  }

  const existingByEmail = users.find((user) => user.email === email && user.id !== session.id);
  if (existingByEmail) {
    return NextResponse.json({ error: 'Ya existe otra cuenta con ese correo.' }, { status: 409 });
  }

  const currentUser = users.find((user) => user.id === session.id);
  if (!currentUser) {
    return NextResponse.json({ error: 'No se encontró tu cuenta actual.' }, { status: 404 });
  }

  const nextUser: AuthUser = {
    ...currentUser,
    name,
    email,
    passwordHash: password ? await hashPassword(password) : currentUser.passwordHash,
  };

  const nextUsers = users.map((user) => (user.id === currentUser.id ? nextUser : user));
  const nextSession = sanitizeSession(nextUser);
  const response = NextResponse.json({ ok: true, user: nextSession });

  response.cookies.set(AUTH_USERS_COOKIE, JSON.stringify(nextUsers), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set(AUTH_SESSION_COOKIE, JSON.stringify(nextSession), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
