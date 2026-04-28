"use client"
import { useEffect, useState } from 'react'
import { getGoals, contributeToGoal } from '@/lib/actions/goal'
import CreateGoalForm from './create-goal'

export default function GoalList({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [contributeAmount, setContributeAmount] = useState<{ [id: string]: string }>({})
  const [contributeLoading, setContributeLoading] = useState<{ [id: string]: boolean }>({})
  const [contributeError, setContributeError] = useState<{ [id: string]: string }>({})

  async function reload() {
    setLoading(true)
    try {
      const res = await getGoals(userId)
      setGoals(res)
    } catch (e) {
      setGoals([])
    }
    setLoading(false)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function handleContribute(goalId: string) {
    setContributeLoading((prev) => ({ ...prev, [goalId]: true }))
    setContributeError((prev) => ({ ...prev, [goalId]: '' }))
    try {
      await contributeToGoal(goalId, parseFloat(contributeAmount[goalId] || '0'))
      setContributeAmount((prev) => ({ ...prev, [goalId]: '' }))
      reload()
    } catch (err: any) {
      setContributeError((prev) => ({ ...prev, [goalId]: err.message || 'Error' }))
    }
    setContributeLoading((prev) => ({ ...prev, [goalId]: false }))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Goals</h2>
      <CreateGoalForm userId={userId} onCreated={reload} />
      {loading ? (
        <div>Loading goals...</div>
      ) : !goals.length ? (
        <div>No goals found.</div>
      ) : (
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id} className="border rounded p-2">
              <div className="font-semibold">{g.name}</div>
              <div>Target: {g.targetAmount}</div>
              <div>Contributed: {g.contributed}</div>
              <div>Target Date: {new Date(g.targetDate).toLocaleDateString()}</div>
              <div>Description: {g.description || '---'}</div>
              <form
                className="flex gap-2 mt-2"
                onSubmit={e => {
                  e.preventDefault()
                  handleContribute(g.id)
                }}
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={contributeAmount[g.id] || ''}
                  onChange={e => setContributeAmount(prev => ({ ...prev, [g.id]: e.target.value }))}
                  placeholder="Contribute amount"
                  className="border rounded px-2 py-1 w-32"
                  required
                />
                <button
                  type="submit"
                  disabled={contributeLoading[g.id]}
                  className="bg-emerald-600 text-white px-3 py-1 rounded"
                >
                  {contributeLoading[g.id] ? 'Contributing...' : 'Contribute'}
                </button>
                {contributeError[g.id] && <span className="text-red-500 ml-2">{contributeError[g.id]}</span>}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
