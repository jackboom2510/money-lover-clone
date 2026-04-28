'use client'
import BudgetList from '@/components/dialog/budget-list'

export default function BudgetListClient({ userId }: { userId: string }) {
  return <BudgetList userId={userId} />
}
