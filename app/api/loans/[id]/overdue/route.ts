import { NextRequest, NextResponse } from 'next/server';
import { getLoanOverdue } from '@/lib/actions/loan';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const result = await getLoanOverdue(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking loan overdue status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check loan overdue status' },
      { status: 500 }
    );
  }
}
