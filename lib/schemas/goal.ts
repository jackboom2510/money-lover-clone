import { z } from 'zod'

export const GoalSchema = z.object({
  name: z.string().min(1, 'Tên mục tiêu là bắt buộc'),
  targetAmount: z.number().min(1, 'Số tiền mục tiêu phải lớn hơn 0'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  targetDate: z.date().refine((date) => date > new Date(), {
    message: 'Ngày mục tiêu phải trong tương lai',
  }),
  description: z.string().optional(),
})

export type GoalSchemaType = z.infer<typeof GoalSchema>
