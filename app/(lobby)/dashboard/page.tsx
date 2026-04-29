import React from 'react'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getCachedUser } from '@/lib/queries/user'
import { getUserSetting } from '@/lib/actions/user-setting'
import CreateTransactionDialog from '@/components/dialog/create-transaction'
import GoalManagementDialog from '@/components/dialog/goal-management-dialog'
import BudgetManagementDialog from '@/components/dialog/budget-management-dialog'
import LoanManagementDialog from '@/components/dialog/loan-management-dialog'
import Overview from './_components/overview'
import History from './_components/history'
import DashboardOverview from './_components/DashboardOverview'

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

        {/* Dashboard Overview */}
        <DashboardOverview />

        {/* Financial Overview Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          
          {/* Goals Section */}
          <section className='group relative bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden'>
            {/* Decorative Background Pattern */}
            <div className='absolute inset-0 opacity-5'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600'></div>
            </div>
            
            {/* Header */}
            <div className='relative p-8 border-b border-purple-100/50 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent'>
              <div className='flex justify-between items-start'>
                <div className='space-y-2'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 bg-purple-100/70 text-purple-700 text-xs font-medium rounded-full'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse'></div>
                    Mục tiêu Tiết kiệm
                  </div>
                  <h2 className='text-2xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent'>
                    Theo dõi tiến độ
                  </h2>
                  <p className='text-sm text-purple-600/80'>Xây dựng tương lai tài chính vững chắc</p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse'></div>
                  <div className='relative w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white text-xl'>🎯</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className='relative p-8'>
              <div className='text-center py-12 space-y-4'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-purple-500/10 rounded-full blur-2xl scale-150'></div>
                  <div className='relative text-6xl mb-4 animate-bounce'>🎯</div>
                </div>
                <div className='space-y-2'>
                  <p className='text-lg font-medium text-gray-700'>Bắt đầu hành trình tiết kiệm</p>
                  <p className='text-sm text-gray-500'>Tạo mục tiêu đầu tiên của bạn ngay hôm nay</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className='relative p-6 border-t border-purple-100/50 bg-gradient-to-r from-purple-50/50 to-transparent'>
              <GoalManagementDialog 
                userId={user.id}
                trigger={
                  <Button 
                    size='lg' 
                    className='w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105'
                  >
                    <span className='mr-2'>✨</span>
                    Quản lý Mục tiêu
                  </Button>
                }
              />
            </div>
          </section>

          {/* Budgets Section */}
          <section className='group relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden'>
            {/* Decorative Background Pattern */}
            <div className='absolute inset-0 opacity-5'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600'></div>
            </div>
            
            {/* Header */}
            <div className='relative p-8 border-b border-blue-100/50 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent'>
              <div className='flex justify-between items-start'>
                <div className='space-y-2'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100/70 text-blue-700 text-xs font-medium rounded-full'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                    Ngân sách
                  </div>
                  <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent'>
                    Kiểm soát chi tiêu
                  </h2>
                  <p className='text-sm text-blue-600/80'>Quản lý tài chính thông minh và hiệu quả</p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse'></div>
                  <div className='relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white text-xl'>💰</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className='relative p-8'>
              <div className='text-center py-12 space-y-4'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-blue-500/10 rounded-full blur-2xl scale-150'></div>
                  <div className='relative text-6xl mb-4 animate-bounce'>💰</div>
                </div>
                <div className='space-y-2'>
                  <p className='text-lg font-medium text-gray-700'>Lập kế hoạch ngân sách</p>
                  <p className='text-sm text-gray-500'>Bắt đầu quản lý chi tiêu của bạn</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className='relative p-6 border-t border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent'>
              <BudgetManagementDialog 
                userId={user.id}
                trigger={
                  <Button 
                    size='lg' 
                    className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105'
                  >
                    <span className='mr-2'>✨</span>
                    Quản lý Ngân sách
                  </Button>
                }
              />
            </div>
          </section>

          {/* Loans Section */}
          <section className='group relative bg-gradient-to-br from-white to-orange-50/30 rounded-2xl border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden'>
            {/* Decorative Background Pattern */}
            <div className='absolute inset-0 opacity-5'>
              <div className='absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600'></div>
            </div>
            
            {/* Header */}
            <div className='relative p-8 border-b border-orange-100/50 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent'>
              <div className='flex justify-between items-start'>
                <div className='space-y-2'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 bg-orange-100/70 text-orange-700 text-xs font-medium rounded-full'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full animate-pulse'></div>
                    Khoản vay
                  </div>
                  <h2 className='text-2xl font-bold bg-gradient-to-r from-orange-900 to-orange-700 bg-clip-text text-transparent'>
                    Theo dõi các khoản vay
                  </h2>
                  <p className='text-sm text-orange-600/80'>Quản lý và theo dõi các khoản vay của bạn</p>
                </div>
                <div className='relative'>
                  <div className='absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse'></div>
                  <div className='relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white text-xl'>🏦</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className='relative p-8'>
              <div className='text-center py-12 space-y-4'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-orange-500/10 rounded-full blur-2xl scale-150'></div>
                  <div className='relative text-6xl mb-4 animate-bounce'>🏦</div>
                </div>
                <div className='space-y-2'>
                  <p className='text-lg font-medium text-gray-700'>Quản lý khoản vay</p>
                  <p className='text-sm text-gray-500'>Theo dõi và quản lý các khoản vay</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className='relative p-6 border-t border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-transparent'>
              <LoanManagementDialog 
                userId={user.id}
                trigger={
                  <Button 
                    size='lg' 
                    className='w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105'
                  >
                    <span className='mr-2'>✨</span>
                    Quản lý Khoản vay
                  </Button>
                }
              />
            </div>
          </section>

        </div>

        {/* Statistics & History */}
        <Overview userSettings={userSettings} />
        <History userSettings={userSettings} />
      </div>
    </div>
  )
}

export default DashboardPage