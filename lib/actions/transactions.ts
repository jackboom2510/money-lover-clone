'use server'

import { db } from '../db'
import { syncBudgetState } from './budget'
import { syncGoalState } from './goal'
import { syncLoanState } from './loan'
import { CreateTransactionSchema, CreateTransactionSchemaType } from '../schemas/transactions'
import { GetFormatterForCurrency } from '../utils'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function createTransaction(userId: string, form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form)
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message)
  }

  const { amount, category, date, description, type, walletId, budgetId, goalId, loanId } = parsedBody.data

  // Validate wallet exists and belongs to user
  const wallet = await db.wallet.findUnique({
    where: {
      id: walletId,
      userId: userId,
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  let categoryRow = await db.category.findFirst({
    where: {
      userId: userId,
      name: category,
    },
  })

  // If category doesn't exist, create it (for mock categories)
  if (!categoryRow) {
    // Default icon based on category name
    const defaultIcon = category === 'Salary' ? '💰' : 
                        category === 'Freelance' ? '💼' : 
                        category === 'Investment' ? '📈' :
                        category === 'Food' ? '🍔' :
                        category === 'Transport' ? '🚗' :
                        category === 'Entertainment' ? '🎮' : '💵'

    categoryRow = await db.category.create({
      data: {
        userId: userId,
        name: category,
        icon: defaultIcon,
        type: type,
      },
    })
  }

  // NOTE: don't make confusion between $transaction ( db ) and db.transaction (table)

  await db.$transaction([
    // Create user transaction
    db.transaction.create({
      data: {
        userId: userId,
        walletId,
        amount,
        date,
        description: description || '',
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
        budgetId,
        goalId,
        loanId,
      },
    }),

    // Update month aggregate table
    db.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: userId,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: userId,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'expense' ? amount : 0,
        income: type === 'income' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
        income: {
          increment: type === 'income' ? amount : 0,
        },
      },
    }),

    // Update year aggreate
    db.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: userId,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: userId,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'expense' ? amount : 0,
        income: type === 'income' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'expense' ? amount : 0,
        },
        income: {
          increment: type === 'income' ? amount : 0,
        },
      },
    }),
  ])

  if (budgetId) {
    await syncBudgetState(userId, budgetId)
  }

  if (goalId) {
    await syncGoalState(userId, goalId)
  }

  if (loanId) {
    await syncLoanState(userId, loanId)
  }
}

export async function getBalanceStats(userId: string, from: Date, to: Date) {
  const totals = await db.transaction.groupBy({
    by: ['type'],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  })

  return {
    expense: totals.find((t) => t.type === 'expense')?._sum.amount || 0,
    income: totals.find((t) => t.type === 'income')?._sum.amount || 0,
  }
}

export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionsHistory>>

export async function getTransactionsHistory(from: Date, to: Date, userId?: string) {
  // If userId is not provided, try to get it from currentUser
  let user;
  if (userId) {
    user = { id: userId };
  } else {
    user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
  }

  const userSettings = await db.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  })
  if (!userSettings) {
    throw new Error('user settings not found')
  }

  const formatter = GetFormatterForCurrency(userSettings.currency)

  const transactions = await db.transaction.findMany({
    where: {
      userId: userSettings.userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      budget: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      goal: {
        select: {
          id: true,
          name: true,
          priority: true,
        },
      },
      loan: {
        select: {
          id: true,
          name: true,
          loanType: true,
        },
      },
    },
  })

  return transactions.map((transaction) => ({
    ...transaction,
    // lets format the amount with the user currency
    formattedAmount: formatter.format(transaction.amount),
  }))
}

export async function DeleteTransaction(id: string) {
  const user = await currentUser()
  if (!user) {
    redirect('/signin')
  }

  const transaction = await db.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  })

  if (!transaction) {
    throw new Error('bad request')
  }

  const { budgetId, goalId, loanId } = transaction

  await db.$transaction([
    // Delete transaction from db
    db.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    }),
    // Update month history
    db.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === 'expense' && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === 'income' && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
    // Update year history
    db.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === 'expense' && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === 'income' && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ])

  if (budgetId) {
    await syncBudgetState(user.id, budgetId)
  }

  if (goalId) {
    await syncGoalState(user.id, goalId)
  }

  if (loanId) {
    await syncLoanState(user.id, loanId)
  }
}
