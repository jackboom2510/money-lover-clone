import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ message: 'Test API working', timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
