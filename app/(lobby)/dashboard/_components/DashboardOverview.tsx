"use client"

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Target, PiggyBank, CreditCard, Plus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface SummaryCardProps {
  badge: string
  titleText: string
  description: string
  icon: React.ReactNode
  accentClasses: {
    shell: string
    border: string
    badge: string
    title: string
    bodyGlow: string
    cta: string
  }
  metrics: Array<{
    label: string
    value: string | number
    color?: string
  }>
  href: string
  actionLabel: string
}

function SummaryMetric({
  label,
  value,
  color = 'text-slate-600',
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl bg-white/70 px-4 py-3 backdrop-blur-sm">
      <span className={`text-sm ${color}`}>{label}</span>
      <span className="shrink-0 text-right text-xl font-semibold tracking-tight text-slate-950">
        {value}
      </span>
    </div>
  )
}

function SummaryCard({
  badge,
  titleText,
  description,
  icon,
  accentClasses,
  metrics,
  href,
  actionLabel,
}: SummaryCardProps) {
  return (
    <section
      className={`group relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accentClasses.shell} ${accentClasses.border}`}
    >
      <div className="absolute inset-0 opacity-40">
        <div className={`absolute inset-0 blur-3xl ${accentClasses.bodyGlow}`}></div>
      </div>

      <div className="relative flex h-full flex-col">
        <div className="border-b border-white/40 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${accentClasses.badge}`}>
                <span className="h-2 w-2 rounded-full bg-current opacity-70"></span>
                {badge}
              </div>
              <div className="space-y-2">
                <h2 className={`text-3xl font-bold tracking-tight ${accentClasses.title}`}>{titleText}</h2>
                <p className="text-sm text-slate-600">{description}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/85 p-4 shadow-md backdrop-blur-sm">
              {icon}
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="grid gap-3">
            {metrics.map((metric) => (
              <SummaryMetric
                key={metric.label}
                label={metric.label}
                value={metric.value}
                color={metric.color}
              />
            ))}
          </div>

          <div className="mt-auto">
            <Link href={href}>
              <Button size="lg" className={`h-11 w-full border-0 text-white shadow-lg ${accentClasses.cta}`}>
                <Plus className="mr-2 h-4 w-4" />
                {actionLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-lg">
      <div className="border-b px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-14 w-14 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3 px-6 py-6">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-14 w-full rounded-xl" />
        ))}
        <Skeleton className="mt-6 h-11 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function DashboardOverview() {
  const { user } = useUser()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/summary')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary')
      }
      return response.json()
    },
    enabled: !!user?.id,
  })

  const handleExportCSV = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/dashboard/summary', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to export dashboard summary')
      }
      const csv = await response.text()
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
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            <p className="text-muted-foreground">Track your goals, budgets, and loans</p>
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <LoadingCard key={item} />
          ))}
        </div>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Overview</h2>
          <p className="text-muted-foreground">Track your goals, budgets, and loans</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="self-start sm:self-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SummaryCard
          badge="Mục tiêu Tiết kiệm"
          titleText="Theo dõi tiến độ"
          description="Xây dựng tương lai tài chính vững chắc"
          icon={<Target className="h-6 w-6 text-purple-700" />}
          accentClasses={{
            shell: 'bg-gradient-to-br from-white to-purple-50/80',
            border: 'border-purple-100/70',
            badge: 'bg-purple-100/80 text-purple-700',
            title: 'text-purple-900',
            bodyGlow: 'bg-purple-300/30',
            cta: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
          }}
          metrics={[
            { label: 'Total Goals', value: summary.goals.totalGoals },
            {
              label: 'Completed',
              value: `${summary.goals.completedGoals} (${summary.goals.completionRate.toFixed(1)}%)`,
              color: summary.goals.completionRate > 50 ? 'text-green-600' : 'text-orange-600',
            },
            { label: 'Target Amount', value: `$${summary.goals.totalTargetAmount.toFixed(2)}` },
            { label: 'Contributed', value: `$${summary.goals.totalContributed.toFixed(2)}` },
          ]}
          href="/goals"
          actionLabel="Quản lý Mục tiêu"
        />

        <SummaryCard
          badge="Ngân sách"
          titleText="Kiểm soát chi tiêu"
          description="Quản lý tài chính thông minh và hiệu quả"
          icon={<PiggyBank className="h-6 w-6 text-blue-700" />}
          accentClasses={{
            shell: 'bg-gradient-to-br from-white to-blue-50/80',
            border: 'border-blue-100/70',
            badge: 'bg-blue-100/80 text-blue-700',
            title: 'text-blue-900',
            bodyGlow: 'bg-blue-300/30',
            cta: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
          }}
          metrics={[
            { label: 'Total Budgets', value: summary.budgets.totalBudgets },
            { label: 'Active', value: summary.budgets.activeBudgets },
            { label: 'Total Budget', value: `$${summary.budgets.totalBudgetAmount.toFixed(2)}` },
            { label: 'Spent', value: `$${summary.budgets.totalSpent.toFixed(2)}` },
            {
              label: 'Utilization',
              value: `${summary.budgets.utilizationRate.toFixed(1)}%`,
              color:
                summary.budgets.utilizationRate > 80
                  ? 'text-red-600'
                  : summary.budgets.utilizationRate > 60
                    ? 'text-orange-600'
                    : 'text-green-600',
            },
          ]}
          href="/budgets"
          actionLabel="Quản lý Ngân sách"
        />

        <SummaryCard
          badge="Khoản vay"
          titleText="Theo dõi các khoản vay"
          description="Quản lý và theo dõi các khoản vay của bạn"
          icon={<CreditCard className="h-6 w-6 text-orange-700" />}
          accentClasses={{
            shell: 'bg-gradient-to-br from-white to-orange-50/80',
            border: 'border-orange-100/70',
            badge: 'bg-orange-100/80 text-orange-700',
            title: 'text-orange-900',
            bodyGlow: 'bg-orange-300/30',
            cta: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
          }}
          metrics={[
            { label: 'Total Loans', value: summary.loans.totalLoans },
            { label: 'Active', value: summary.loans.activeLoans },
            { label: 'Total Amount', value: `$${summary.loans.totalLoanAmount.toFixed(2)}` },
            { label: 'Paid', value: `$${summary.loans.totalPaidAmount.toFixed(2)}` },
            {
              label: 'Outstanding',
              value: `$${summary.loans.outstandingAmount.toFixed(2)}`,
              color: summary.loans.overdueLoans > 0 ? 'text-red-600' : 'text-slate-600',
            },
          ]}
          href="/loans"
          actionLabel="Quản lý Khoản vay"
        />
      </div>
    </div>
  )
}
