import { NextRequest, NextResponse } from 'next/server';
import { contributeToGoal } from '@/lib/actions/goal';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { goalId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goalId } = params;
    const { amount } = await req.json();
    const result = await contributeToGoal(goalId, amount);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error contributing to goal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to contribute to goal' },
      { status: 500 }
    );
  }
}
