'use client'
import CheckBudgetSection from '@/components/dialog/check-budget-section'

export default function CheckBudgetSectionClient({ userId }: { userId: string }) {
  return <CheckBudgetSection userId={userId} />
}
