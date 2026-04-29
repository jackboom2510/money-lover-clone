import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report.service';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'income' | 'expense' | undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    
    const result = await ReportService.getTransactionsByCategory(userId, type, startDate, endDate);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating category report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate category report' },
      { status: 500 }
    );
  }
}
