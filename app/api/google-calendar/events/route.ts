import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { AUTH_SESSION_COOKIE, getGoogleRefreshTokenCookieName, parseCookieJson, type AuthSession } from '@/lib/auth/shared';

type GoogleEvent = {
  id: string;
  summary?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

async function getAccessTokenFromRefreshToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Faltan variables de entorno GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.',
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`No se pudo refrescar el access_token: ${text}`);
  }

  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = parseCookieJson<AuthSession>(cookieStore.get(AUTH_SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json(
      { error: 'No hay sesión activa de ClearUp.' },
      { status: 401 },
    );
  }

  const refreshToken = cookieStore.get(getGoogleRefreshTokenCookieName(session.id))?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No hay sesión de Google Calendar activa.' },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const timeMin = url.searchParams.get('timeMin');
  const timeMax = url.searchParams.get('timeMax');

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { error: 'Debes enviar timeMin y timeMax en formato ISO.' },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);

    const googleUrl = new URL(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    );
    googleUrl.searchParams.set('timeMin', timeMin);
    googleUrl.searchParams.set('timeMax', timeMax);
    googleUrl.searchParams.set('singleEvents', 'true');
    googleUrl.searchParams.set('orderBy', 'startTime');

    const eventsRes = await fetch(googleUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!eventsRes.ok) {
      const text = await eventsRes.text();
      return NextResponse.json(
        { error: 'Error obteniendo eventos de Google Calendar', details: text },
        { status: 500 },
      );
    }

    const eventsJson = (await eventsRes.json()) as { items?: GoogleEvent[] };
    const items = eventsJson.items ?? [];

    const simplified = items.map((event) => ({
      id: event.id,
      title: event.summary ?? '(Sin título)',
      start: event.start?.dateTime ?? event.start?.date ?? null,
      end: event.end?.dateTime ?? event.end?.date ?? null,
      source: 'google' as const,
    }));

    return NextResponse.json({ events: simplified });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error al obtener eventos desde Google Calendar',
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
