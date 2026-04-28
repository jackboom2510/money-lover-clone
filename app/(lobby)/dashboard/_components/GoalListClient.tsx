'use client'
import GoalList from '@/components/dialog/goal-list'

export default function GoalListClient({ userId }: { userId: string }) {
  return <GoalList userId={userId} />
}
