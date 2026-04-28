"use client"
import { useState } from 'react'
import { createGoal } from '@/lib/actions/goal'

export default function CreateGoalForm({ userId, onCreated }: { userId: string, onCreated?: () => void }) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createGoal({
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        description,
        targetDate,
      })
      setName('')
      setTargetAmount('')
      setDescription('')
      setTargetDate('')
      if (onCreated) onCreated()
    } catch (err: any) {
      setError(err.message || 'Error creating goal')
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
        <label className="block font-medium">Target Amount</label>
        <input value={targetAmount} onChange={e => setTargetAmount(e.target.value)} type="number" min="0" step="0.01" required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Target Date</label>
        <input value={targetDate} onChange={e => setTargetDate(e.target.value)} type="date" required className="border rounded px-2 py-1 w-full" />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">
        {loading ? 'Creating...' : 'Create Goal'}
      </button>
    </form>
  )
}
