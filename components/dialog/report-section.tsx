"use client"
import { useEffect, useState } from 'react'
import { getReportSummary, getReportByCategory, getReportByMonth } from '@/lib/actions/report'

export default function ReportSection({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<any>(null)
  const [byCategory, setByCategory] = useState<any[]>([])
  const [byMonth, setByMonth] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      try {
        const s = await getReportSummary(userId)
        const c = await getReportByCategory(userId)
        const m = await getReportByMonth(userId)
        setSummary(s)
        setByCategory(c)
        setByMonth(m)
      } catch {
        setSummary(null)
        setByCategory([])
        setByMonth([])
      }
      setLoading(false)
    }
    fetchReports()
  }, [userId])

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Reports</h2>
      {loading ? (
        <div>Loading reports...</div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded p-2">
            <div className="font-semibold mb-1">Summary</div>
            {summary ? (
              <div>
                <div>Income: {summary.income}</div>
                <div>Expense: {summary.expense}</div>
              </div>
            ) : <div>No data</div>}
          </div>
          <div className="border rounded p-2">
            <div className="font-semibold mb-1">By Category</div>
            {byCategory.length ? (
              <ul>
                {byCategory.map((c, i) => (
                  <li key={i}>{c.category}: {c._sum.amount}</li>
                ))}
              </ul>
            ) : <div>No data</div>}
          </div>
          <div className="border rounded p-2">
            <div className="font-semibold mb-1">By Month</div>
            {byMonth.length ? (
              <ul>
                {byMonth.map((m, i) => (
                  <li key={i}>Month: {m.month || 'N/A'} - Total: {m._sum.amount}</li>
                ))}
              </ul>
            ) : <div>No data</div>}
          </div>
        </div>
      )}
    </div>
  )
}
