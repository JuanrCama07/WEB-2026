import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') ?? 'es';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error:
          'Faltan variables de entorno GOOGLE_CLIENT_ID o GOOGLE_REDIRECT_URI en el servidor.',
      },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: 'true',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    prompt: 'consent',
    state: JSON.stringify({ locale }),
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_BASE_URL}?${params.toString()}`);
}

