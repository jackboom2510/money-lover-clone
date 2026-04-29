import { db } from '@/lib/db'

export interface GoalSummary {
  totalGoals: number
  completedGoals: number
  totalTargetAmount: number
  totalContributed: number
  completionRate: number
}

export interface BudgetSummary {
  totalBudgets: number
  activeBudgets: number
  totalBudgetAmount: number
  totalSpent: number
  utilizationRate: number
}

export interface LoanSummary {
  totalLoans: number
  activeLoans: number
  totalLoanAmount: number
  totalPaidAmount: number
  overdueLoans: number
  outstandingAmount: number
}

export interface DashboardSummary {
  goals: GoalSummary
  budgets: BudgetSummary
  loans: LoanSummary
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  // Get Goals Summary
  const goals = await db.goal.findMany({
    where: { userId },
    select: {
      targetAmount: true,
      contributed: true,
      isCompleted: true,
    },
  })

  const goalSummary: GoalSummary = {
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.isCompleted).length,
    totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
    totalContributed: goals.reduce((sum, g) => sum + g.contributed, 0),
    completionRate: goals.length > 0 ? (goals.filter(g => g.isCompleted).length / goals.length) * 100 : 0,
  }

  // Get Budgets Summary
  const budgets = await db.budget.findMany({
    where: { userId },
    select: {
      amount: true,
      spent: true,
      isActive: true,
      startDate: true,
      endDate: true,
    },
  })

  const activeBudgets = budgets.filter(b => b.isActive && new Date() >= b.startDate && new Date() <= b.endDate)

  const budgetSummary: BudgetSummary = {
    totalBudgets: budgets.length,
    activeBudgets: activeBudgets.length,
    totalBudgetAmount: budgets.reduce((sum, b) => sum + b.amount, 0),
    totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
    utilizationRate: budgets.length > 0 ? (budgets.reduce((sum, b) => sum + b.spent, 0) / budgets.reduce((sum, b) => sum + b.amount, 0)) * 100 : 0,
  }

  // Get Loans Summary
  const loans = await db.loan.findMany({
    where: { userId },
    select: {
      totalAmount: true,
      paidAmount: true,
      overdue: true,
      status: true,
      dueDate: true,
    },
  })

  const activeLoans = loans.filter(l => l.status === 'active')
  const overdueLoans = loans.filter(l => l.overdue)

  const loanSummary: LoanSummary = {
    totalLoans: loans.length,
    activeLoans: activeLoans.length,
    totalLoanAmount: loans.reduce((sum, l) => sum + l.totalAmount, 0),
    totalPaidAmount: loans.reduce((sum, l) => sum + l.paidAmount, 0),
    overdueLoans: overdueLoans.length,
    outstandingAmount: loans.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0),
  }

  return {
    goals: goalSummary,
    budgets: budgetSummary,
    loans: loanSummary,
  }
}

export async function exportDashboardSummary(userId: string): Promise<string> {
  const summary = await getDashboardSummary(userId)
  
  const csvRows = [
    ['Dashboard Summary', '', '', ''],
    ['Generated', new Date().toISOString(), '', ''],
    ['', '', '', ''],
    ['Goals', '', '', ''],
    ['Total Goals', summary.goals.totalGoals, '', ''],
    ['Completed Goals', summary.goals.completedGoals, '', ''],
    ['Total Target Amount', summary.goals.totalTargetAmount, '', ''],
    ['Total Contributed', summary.goals.totalContributed, '', ''],
    ['Completion Rate (%)', summary.goals.completionRate.toFixed(2), '', ''],
    ['', '', '', ''],
    ['Budgets', '', '', ''],
    ['Total Budgets', summary.budgets.totalBudgets, '', ''],
    ['Active Budgets', summary.budgets.activeBudgets, '', ''],
    ['Total Budget Amount', summary.budgets.totalBudgetAmount, '', ''],
    ['Total Spent', summary.budgets.totalSpent, '', ''],
    ['Utilization Rate (%)', summary.budgets.utilizationRate.toFixed(2), '', ''],
    ['', '', '', ''],
    ['Loans', '', '', ''],
    ['Total Loans', summary.loans.totalLoans, '', ''],
    ['Active Loans', summary.loans.activeLoans, '', ''],
    ['Total Loan Amount', summary.loans.totalLoanAmount, '', ''],
    ['Total Paid Amount', summary.loans.totalPaidAmount, '', ''],
    ['Overdue Loans', summary.loans.overdueLoans, '', ''],
    ['Outstanding Amount', summary.loans.outstandingAmount, '', ''],
  ]

  return csvRows.map(row => row.join(',')).join('\n')
}
