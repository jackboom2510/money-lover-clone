import { NextRequest, NextResponse } from 'next/server';
import { getLoanOverdue } from '@/lib/actions/loan';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const result = await getLoanOverdue(id);
  return NextResponse.json(result);
}
