import { NextRequest, NextResponse } from 'next/server';
import { exportBackup } from '@/lib/actions/report';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const csv = await exportBackup(userId);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="backup.csv"',
    },
  });
}
