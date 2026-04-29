'use client'
import { useState } from 'react'
// import { deleteBudget } from '@/lib/actions/budget'
import { Button } from '@/components/ui/button'

export default function DeleteBudgetButton({ budgetId, onDeleted }: { budgetId: string, onDeleted?: () => void }) {
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    setLoading(true)
    // await deleteBudget(budgetId) // TODO: Implement deleteBudget function
    setLoading(false)
    if (onDeleted) onDeleted()
  }
  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading} size="sm">
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
