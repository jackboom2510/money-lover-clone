"use client"
import { useEffect, useState } from 'react'
import { checkBudget, getBudgets } from '@/lib/actions/budget'

export default function CheckBudgetSection({ userId }: { userId: string }) {
  const [budgets, setBudgets] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const res = await getBudgets(userId)
        setBudgets(res)
      } catch {
        setBudgets([])
      }
    }
    fetchBudgets()
  }, [userId])

  async function handleCheck() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await checkBudget(userId, selected)
      setResult(res)
    } catch {
      setResult(null)
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Check Budget</h2>
      <div className="flex gap-2 items-center mb-4">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select budget</option>
          {budgets.map((b: any) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button
          onClick={handleCheck}
          disabled={!selected || loading}
          className="bg-orange-600 text-white px-3 py-1 rounded"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>
      {result && (
        <div className="border rounded p-2">
          <div className="font-semibold">Budget: {result.budget?.name || 'N/A'}</div>
          <div>Spent: {result.spent}</div>
          <div>Exceeded: {result.exceeded ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}
