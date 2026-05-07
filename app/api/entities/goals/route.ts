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

    const goals = await db.goal.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        name: true,
        priority: true,
        targetAmount: true,
        contributed: true,
        isCompleted: true,
      },
      orderBy: { priority: 'asc' },
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}
