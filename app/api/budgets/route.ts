import { NextRequest, NextResponse } from 'next/server';
import { createBudget, getBudgets, checkBudget } from '@/lib/actions/budget';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const budget = await createBudget(data);
  return NextResponse.json(budget);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const budgets = await getBudgets(userId);
  return NextResponse.json(budgets);
}
