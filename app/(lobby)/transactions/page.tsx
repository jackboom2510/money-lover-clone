'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import CreateTransactionDialog from '@/components/dialog/create-transaction'
import TransactionTable from './_components/TransactionTable'
import { Button } from '@/components/ui/button'

export default function TransactionsPage() {
  const { user } = useUser()
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to manage transactions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Create, review, update, and delete your transactions in one place
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-emerald-700">Add Income</h2>
              <p className="text-sm text-emerald-700/80">Record money coming into your wallets</p>
            </div>
            <CreateTransactionDialog
              userId={user.id}
              type="income"
              trigger={
                <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                  Create Income Transaction
                </Button>
              }
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-rose-700">Add Expense</h2>
              <p className="text-sm text-rose-700/80">Track your spending and linked repayments</p>
            </div>
            <CreateTransactionDialog
              userId={user.id}
              type="expense"
              trigger={
                <Button className="w-full bg-rose-600 text-white hover:bg-rose-700">
                  Create Expense Transaction
                </Button>
              }
            />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Transaction History</h2>
              <p className="text-sm text-muted-foreground">
                Filter, export, edit, and delete your full transaction history
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                className="rounded-md border px-3 py-2"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                className="rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <TransactionTable from={dateRange.from} to={dateRange.to} />
        </div>
      </div>
    </div>
  )
}
