'use client'
import LoanList from '@/components/dialog/loan-list'

export default function LoanListClient({ userId }: { userId: string }) {
  return <LoanList userId={userId} />
}
