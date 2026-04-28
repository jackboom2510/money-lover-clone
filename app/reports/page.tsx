import ReportSection from '@/components/dialog/report-section'
import { getCachedUser } from '@/lib/queries/user'

export default async function ReportsPage() {
  const user = await getCachedUser()
  if (!user) return <div className="p-8">Please sign in.</div>
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      {/* @ts-expect-error Async Server Component import Client Component */}
      <ReportSection userId={user.id} />
    </div>
  )
}
