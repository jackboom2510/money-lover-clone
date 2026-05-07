import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// Redirect to the new comprehensive backup route
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Redirect to the new backup route with default CSV export
    const { searchParams } = new URL(req.url);
    const newUrl = new URL('/api/backup', req.url);
    
    // Pass along query parameters
    newUrl.searchParams.set('format', 'csv');
    newUrl.searchParams.set('include', 'transactions,budgets,goals,loans,categories');
    
    // Forward the request
    const response = await fetch(newUrl.toString(), {
      method: 'GET',
      headers: req.headers
    });

    if (!response.ok) {
      throw new Error('Failed to export backup');
    }

    const csv = await response.text();
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting backup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export backup' },
      { status: 500 }
    );
  }
}
