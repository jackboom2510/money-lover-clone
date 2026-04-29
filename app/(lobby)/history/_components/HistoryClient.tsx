"use client"

import React from 'react'
import TransactionTable from '@/app/(lobby)/transactions/_components/TransactionTable'

export default function HistoryClient() {
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">
            View and export your complete transaction history
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.from.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
            className="px-3 py-2 border rounded"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.to.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
            className="px-3 py-2 border rounded"
          />
        </div>

        {/* Transaction Table */}
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </div>
  )
}
