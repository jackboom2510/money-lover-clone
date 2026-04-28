"use client"
import { useEffect, useState } from 'react'
import { getLoans } from '@/lib/actions/loan'
import CreateLoanForm from './create-loan'

export default function LoanList({ userId }: { userId: string }) {
  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    setLoading(true)
    try {
      const res = await getLoans(userId)
      setLoans(res)
    } catch (e) {
      setLoans([])
    }
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Loans</h2>
      <CreateLoanForm userId={userId} onCreated={reload} />
      {loading ? (
        <div>Loading loans...</div>
      ) : !loans.length ? (
        <div>No loans found.</div>
      ) : (
        <ul className="space-y-2">
          {loans.map((l) => (
            <li key={l.id} className="border rounded p-2">
              <div className="font-semibold">{l.name}</div>
              <div>Total: {l.totalAmount}</div>
              <div>Paid: {l.paidAmount}</div>
              <div>Due: {new Date(l.dueDate).toLocaleDateString()}</div>
              <div>Description: {l.description || '---'}</div>
              <div>Status: {l.overdue ? 'Overdue' : 'On time'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
