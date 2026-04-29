import BudgetList from '@/components/dialog/budget-list'
import { getCachedUser } from '@/lib/queries/user'

export default async function BudgetsPage() {
  const user = await getCachedUser()
  if (!user) return <div className="p-8">Please sign in.</div>
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Budgets</h1>
      <BudgetList userId={user.id} />
    </div>
  )
}
