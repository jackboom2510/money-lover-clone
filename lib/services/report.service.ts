// report.service.ts
import { db } from '../db'

export interface CategoryReport {
  category: string
  totalAmount: number
  transactionCount: number
  type: 'income' | 'expense'
}

export interface MonthlyReport {
  month: number
  year: number
  income: number
  expense: number
  net: number
  transactionCount: number
}

export interface ReportSummary {
  totalIncome: number
  totalExpense: number
  netIncome: number
  transactionCount: number
  averageTransaction: number
  topCategories: CategoryReport[]
  monthlyTrend: MonthlyReport[]
}

export class ReportService {
  /**
   * Aggregate transaction data by category
   */
  static async getTransactionsByCategory(
    userId: string,
    type?: 'income' | 'expense',
    startDate?: Date,
    endDate?: Date
  ): Promise<CategoryReport[]> {
    try {
      const whereClause: any = { userId }
      
      if (type) {
        whereClause.type = type
      }
      
      if (startDate || endDate) {
        whereClause.date = {}
        if (startDate) whereClause.date.gte = startDate
        if (endDate) whereClause.date.lte = endDate
      }

      const categoryData = await db.transaction.groupBy({
        by: ['category', 'type'],
        where: whereClause,
        _sum: { amount: true },
        _count: { id: true }
      })

      return categoryData.map(item => ({
        category: item.category,
        totalAmount: item._sum.amount || 0,
        transactionCount: item._count.id,
        type: item.type as 'income' | 'expense'
      })).sort((a, b) => b.totalAmount - a.totalAmount)
    } catch (error) {
      console.error('Error getting transactions by category:', error)
      throw error
    }
  }

  /**
   * Aggregate transaction data by month
   */
  static async getTransactionsByMonth(
    userId: string,
    months?: number // Number of months to look back
  ): Promise<MonthlyReport[]> {
    try {
      const startDate = months 
        ? new Date(new Date().setMonth(new Date().getMonth() - months))
        : new Date(new Date().setFullYear(new Date().getFullYear() - 1))

      const monthlyData = await db.transaction.groupBy({
        by: ['date'],
        where: {
          userId,
          date: { gte: startDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      })

      // Group by month and year
      const monthlyMap = new Map<string, MonthlyReport>()

      monthlyData.forEach(item => {
        const date = new Date(item.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            income: 0,
            expense: 0,
            net: 0,
            transactionCount: 0
          })
        }

        const report = monthlyMap.get(monthKey)!
        const amount = item._sum.amount || 0
        
        // We need to get the type for each transaction, so let's fetch them
        report.transactionCount += item._count.id
      })

      // Get income and expense separately for each month
      for (const [monthKey, report] of Array.from(monthlyMap.entries())) {
        const [year, month] = monthKey.split('-').map(Number)
        const monthStart = new Date(year, month - 1, 1)
        const monthEnd = new Date(year, month, 0)

        const incomeData = await db.transaction.aggregate({
          where: {
            userId,
            type: 'income',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })

        const expenseData = await db.transaction.aggregate({
          where: {
            userId,
            type: 'expense',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })

        report.income = incomeData._sum.amount || 0
        report.expense = expenseData._sum.amount || 0
        report.net = report.income - report.expense
      }

      return Array.from(monthlyMap.values())
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
    } catch (error) {
      console.error('Error getting transactions by month:', error)
      throw error
    }
  }

  /**
   * Get comprehensive report summary
   */
  static async getReportSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReportSummary> {
    try {
      const whereClause: any = { userId }
      
      if (startDate || endDate) {
        whereClause.date = {}
        if (startDate) whereClause.date.gte = startDate
        if (endDate) whereClause.date.lte = endDate
      }

      // Get overall aggregates
      const [incomeData, expenseData, transactionCount] = await Promise.all([
        db.transaction.aggregate({
          where: { ...whereClause, type: 'income' },
          _sum: { amount: true }
        }),
        db.transaction.aggregate({
          where: { ...whereClause, type: 'expense' },
          _sum: { amount: true }
        }),
        db.transaction.count({ where: whereClause })
      ])

      const totalIncome = incomeData._sum.amount || 0
      const totalExpense = expenseData._sum.amount || 0
      const netIncome = totalIncome - totalExpense
      const averageTransaction = transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0

      // Get top categories
      const topCategories = await this.getTransactionsByCategory(userId, undefined, startDate, endDate)
      
      // Get monthly trend
      const monthlyTrend = await this.getTransactionsByMonth(userId, 12)

      return {
        totalIncome,
        totalExpense,
        netIncome,
        transactionCount,
        averageTransaction,
        topCategories: topCategories.slice(0, 10), // Top 10 categories
        monthlyTrend: monthlyTrend.slice(0, 12) // Last 12 months
      }
    } catch (error) {
      console.error('Error getting report summary:', error)
      throw error
    }
  }

  /**
   * Get spending trends and insights
   */
  static async getSpendingInsights(userId: string): Promise<{
    averageDailySpending: number
    highestSpendingDay: { date: Date; amount: number }
    budgetUtilization: Array<{ budgetName: string; percentage: number; status: string }>
  }> {
    try {
      // Get daily spending average
      const last30Days = new Date()
      last30Days.setDate(last30Days.getDate() - 30)

      const totalSpent = await db.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          date: { gte: last30Days }
        },
        _sum: { amount: true }
      })

      const averageDailySpending = (totalSpent._sum.amount || 0) / 30

      // Get highest spending day
      const dailySpending = await db.transaction.groupBy({
        by: ['date'],
        where: {
          userId,
          type: 'expense',
          date: { gte: last30Days }
        },
        _sum: { amount: true }
      })

      const highestSpendingDay = dailySpending.reduce((max, current) => {
        const currentAmount = current._sum.amount || 0
        return currentAmount > (max.amount || 0) 
          ? { date: new Date(current.date), amount: currentAmount }
          : max
      }, { date: new Date(), amount: 0 })

      // Get budget utilization
      const budgets = await db.budget.findMany({
        where: { userId, isActive: true },
        include: {
          transactions: {
            where: { type: 'expense' }
          }
        }
      })

      const budgetUtilization = budgets.map(budget => {
        const spent = budget.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        let status = 'good'
        if (percentage >= 100) status = 'exceeded'
        else if (percentage >= 80) status = 'warning'

        return {
          budgetName: budget.name,
          percentage,
          status
        }
      })

      return {
        averageDailySpending,
        highestSpendingDay,
        budgetUtilization
      }
    } catch (error) {
      console.error('Error getting spending insights:', error)
      throw error
    }
  }
}
