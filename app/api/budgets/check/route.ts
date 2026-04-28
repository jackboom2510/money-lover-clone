import { NextRequest, NextResponse } from 'next/server';
import { checkBudget } from '@/lib/actions/budget';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const budgetId = searchParams.get('budgetId') || '';
  const result = await checkBudget(userId, budgetId);
  return NextResponse.json(result);
}
