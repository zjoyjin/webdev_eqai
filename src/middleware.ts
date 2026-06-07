import { NextRequest, NextResponse } from 'next/server';
import { locales, type Locale } from './i18n/locales';

const DEFAULT_LOCALE: Locale = 'en';
const LOCALE_HEADER = 'X-NEXT-INTL-LOCALE';

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [, maybeLocale] = pathname.split('/');

  if (isLocale(maybeLocale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, maybeLocale);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname =
    pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
  redirectUrl.search = search;

  return NextResponse.redirect(redirectUrl);
}

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export const config = {
  matcher: [
    '/',
    '/(en|zh)/:path*',
    '/((?!_next|_vercel|api|auth|.*\\..*).*)'
  ]
};
