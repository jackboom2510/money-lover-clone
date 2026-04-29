// goal.ts
'use server'


import { db } from '../db'
import { z } from 'zod'

const GoalSchema = z.object({
  userId: z.string(),
  name: z.string(),
  targetAmount: z.number(),
  description: z.string().optional(),
  targetDate: z.union([z.string(), z.date()]),
})

export async function createGoal(data: any) {
  const parsed = GoalSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  // Đảm bảo targetDate là kiểu Date
  const goalData = {
    ...parsed.data,
    targetDate: new Date(parsed.data.targetDate),
    userId: data.userId, // Ensure userId is included
    name: parsed.data.name || 'Untitled Goal', // Ensure name is provided
    targetAmount: parsed.data.targetAmount || 0, // Ensure targetAmount is provided
  }
  return db.goal.create({ data: goalData })
}

export async function getGoals(userId: string) {
  return db.goal.findMany({ where: { userId } })
}

export async function contributeToGoal(goalId: string, amount: number) {
  return db.goal.update({
    where: { id: goalId },
    data: { contributed: { increment: amount } },
  })
}
