import { z } from 'zod'

const OptionalEntityIdSchema = z.preprocess((value) => {
  if (value === '' || value === null) {
    return undefined
  }

  return value
}, z.string().min(1).optional())

const TransactionSchemaBase = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal('income'), z.literal('expense')]),
  walletId: z.string().min(1, 'Wallet is required'),
  budgetId: OptionalEntityIdSchema,
  goalId: OptionalEntityIdSchema,
  loanId: OptionalEntityIdSchema,
})

function applyTransactionBusinessRules<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data: z.infer<typeof TransactionSchemaBase>, ctx) => {
    if (data.type === 'income') {
      if (data.budgetId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['budgetId'],
          message: 'Income transactions cannot be linked to a budget',
        })
      }

      if (data.loanId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanId'],
          message: 'Income transactions cannot be linked to a loan',
        })
      }
    }

    if (data.type === 'expense') {
      if (data.goalId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['goalId'],
          message: 'Expense transactions cannot be linked to a goal',
        })
      }

      if (data.budgetId && data.loanId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['budgetId'],
          message: 'An expense transaction can be linked to either a budget or a loan, not both',
        })

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanId'],
          message: 'An expense transaction can be linked to either a budget or a loan, not both',
        })
      }
    }
  })
}

export const CreateTransactionSchema = applyTransactionBusinessRules(TransactionSchemaBase)

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>

export const UpdateTransactionSchema = applyTransactionBusinessRules(
  TransactionSchemaBase.extend({
    id: z.string().min(1, 'Transaction id is required'),
  })
)

export type UpdateTransactionSchemaType = z.infer<typeof UpdateTransactionSchema>
