"use client"

import React from 'react'
import { useUser } from '@clerk/nextjs'
import CreateTransactionDialog from '@/components/dialog/create-transaction'

export default function TransactionsPage() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to add transactions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
          <p className="text-muted-foreground">
            Create a new transaction and optionally link it to your goals, budgets, or loans
          </p>
        </div>

        {/* Transaction Form */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Income Transaction */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">Add Income</h2>
            <CreateTransactionDialog
              userId={user.id}
              type="income"
              trigger={
                <button className="w-full px-4 py-3 border-2 border-green-500 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-lg font-medium">🤑 New Income</div>
                  <div className="text-sm text-green-600">Add money to your accounts</div>
                </button>
              }
            />
          </div>

          {/* Expense Transaction */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Add Expense</h2>
            <CreateTransactionDialog
              userId={user.id}
              type="expense"
              trigger={
                <button className="w-full px-4 py-3 border-2 border-red-500 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="text-lg font-medium">😤 New Expense</div>
                  <div className="text-sm text-red-600">Track your spending</div>
                </button>
              }
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">How to link transactions:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Budget:</strong> Link expenses to track budget utilization</li>
            <li>• <strong>Goal:</strong> Link income to track goal progress</li>
            <li>• <strong>Loan:</strong> Link transactions to track loan repayments</li>
          </ul>
          <p className="mt-4 text-sm">
            To view your transaction history, visit the <strong>History</strong> page.
          </p>
        </div>
      </div>
    </div>
  )
}