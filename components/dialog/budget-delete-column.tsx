'use client'
import DeleteBudgetButton from './delete-budget-button'

export default function BudgetDeleteColumn({ budgetId, onDeleted }: { budgetId: string, onDeleted?: () => void }) {
  return <DeleteBudgetButton budgetId={budgetId} onDeleted={onDeleted} />
}
