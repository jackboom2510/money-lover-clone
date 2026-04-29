// loan.ts
'use server'

import { db } from '../db'
import { z } from 'zod'

const LoanSchema = z.object({
  userId: z.string(),
  name: z.string(),
  totalAmount: z.number(),
  description: z.string().optional(),
  dueDate: z.union([z.string(), z.date()]),
})

export async function createLoan(data: any) {
  const parsed = LoanSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  // Đảm bảo dueDate là kiểu Date
  const loanData = {
    ...parsed.data,
    dueDate: new Date(parsed.data.dueDate),
    userId: data.userId, // Ensure userId is included
    name: parsed.data.name || 'Untitled Loan', // Ensure name is provided
    totalAmount: parsed.data.totalAmount || 0, // Ensure totalAmount is provided
  }
  return db.loan.create({ data: loanData })
}

export async function getLoans(userId: string) {
  return db.loan.findMany({ where: { userId } })
}

export async function getLoanOverdue(loanId: string) {
  // Giả sử có trường overdue trong bảng loan
  return db.loan.findUnique({ where: { id: loanId }, select: { overdue: true } })
}
