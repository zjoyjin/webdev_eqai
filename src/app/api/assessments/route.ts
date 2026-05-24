import { NextResponse } from 'next/server';
import data from '../../../../dataset/assessment_data.json';

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchAssessmentCatalog(slug: string) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const url = new URL('/rest/v1/assessment_catalog', SUPABASE_URL);
  url.searchParams.set('select', 'payload');
  url.searchParams.set('slug', `eq.${slug}`);
  url.searchParams.set('active', 'eq.true');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{ payload?: unknown }>;
  return rows[0]?.payload ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? 'current';
  const catalog = await fetchAssessmentCatalog(slug);

  return NextResponse.json(catalog ?? data);
}
