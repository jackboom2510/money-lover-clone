import { NextRequest, NextResponse } from 'next/server';
import { createLoan, getLoans } from '@/lib/actions/loan';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const loan = await createLoan(data);
  return NextResponse.json(loan);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const loans = await getLoans(userId);
  return NextResponse.json(loans);
}
