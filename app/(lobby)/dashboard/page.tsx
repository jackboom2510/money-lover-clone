import React from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getCachedUser } from '@/lib/queries/user'
import { getUserSetting } from '@/lib/actions/user-setting'
import CreateTransactionDialog from '@/components/dialog/create-transaction'
import Overview from './_components/overview'
import History from './_components/history'
import DashboardOverview from './_components/DashboardOverview'

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
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <p className="text-3xl font-bold">Hello, {user.firstName}! 👋</p>

          <div className="flex items-center gap-3">
            <CreateTransactionDialog
              userId={user.id}
              type="income"
              trigger={
                <Button
                  variant="outline"
                  className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
                >
                  New income 🤑
                </Button>
              }
            />

            <CreateTransactionDialog
              userId={user.id}
              type="expense"
              trigger={
                <Button
                  variant="outline"
                  className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
                >
                  New expense 😤
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <div className="container flex flex-col gap-8 py-8">
        <DashboardOverview />
        <Overview userSettings={userSettings} />
        <History userSettings={userSettings} />
      </div>
    </div>
  )
}

export default DashboardPage
