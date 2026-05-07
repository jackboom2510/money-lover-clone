import { NextRequest, NextResponse } from 'next/server';
import { createBudget, getBudgets } from '@/lib/actions/budget';
import { BudgetService } from '@/lib/services/budget.service';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const budget = await createBudget({ ...data, userId });
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create budget' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeStatus = searchParams.get('includeStatus') === 'true';

    if (includeStatus) {
      // Get budgets with enhanced status information
      const budgetStatuses = await BudgetService.getBudgetsStatus(userId);
      return NextResponse.json(budgetStatuses);
    }

    const budgets = await getBudgets(userId);
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}
