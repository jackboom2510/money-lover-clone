'use server'

import { db } from '../db'
import {
  CreateWalletSchema,
  CreateWalletSchemaType,
  UpdateWalletSchema,
  UpdateWalletSchemaType,
  DeleteWalletSchema,
  DeleteWalletSchemaType,
} from '../schemas/wallets'

export async function createWallet(userId: string, form: CreateWalletSchemaType) {
  const parsedBody = CreateWalletSchema.safeParse(form)
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message)
  }

  const { name, type, currency, icon } = parsedBody.data

  return await db.wallet.create({
    data: {
      userId,
      name,
      type,
      currency,
      icon,
    },
  })
}

export async function getWallets(userId: string) {
  return await db.wallet.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

export async function getWalletById(walletId: string, userId: string) {
  return await db.wallet.findUnique({
    where: {
      id: walletId,
      userId,
    },
  })
}

export async function updateWallet(userId: string, form: UpdateWalletSchemaType) {
  const parsedBody = UpdateWalletSchema.safeParse(form)
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message)
  }

  const { id, name, type, icon } = parsedBody.data

  const wallet = await db.wallet.findUnique({
    where: {
      id,
      userId,
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  return await db.wallet.update({
    where: {
      id,
      userId,
    },
    data: {
      ...(name && { name }),
      ...(type && { type }),
      ...(icon && { icon }),
    },
  })
}

export async function deleteWallet(userId: string, walletId: string) {
  const wallet = await db.wallet.findUnique({
    where: {
      id: walletId,
      userId,
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  return await db.wallet.delete({
    where: {
      id: walletId,
      userId,
    },
  })
}

export async function getWalletBalance(walletId: string, userId: string) {
  const wallet = await db.wallet.findUnique({
    where: {
      id: walletId,
      userId,
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  const totals = await db.transaction.groupBy({
    by: ['type'],
    where: {
      walletId,
      userId,
    },
    _sum: {
      amount: true,
    },
  })

  const income = totals.find((t) => t.type === 'income')?._sum.amount || 0
  const expense = totals.find((t) => t.type === 'expense')?._sum.amount || 0
  const balance = income - expense

  return {
    walletId,
    income,
    expense,
    balance,
  }
}
