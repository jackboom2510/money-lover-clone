"use client"
import { useState } from 'react'
import { createLoan } from '@/lib/actions/loan'

export default function CreateLoanForm({ userId, onCreated }: { userId: string, onCreated?: () => void }) {
  const [name, setName] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createLoan({
        userId,
        name,
        totalAmount: parseFloat(totalAmount),
        description,
        dueDate,
      })
      setName('')
      setTotalAmount('')
      setDescription('')
      setDueDate('')
      if (onCreated) onCreated()
    } catch (err: any) {
      setError(err.message || 'Error creating loan')
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
        <label className="block font-medium">Total Amount</label>
        <input value={totalAmount} onChange={e => setTotalAmount(e.target.value)} type="number" min="0" step="0.01" required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Due Date</label>
        <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" required className="border rounded px-2 py-1 w-full" />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Creating...' : 'Create Loan'}
      </button>
    </form>
  )
}
