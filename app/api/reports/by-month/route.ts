import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report.service';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const months = searchParams.get('months') ? parseInt(searchParams.get('months')!) : undefined;
    
    const result = await ReportService.getTransactionsByMonth(userId, months);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
