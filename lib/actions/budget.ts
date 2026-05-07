'use server'

import { db } from '../db'
import { BudgetSchema, BudgetSchemaType } from '../schemas/budget'

export async function createBudget(data: BudgetSchemaType & { userId: string }) {
  const parsed = BudgetSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return db.budget.create({
    data: {
      userId: data.userId,
      name: parsed.data.name,
      amount: parsed.data.amount,
      description: parsed.data.description,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      category: parsed.data.category,
    },
  })
}

export async function getBudgets(userId: string) {
  return db.budget.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function syncBudgetState(userId: string, budgetId: string) {
  const budget = await db.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    select: {
      id: true,
      amount: true,
      alertThreshold: true,
      startDate: true,
      endDate: true,
      isActive: true,
    },
  })

  if (!budget) {
    throw new Error('Budget not found')
  }

  const spentAggregate = await db.transaction.aggregate({
    where: {
      userId,
      budgetId,
      type: 'expense',
    },
    _sum: {
      amount: true,
    },
  })

  const spent = spentAggregate._sum.amount || 0

  return db.budget.update({
    where: { id: budget.id },
    data: { spent },
  })
}

export async function checkBudget(userId: string, budgetId: string) {
  const budget = await db.budget.findFirst({
    where: { id: budgetId, userId },
  })

  const spentAggregate = await db.transaction.aggregate({
    where: {
      userId,
      budgetId,
      type: 'expense',
    },
    _sum: {
      amount: true,
    },
  })

  const spentAmount = spentAggregate._sum.amount || 0

  if (!budget) {
    return { budget: null, spent: spentAmount, exceeded: false }
  }

  return {
    budget,
    spent: spentAmount,
    exceeded: spentAmount > budget.amount,
  }
}
