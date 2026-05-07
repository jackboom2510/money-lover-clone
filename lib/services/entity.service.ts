import { db } from '@/lib/db'

export interface BudgetOption {
  id: string
  name: string
  category: string | null
  amount: number
  spent: number
}

export interface GoalOption {
  id: string
  name: string
  priority: string
  targetAmount: number
  contributed: number
  isCompleted: boolean
}

export interface LoanOption {
  id: string
  name: string
  loanType: string
  totalAmount: number
  paidAmount: number
  status: string
}

export async function getBudgetOptions(userId: string): Promise<BudgetOption[]> {
  try {
    const budgets = await db.budget.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        category: true,
        amount: true,
        spent: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return budgets
      .filter(
        (budget) => budget.isActive && new Date() >= budget.startDate && new Date() <= budget.endDate
      )
      .map(budget => ({
        id: budget.id,
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        spent: budget.spent,
      }))
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return []
  }
}

export async function getGoalOptions(userId: string): Promise<GoalOption[]> {
  try {
    const goals = await db.goal.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        priority: true,
        targetAmount: true,
        contributed: true,
        isCompleted: true,
      },
      orderBy: { priority: 'asc' },
    })

    return goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      priority: goal.priority,
      targetAmount: goal.targetAmount,
      contributed: goal.contributed,
      isCompleted: goal.isCompleted,
    }))
  } catch (error) {
    console.error('Error fetching goals:', error)
    return []
  }
}

export async function getLoanOptions(userId: string): Promise<LoanOption[]> {
  try {
    const loans = await db.loan.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        loanType: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
      },
      orderBy: { dueDate: 'asc' },
    })

    return loans.map(loan => ({
      id: loan.id,
      name: loan.name,
      loanType: loan.loanType,
      totalAmount: loan.totalAmount,
      paidAmount: loan.paidAmount,
      status: loan.status,
    }))
  } catch (error) {
    console.error('Error fetching loans:', error)
    return []
  }
}
