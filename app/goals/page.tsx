import GoalList from '@/components/dialog/goal-list'
import { getCachedUser } from '@/lib/queries/user'

export default async function GoalsPage() {
  const user = await getCachedUser()
  if (!user) return <div className="p-8">Please sign in.</div>
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Goals</h1>
      <GoalList userId={user.id} />
    </div>
  )
}
