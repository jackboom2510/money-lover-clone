import { NextRequest, NextResponse } from 'next/server';
import { createGoal, getGoals, contributeToGoal } from '@/lib/actions/goal';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const goal = await createGoal(data);
  return NextResponse.json(goal);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const goals = await getGoals(userId);
  return NextResponse.json(goals);
}
