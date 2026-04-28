'use client'

import { useEffect, useState } from 'react'
import { getBudgets } from '@/lib/actions/budget'
import CreateBudgetForm from './create-budget'

interface BudgetListProps {
  userId: string
}

export default function BudgetList({ userId }: BudgetListProps) {
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    setLoading(true)
    try {
      const res = await getBudgets(userId)
      setBudgets(res || [])
    } catch (e) {
      setBudgets([])
    }
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Budgets</h2>
      <CreateBudgetForm userId={userId} onCreated={reload} />
      {loading ? (
        <div>Loading budgets...</div>
      ) : !budgets.length ? (
        <div>No budgets found.</div>
      ) : (
        <ul className="space-y-2">
          {budgets.map((b) => (
            <li key={b.id} className="border rounded p-2">
              <div className="font-semibold">{b.name}</div>
              <div>Amount: {b.amount}</div>
              <div>
                From: {new Date(b.startDate).toLocaleDateString()} - To: {new Date(b.endDate).toLocaleDateString()}
              </div>
              <div>Description: {b.description || '---'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}