import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { AUTH_SESSION_COOKIE } from '@/lib/auth/shared';

const handleI18nRouting = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

const PRIVATE_ROUTES = [
  '/dashboard',
  '/tasks',
  '/planner',
  '/subjects',
  '/focus',
  '/habits',
  '/analytics',
  '/reminders',
  '/inbox',
  '/ai-assistant',
  '/calendar'
];

export default function proxy(request: NextRequest) {
  const [, maybeLocale, ...segments] = request.nextUrl.pathname.split('/');
  const locale = maybeLocale === 'es' || maybeLocale === 'en' ? maybeLocale : null;
  const pathname = locale ? `/${segments.join('/')}`.replace(/\/+$/, '') || '/' : request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get(AUTH_SESSION_COOKIE)?.value);
  const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isSignInRoute = pathname === '/sign-in';

  if (locale && isPrivateRoute && !hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  if (locale && isSignInRoute && hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/(en|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
