import { NextResponse } from 'next/server';
import { getAssessmentModules } from '@/lib/assessmentDirectory';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await getAssessmentModules());
}
