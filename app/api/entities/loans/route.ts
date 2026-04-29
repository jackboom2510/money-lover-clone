import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await auth()
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loans = await db.loan.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        name: true,
        loanType: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}
