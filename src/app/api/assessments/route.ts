import { NextResponse } from 'next/server';
import { getAssessmentCatalog } from '@/lib/assessmentDirectory';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? 'current';
  const catalog = await getAssessmentCatalog(slug);

  return NextResponse.json(catalog);
}
