import React from 'react'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getCachedUser } from '@/lib/queries/user'
import { getUserSetting } from '@/lib/actions/user-setting'
import CreateTransactionDialog from '@/components/dialog/create-transaction'
import Overview from './_components/overview'
import History from './_components/history'

// Client component with SSR disabled for the budget, loan, goal, report, and checkBudget list
const BudgetListClient = dynamic(() => import('./_components/BudgetListClient'), { ssr: false })
const LoanListClient = dynamic(() => import('./_components/LoanListClient'), { ssr: false })
const GoalListClient = dynamic(() => import('./_components/GoalListClient'), { ssr: false })
const ReportSectionClient = dynamic(() => import('./_components/ReportSectionClient'), { ssr: false })
const CheckBudgetSectionClient = dynamic(() => import('./_components/CheckBudgetSectionClient'), { ssr: false })

async function DashboardPage() {
  const user = await getCachedUser()
  
  if (!user) {
    redirect('/signin')
  }

  const userSettings = await getUserSetting(user.id)
  
  if (!userSettings) {
    redirect('/wizard')
  }

  return (
    <div className='h-full bg-background'>
      {/* Header Section */}
      <div className='border-b bg-card'>
        <div className='container flex flex-wrap items-center justify-between gap-6 py-8'>
          <p className='text-3xl font-bold'>Hello, {user.firstName}! 👋</p>

          <div className='flex items-center gap-3'>
            <CreateTransactionDialog
              userId={user.id}
              type='income'
              trigger={
                <Button
                  variant={'outline'}
                  className='border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white'
                >
                  New income 🤑
                </Button>
              }
            />

            <CreateTransactionDialog
              userId={user.id}
              type='expense'
              trigger={
                <Button
                  variant={'outline'}
                  className='border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white'
                >
                  New expense 😤
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container flex flex-col gap-8 py-8'>












        {/* Check Budget Section */}
        <section>
          <h2 className='text-2xl font-bold mb-4'>Check Budget</h2>
          <div className='bg-card p-4 rounded-xl border mb-8'>
            <CheckBudgetSectionClient userId={user.id} />
          </div>
        </section>

        {/* Statistics & History */}
        <Overview userSettings={userSettings} />
        <History userSettings={userSettings} />
      </div>
    </div>
  )
}

export default DashboardPage