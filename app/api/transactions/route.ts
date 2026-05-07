import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsHistory } from '@/lib/actions/transactions';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'From and to dates are required' }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const transactions = await getTransactionsHistory(fromDate, toDate, userId);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    // Here you would handle transaction creation
    // For now, return a success response
    return NextResponse.json({ message: 'Transaction created successfully' });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
