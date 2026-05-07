import { z } from 'zod'

export const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal('income'), z.literal('expense')]),
  walletId: z.string().min(1, 'Wallet is required'),
  budgetId: z.string().optional(),
  goalId: z.string().optional(),
  loanId: z.string().optional(),
})

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>

export const UpdateTransactionSchema = CreateTransactionSchema.extend({
  id: z.string().min(1, 'Transaction id is required'),
})

export type UpdateTransactionSchemaType = z.infer<typeof UpdateTransactionSchema>
