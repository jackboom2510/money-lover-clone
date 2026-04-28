import { NextRequest, NextResponse } from 'next/server';
import { contributeToGoal } from '@/lib/actions/goal';

export async function PUT(req: NextRequest, { params }: { params: { goalId: string } }) {
  const { goalId } = params;
  const { amount } = await req.json();
  const result = await contributeToGoal(goalId, amount);
  return NextResponse.json(result);
}
