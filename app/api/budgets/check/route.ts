import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/budget.service';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const budgetId = searchParams.get('budgetId') || '';
    const transactionAmount = parseFloat(searchParams.get('amount') || '0');
    
    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID required' }, { status: 400 });
    }
    
    const result = await BudgetService.checkBudgetExceedance(userId, budgetId, transactionAmount);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking budget:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check budget' },
      { status: 500 }
    );
  }
}
