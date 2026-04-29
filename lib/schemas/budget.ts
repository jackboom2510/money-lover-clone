import { z } from 'zod'

export const BudgetSchema = z.object({
  name: z.string().min(1, 'Tên ngân sách là bắt buộc'),
  amount: z.number().min(1, 'Số tiền ngân sách phải lớn hơn 0'),
  category: z.enum(['general', 'food', 'transport', 'entertainment', 'shopping', 'health', 'other']).default('general'),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().optional(),
})

export type BudgetSchemaType = z.infer<typeof BudgetSchema>
