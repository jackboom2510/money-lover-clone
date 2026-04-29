import { z } from 'zod'

export const LoanSchema = z.object({
  name: z.string().min(1, 'Tên khoản vay là bắt buộc'),
  totalAmount: z.number().min(1, 'Tổng số tiền vay phải lớn hơn 0'),
  loanType: z.enum(['auto', 'mortgage', 'personal', 'student', 'business', 'other']).default('personal'),
  dueDate: z.date().refine((date) => date > new Date(), {
    message: 'Ngày đáo hạn phải trong tương lai',
  }),
  description: z.string().optional(),
})

export type LoanSchemaType = z.infer<typeof LoanSchema>
