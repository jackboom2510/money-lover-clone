// budget.ts
'use server'

import { db } from '../db'
import { z } from 'zod'

const BudgetSchema = z.object({
  userId: z.string(),
  name: z.string(),
  amount: z.number(),
  description: z.string().optional(),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]),
})

export async function createBudget(data: any) {
  const parsed = BudgetSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  // Đảm bảo startDate, endDate là kiểu Date
  const budgetData = {
    ...parsed.data,
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
    userId: data.userId, // Ensure userId is included
    name: parsed.data.name || 'Untitled Budget', // Ensure name is provided
    amount: parsed.data.amount || 0, // Ensure amount is provided
  }
  return db.budget.create({ data: budgetData })
}

export async function getBudgets(userId: string) {
  return db.budget.findMany({ where: { userId } })
}

export async function checkBudget(userId: string, budgetId: string) {
  // Giả sử có bảng transaction liên kết với budget
  const budget = await db.budget.findUnique({ where: { id: budgetId, userId } })
  const spent = await db.transaction.aggregate({
    where: { userId, budgetId },
    _sum: { amount: true },
  })
  const spentAmount = spent._sum.amount || 0
  if (!budget) {
    return { budget: null, spent: spentAmount, exceeded: false }
  }
  return { budget, spent: spentAmount, exceeded: spentAmount > budget.amount }
}
