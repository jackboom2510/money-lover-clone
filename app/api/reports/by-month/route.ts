import { NextRequest, NextResponse } from 'next/server';
import { getReportByMonth } from '@/lib/actions/report';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const result = await getReportByMonth(userId);
  return NextResponse.json(result);
}
