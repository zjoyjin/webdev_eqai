import { NextResponse } from 'next/server';
import data from '../../../../dataset/assessment_data.json';

export async function GET() {
  return NextResponse.json(data);
}
