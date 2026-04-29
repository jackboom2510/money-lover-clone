import { NextRequest, NextResponse } from 'next/server';
import { createLoan, getLoans } from '@/lib/actions/loan';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export interface LoanWithStatus {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  description?: string;
  dueDate: Date;
  overdue: boolean;
  status: string;
  createdAt: Date;
  interestRate?: number;
  loanType: string;
  daysOverdue?: number;
  nextPaymentDate?: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const loan = await createLoan({ ...data, userId });
    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create loan' },
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
      // Get loans with enhanced status information
      const loans = await getLoansWithStatus(userId);
      return NextResponse.json(loans);
    }

    const loans = await getLoans(userId);
    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();
    
    // Verify loan belongs to user
    const existingLoan = await db.loan.findUnique({
      where: { id }
    });

    if (!existingLoan || existingLoan.userId !== userId) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    const updatedLoan = await db.loan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update loan' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Loan ID required' }, { status: 400 });
    }

    // Verify loan belongs to user
    const existingLoan = await db.loan.findUnique({
      where: { id }
    });

    if (!existingLoan || existingLoan.userId !== userId) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    await db.loan.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete loan' },
      { status: 500 }
    );
  }
}

// Helper function to get loans with enhanced status
async function getLoansWithStatus(userId: string): Promise<LoanWithStatus[]> {
  const loans = await db.loan.findMany({
    where: { userId },
    include: {
      repaymentSchedules: {
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  const now = new Date();
  
  return loans.map(loan => {
    const remainingAmount = loan.totalAmount - loan.paidAmount;
    const daysOverdue = loan.dueDate < now ? Math.floor((now.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const overdue = loan.dueDate < now && remainingAmount > 0;
    
    // Determine next payment date from repayment schedules
    const nextPayment = loan.repaymentSchedules.find(schedule => 
      schedule.status === 'pending' && schedule.dueDate >= now
    );

    // Update loan status if overdue
    let status = loan.status;
    if (overdue && status === 'active') {
      status = 'overdue';
    } else if (remainingAmount <= 0 && status !== 'paid') {
      status = 'paid';
    }

    return {
      ...loan,
      description: loan.description || undefined,
      interestRate: loan.interestRate || undefined,
      remainingAmount,
      daysOverdue,
      overdue,
      status,
      nextPaymentDate: nextPayment?.dueDate
    };
  });
}
