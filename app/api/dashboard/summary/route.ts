import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { exportDashboardSummary, getDashboardSummary } from '@/lib/services/summary.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const summary = await getDashboardSummary(userId)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error generating dashboard summary:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate dashboard summary' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const csv = await exportDashboardSummary(userId)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="dashboard-summary-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting dashboard summary:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export dashboard summary' },
      { status: 500 }
    )
  }
}
