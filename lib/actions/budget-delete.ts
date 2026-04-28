'use server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteBudget(budgetId: string) {
  await db.budget.delete({ where: { id: budgetId } })
  revalidatePath('/(lobby)/dashboard')
}
