import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const DEFAULT_NEXT_PATH = '/en/me/assessments';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = normalizeNextPath(requestUrl.searchParams.get('next'));
  const locale = next.startsWith('/zh') ? 'zh' : 'en';

  if (!code) {
    return redirectToLogin(requestUrl, locale, 'Missing authentication code.');
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectToLogin(requestUrl, locale, error.message);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function normalizeNextPath(value: string | null) {
  if (!value) return DEFAULT_NEXT_PATH;

  if (
    value === '/en' ||
    value === '/zh' ||
    value.startsWith('/en/') ||
    value.startsWith('/zh/')
  ) {
    return value;
  }

  return DEFAULT_NEXT_PATH;
}

function redirectToLogin(requestUrl: URL, locale: string, message: string) {
  const loginUrl = new URL(`/${locale}/login`, requestUrl.origin);
  loginUrl.searchParams.set('message', message);
  return NextResponse.redirect(loginUrl);
}
