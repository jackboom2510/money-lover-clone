'use server'

import { db } from '../db'
import { GoalSchema, GoalSchemaType } from '../schemas/goal'

export async function createGoal(data: GoalSchemaType & { userId: string }) {
  const parsed = GoalSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return db.goal.create({
    data: {
      userId: data.userId,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      description: parsed.data.description,
      targetDate: parsed.data.targetDate,
      priority: parsed.data.priority,
      isCompleted: false,
      contributed: 0,
    },
  })
}

export async function getGoals(userId: string) {
  return db.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function syncGoalState(userId: string, goalId: string) {
  const goal = await db.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    select: {
      id: true,
      targetAmount: true,
    },
  })

  if (!goal) {
    throw new Error('Goal not found')
  }

  const contributionAggregate = await db.transaction.aggregate({
    where: {
      userId,
      goalId,
      type: 'income',
    },
    _sum: {
      amount: true,
    },
  })

  const contributed = contributionAggregate._sum.amount || 0
  const clampedContributed = Math.min(contributed, goal.targetAmount)
  const isCompleted = clampedContributed >= goal.targetAmount

  return db.goal.update({
    where: { id: goal.id },
    data: {
      contributed: clampedContributed,
      isCompleted,
    },
  })
}

export async function contributeToGoal(userId: string, goalId: string, amount: number) {
  const goal = await db.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    select: {
      id: true,
      targetAmount: true,
      contributed: true,
    },
  })

  if (!goal) {
    throw new Error('Goal not found')
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Contribution amount must be greater than 0')
  }

  const contributed = Math.min(goal.contributed + amount, goal.targetAmount)
  const isCompleted = contributed >= goal.targetAmount

  return db.goal.update({
    where: { id: goal.id },
    data: {
      contributed,
      isCompleted,
    },
  })
}
