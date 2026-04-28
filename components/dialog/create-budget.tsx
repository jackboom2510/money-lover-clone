"use client"
import { useState } from 'react'
import { createBudget } from '@/lib/actions/budget'

export default function CreateBudgetForm({ userId, onCreated }: { userId: string, onCreated?: () => void }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createBudget({
        userId,
        name,
        amount: parseFloat(amount),
        description,
        startDate,
        endDate,
      })
      setName('')
      setAmount('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      if (onCreated) onCreated()
    } catch (err: any) {
      setError(err.message || 'Error creating budget')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      <div>
        <label className="block font-medium">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Amount</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0" step="0.01" required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Start Date</label>
        <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">End Date</label>
        <input value={endDate} onChange={e => setEndDate(e.target.value)} type="date" required className="border rounded px-2 py-1 w-full" />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">
        {loading ? 'Creating...' : 'Create Budget'}
      </button>
    </form>
  )
}
