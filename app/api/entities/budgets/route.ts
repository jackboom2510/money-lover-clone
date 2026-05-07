import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await auth()
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budgets = await db.budget.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        name: true,
        category: true,
        amount: true,
        spent: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}
