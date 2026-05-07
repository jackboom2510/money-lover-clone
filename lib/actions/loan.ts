'use server'

import { db } from '../db'
import { LoanSchema, LoanSchemaType } from '../schemas/loan'

function computeLoanStatus(totalAmount: number, paidAmount: number, dueDate: Date) {
  const outstandingAmount = Math.max(totalAmount - paidAmount, 0)
  const overdue = dueDate < new Date() && outstandingAmount > 0

  if (outstandingAmount <= 0) {
    return {
      paidAmount: totalAmount,
      overdue: false,
      status: 'paid',
    }
  }

  return {
    paidAmount,
    overdue,
    status: overdue ? 'overdue' : 'active',
  }
}

export async function createLoan(data: LoanSchemaType & { userId: string }) {
  const parsed = LoanSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  const derived = computeLoanStatus(parsed.data.totalAmount, 0, parsed.data.dueDate)

  return db.loan.create({
    data: {
      userId: data.userId,
      name: parsed.data.name,
      totalAmount: parsed.data.totalAmount,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
      loanType: parsed.data.loanType,
      paidAmount: derived.paidAmount,
      overdue: derived.overdue,
      status: derived.status,
    },
  })
}

export async function getLoans(userId: string) {
  return db.loan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function syncLoanState(userId: string, loanId: string) {
  const loan = await db.loan.findFirst({
    where: {
      id: loanId,
      userId,
    },
    select: {
      id: true,
      totalAmount: true,
      dueDate: true,
    },
  })

  if (!loan) {
    throw new Error('Loan not found')
  }

  const paidAggregate = await db.transaction.aggregate({
    where: {
      userId,
      loanId,
      type: 'expense',
    },
    _sum: {
      amount: true,
    },
  })

  const paidAmount = paidAggregate._sum.amount || 0
  const derived = computeLoanStatus(loan.totalAmount, paidAmount, loan.dueDate)

  return db.loan.update({
    where: { id: loan.id },
    data: derived,
  })
}

export async function getLoanOverdue(userId: string, loanId: string) {
  const loan = await db.loan.findFirst({
    where: {
      id: loanId,
      userId,
    },
    select: {
      overdue: true,
    },
  })

  if (!loan) {
    throw new Error('Loan not found')
  }

  return loan
}
