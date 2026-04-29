// budget.service.ts
import { db } from '../db'

export interface BudgetCheckResult {
  budget: any
  spent: number
  remaining: number
  percentage: number
  exceeded: boolean
  alertThreshold?: number
  shouldAlert: boolean
}

export class BudgetService {
  /**
   * Check if a transaction would exceed the budget
   */
  static async checkBudgetExceedance(
    userId: string,
    budgetId: string,
    transactionAmount: number
  ): Promise<BudgetCheckResult> {
    try {
      // Get the budget
      const budget = await db.budget.findUnique({
        where: { id: budgetId, userId }
      })

      if (!budget) {
        throw new Error('Budget not found')
      }

      // Check if budget is still active and within date range
      const now = new Date()
      if (!budget.isActive || now < budget.startDate || now > budget.endDate) {
        throw new Error('Budget is not active or expired')
      }

      // Calculate current spent amount
      const currentSpent = await db.transaction.aggregate({
        where: { 
          userId, 
          budgetId,
          type: 'expense'
        },
        _sum: { amount: true }
      })

      const spent = currentSpent._sum.amount || 0
      const newSpent = spent + transactionAmount
      const remaining = budget.amount - newSpent
      const percentage = (newSpent / budget.amount) * 100
      const exceeded = newSpent > budget.amount

      // Check if alert threshold is reached
      const shouldAlert = budget.alertThreshold 
        ? percentage >= budget.alertThreshold 
        : percentage >= 80 // Default 80% threshold

      return {
        budget,
        spent: newSpent,
        remaining,
        percentage,
        exceeded,
        alertThreshold: budget.alertThreshold || 80,
        shouldAlert
      }
    } catch (error) {
      console.error('Error checking budget exceedance:', error)
      throw error
    }
  }

  /**
   * Get budget status for all active budgets
   */
  static async getBudgetsStatus(userId: string): Promise<BudgetCheckResult[]> {
    try {
      const budgets = await db.budget.findMany({
        where: { 
          userId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      })

      const budgetStatuses: BudgetCheckResult[] = []

      for (const budget of budgets) {
        const spent = await db.transaction.aggregate({
          where: { 
            userId, 
            budgetId: budget.id,
            type: 'expense'
          },
          _sum: { amount: true }
        })

        const spentAmount = spent._sum.amount || 0
        const remaining = budget.amount - spentAmount
        const percentage = (spentAmount / budget.amount) * 100
        const exceeded = spentAmount > budget.amount

        const shouldAlert = budget.alertThreshold 
          ? percentage >= budget.alertThreshold 
          : percentage >= 80

        budgetStatuses.push({
          budget,
          spent: spentAmount,
          remaining,
          percentage,
          exceeded,
          alertThreshold: budget.alertThreshold || 80,
          shouldAlert
        })
      }

      return budgetStatuses
    } catch (error) {
      console.error('Error getting budgets status:', error)
      throw error
    }
  }

  /**
   * Update budget spent amount (called after transaction is created)
   */
  static async updateBudgetSpent(userId: string, budgetId: string): Promise<void> {
    try {
      const spent = await db.transaction.aggregate({
        where: { 
          userId, 
          budgetId,
          type: 'expense'
        },
        _sum: { amount: true }
      })

      await db.budget.update({
        where: { id: budgetId },
        data: { spent: spent._sum.amount || 0 }
      })
    } catch (error) {
      console.error('Error updating budget spent:', error)
      throw error
    }
  }
}
