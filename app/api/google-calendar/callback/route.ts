import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        error:
          'Faltan variables de entorno GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REDIRECT_URI.',
      },
      { status: 500 },
    );
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    return NextResponse.json(
      { error: 'Error intercambiando el código por tokens', details: body },
      { status: 500 },
    );
  }

  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;

  if (!tokenJson.refresh_token) {
    // En algunos casos Google no devuelve refresh_token si ya se concedió antes.
    // Para este prototipo, exigimos refresh_token.
    return NextResponse.json(
      {
        error:
          'Google no devolvió refresh_token. Asegúrate de revocar el acceso previamente o cambiar el consentimiento.',
      },
      { status: 500 },
    );
  }

  // Guardamos solo el refresh_token en una cookie httpOnly para poder pedir nuevos access tokens.
  const cookieStore = await cookies();
  cookieStore.set('gc_refresh_token', tokenJson.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });

  let locale = 'es';
  if (stateParam) {
    try {
      const parsed = JSON.parse(stateParam) as { locale?: string };
      if (parsed.locale) {
        locale = parsed.locale;
      }
    } catch {
      // ignoramos errores de parseo
    }
  }

  // Redirigimos de vuelta al calendario de la app con el locale original.
  return NextResponse.redirect(`/${locale}/calendar`);
}

