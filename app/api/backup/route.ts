import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { parse } from 'json2csv';
import { Parser } from 'json2csv';

export interface ExportOptions {
  format: 'csv' | 'json';
  include: ('transactions' | 'budgets' | 'goals' | 'loans' | 'categories')[];
  startDate?: Date;
  endDate?: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const options: ExportOptions = await req.json();
    
    // Validate options
    if (!options.format || !['csv', 'json'].includes(options.format)) {
      return NextResponse.json({ error: 'Invalid format. Use csv or json' }, { status: 400 });
    }

    if (!options.include || !Array.isArray(options.include) || options.include.length === 0) {
      return NextResponse.json({ error: 'Include array is required' }, { status: 400 });
    }

    const data = await exportUserData(userId, options);
    
    if (options.format === 'csv') {
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export data' },
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
    const format = (searchParams.get('format') || 'json') as 'csv' | 'json';
    const include = searchParams.get('include')?.split(',') || ['transactions'];
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const options: ExportOptions = {
      format,
      include: include as any,
      startDate,
      endDate
    };

    const data = await exportUserData(userId, options);
    
    if (format === 'csv') {
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export data' },
      { status: 500 }
    );
  }
}

async function exportUserData(userId: string, options: ExportOptions): Promise<string> {
  const whereClause: any = { userId };
  
  if (options.startDate || options.endDate) {
    whereClause.date = {};
    if (options.startDate) whereClause.date.gte = options.startDate;
    if (options.endDate) whereClause.date.lte = options.endDate;
  }

  const exportData: any = {
    exportDate: new Date().toISOString(),
    userId,
    dateRange: {
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    }
  };

  // Export Transactions
  if (options.include.includes('transactions')) {
    const transactions = await db.transaction.findMany({
      where: options.startDate || options.endDate ? whereClause : { userId },
      orderBy: { date: 'desc' }
    });
    exportData.transactions = transactions;
  }

  // Export Budgets
  if (options.include.includes('budgets')) {
    const budgets = await db.budget.findMany({
      where: { userId },
      include: {
        transactions: options.include.includes('transactions') ? false : {
          where: options.startDate || options.endDate ? whereClause : undefined,
          select: {
            id: true,
            amount: true,
            date: true,
            description: true,
            category: true,
            type: true
          }
        }
      }
    });
    exportData.budgets = budgets;
  }

  // Export Goals
  if (options.include.includes('goals')) {
    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' }
    });
    exportData.goals = goals;
  }

  // Export Loans
  if (options.include.includes('loans')) {
    const loans = await db.loan.findMany({
      where: { userId },
      include: {
        repaymentSchedules: {
          orderBy: { dueDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    exportData.loans = loans;
  }

  // Export Categories
  if (options.include.includes('categories')) {
    const categories = await db.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
    exportData.categories = categories;
  }

  // Format based on requested format
  if (options.format === 'csv') {
    return convertToCSV(exportData, options.include);
  } else {
    return JSON.stringify(exportData, null, 2);
  }
}

function convertToCSV(data: any, include: string[]): string {
  const csvSections: string[] = [];
  
  // Add metadata
  csvSections.push('# Export Data');
  csvSections.push(`# Export Date: ${data.exportDate}`);
  csvSections.push(`# User ID: ${data.userId}`);
  if (data.dateRange.startDate || data.dateRange.endDate) {
    csvSections.push(`# Date Range: ${data.dateRange.startDate || 'All'} to ${data.dateRange.endDate || 'Present'}`);
  }
  csvSections.push('');

  // Transactions CSV
  if (include.includes('transactions') && data.transactions?.length > 0) {
    csvSections.push('# Transactions');
    const transactionsCSV = parse(data.transactions, {
      fields: [
        { label: 'ID', value: 'id' },
        { label: 'Date', value: 'date' },
        { label: 'Description', value: 'description' },
        { label: 'Amount', value: 'amount' },
        { label: 'Type', value: 'type' },
        { label: 'Category', value: 'category' },
        { label: 'Category Icon', value: 'categoryIcon' },
        { label: 'Budget ID', value: 'budgetId' },
        { label: 'Created At', value: 'createdAt' }
      ]
    });
    csvSections.push(transactionsCSV);
    csvSections.push('');
  }

  // Budgets CSV
  if (include.includes('budgets') && data.budgets?.length > 0) {
    csvSections.push('# Budgets');
    const budgetsCSV = parse(data.budgets, {
      fields: [
        { label: 'ID', value: 'id' },
        { label: 'Name', value: 'name' },
        { label: 'Amount', value: 'amount' },
        { label: 'Spent', value: 'spent' },
        { label: 'Category', value: 'category' },
        { label: 'Start Date', value: 'startDate' },
        { label: 'End Date', value: 'endDate' },
        { label: 'Is Active', value: 'isActive' },
        { label: 'Alert Threshold', value: 'alertThreshold' },
        { label: 'Description', value: 'description' },
        { label: 'Created At', value: 'createdAt' }
      ]
    });
    csvSections.push(budgetsCSV);
    csvSections.push('');
  }

  // Goals CSV
  if (include.includes('goals') && data.goals?.length > 0) {
    csvSections.push('# Goals');
    const goalsCSV = parse(data.goals, {
      fields: [
        { label: 'ID', value: 'id' },
        { label: 'Name', value: 'name' },
        { label: 'Target Amount', value: 'targetAmount' },
        { label: 'Contributed', value: 'contributed' },
        { label: 'Progress (%)', value: (row: any) => ((row.contributed / row.targetAmount) * 100).toFixed(2) + '%' },
        { label: 'Target Date', value: 'targetDate' },
        { label: 'Is Completed', value: 'isCompleted' },
        { label: 'Priority', value: 'priority' },
        { label: 'Category', value: 'category' },
        { label: 'Description', value: 'description' },
        { label: 'Created At', value: 'createdAt' }
      ]
    });
    csvSections.push(goalsCSV);
    csvSections.push('');
  }

  // Loans CSV
  if (include.includes('loans') && data.loans?.length > 0) {
    csvSections.push('# Loans');
    const loansCSV = parse(data.loans, {
      fields: [
        { label: 'ID', value: 'id' },
        { label: 'Name', value: 'name' },
        { label: 'Total Amount', value: 'totalAmount' },
        { label: 'Paid Amount', value: 'paidAmount' },
        { label: 'Remaining Amount', value: (row: any) => (row.totalAmount - row.paidAmount).toFixed(2) },
        { label: 'Interest Rate (%)', value: 'interestRate' },
        { label: 'Loan Type', value: 'loanType' },
        { label: 'Status', value: 'status' },
        { label: 'Due Date', value: 'dueDate' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Description', value: 'description' },
        { label: 'Created At', value: 'createdAt' }
      ]
    });
    csvSections.push(loansCSV);
    csvSections.push('');
  }

  // Categories CSV
  if (include.includes('categories') && data.categories?.length > 0) {
    csvSections.push('# Categories');
    const categoriesCSV = parse(data.categories, {
      fields: [
        { label: 'ID', value: 'id' },
        { label: 'Name', value: 'name' },
        { label: 'Type', value: 'type' },
        { label: 'Icon', value: 'icon' },
        { label: 'Created At', value: 'createdAt' }
      ]
    });
    csvSections.push(categoriesCSV);
  }

  return csvSections.join('\n');
}
