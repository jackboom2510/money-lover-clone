// report.ts
'use server'

import { db } from '../db'
import { parse } from 'json2csv'

export async function getReportSummary(userId: string) {
  // Tổng hợp thu/chi
  const income = await db.transaction.aggregate({
    where: { userId, type: 'income' },
    _sum: { amount: true },
  })
  const expense = await db.transaction.aggregate({
    where: { userId, type: 'expense' },
    _sum: { amount: true },
  })
  return { income: income._sum.amount || 0, expense: expense._sum.amount || 0 }
}

export async function getReportByCategory(userId: string) {
  return db.transaction.groupBy({
    by: ['category'],
    where: { userId },
    _sum: { amount: true },
  })
}

export async function getReportByMonth(userId: string) {
  return db.transaction.groupBy({
    by: ['month'],
    where: { userId },
    _sum: { amount: true },
  })
}

export async function exportBackup(userId: string) {
  const transactions = await db.transaction.findMany({ where: { userId } })
  return parse(transactions)
}
