"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Download, Target, PiggyBank, CreditCard } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getDashboardSummary, exportDashboardSummary } from '@/lib/services/summary.service'

interface SummaryCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SummaryCard({ title, icon, children }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function SummaryMetric({ label, value, color = "text-muted-foreground" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${color}`}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function DashboardSummary() {
  const { user } = useUser()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(user?.id || ''),
    enabled: !!user?.id,
  })

  const handleExportCSV = async () => {
    if (!user?.id) return
    
    try {
      const csv = await exportDashboardSummary(user.id)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-summary-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Goals Summary */}
        <SummaryCard
          title="Goals"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-2">
            <SummaryMetric 
              label="Total Goals" 
              value={summary.goals.totalGoals} 
            />
            <SummaryMetric 
              label="Completed" 
              value={`${summary.goals.completedGoals} (${summary.goals.completionRate.toFixed(1)}%)`}
              color={summary.goals.completionRate > 50 ? "text-green-600" : "text-orange-600"}
            />
            <SummaryMetric 
              label="Target Amount" 
              value={`$${summary.goals.totalTargetAmount.toFixed(2)}`} 
            />
            <SummaryMetric 
              label="Contributed" 
              value={`$${summary.goals.totalContributed.toFixed(2)}`} 
            />
          </div>
        </SummaryCard>

        {/* Budgets Summary */}
        <SummaryCard
          title="Budgets"
          icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-2">
            <SummaryMetric 
              label="Total Budgets" 
              value={summary.budgets.totalBudgets} 
            />
            <SummaryMetric 
              label="Active" 
              value={summary.budgets.activeBudgets} 
            />
            <SummaryMetric 
              label="Total Budget" 
              value={`$${summary.budgets.totalBudgetAmount.toFixed(2)}`} 
            />
            <SummaryMetric 
              label="Spent" 
              value={`$${summary.budgets.totalSpent.toFixed(2)}`}
              color={summary.budgets.utilizationRate > 80 ? "text-red-600" : "text-muted-foreground"}
            />
            <SummaryMetric 
              label="Utilization" 
              value={`${summary.budgets.utilizationRate.toFixed(1)}%`}
              color={summary.budgets.utilizationRate > 80 ? "text-red-600" : summary.budgets.utilizationRate > 60 ? "text-orange-600" : "text-green-600"}
            />
          </div>
        </SummaryCard>

        {/* Loans Summary */}
        <SummaryCard
          title="Loans"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-2">
            <SummaryMetric 
              label="Total Loans" 
              value={summary.loans.totalLoans} 
            />
            <SummaryMetric 
              label="Active" 
              value={summary.loans.activeLoans} 
            />
            <SummaryMetric 
              label="Total Amount" 
              value={`$${summary.loans.totalLoanAmount.toFixed(2)}`} 
            />
            <SummaryMetric 
              label="Paid" 
              value={`$${summary.loans.totalPaidAmount.toFixed(2)}`} 
            />
            <SummaryMetric 
              label="Outstanding" 
              value={`$${summary.loans.outstandingAmount.toFixed(2)}`}
              color={summary.loans.overdueLoans > 0 ? "text-red-600" : "text-muted-foreground"}
            />
            {summary.loans.overdueLoans > 0 && (
              <SummaryMetric 
                label="Overdue" 
                value={summary.loans.overdueLoans}
                color="text-red-600"
              />
            )}
          </div>
        </SummaryCard>
      </div>
    </div>
  )
}
