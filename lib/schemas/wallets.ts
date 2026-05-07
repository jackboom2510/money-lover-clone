import { z } from 'zod'

export const CreateWalletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['cash', 'bank', 'e-wallet', 'credit-card']),
  currency: z.string().default('USD'),
  icon: z.string().default('💰'),
})

export type CreateWalletSchemaType = z.infer<typeof CreateWalletSchema>

export const UpdateWalletSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  type: z.enum(['cash', 'bank', 'e-wallet', 'credit-card']).optional(),
  icon: z.string().optional(),
})

export type UpdateWalletSchemaType = z.infer<typeof UpdateWalletSchema>

export const DeleteWalletSchema = z.object({
  id: z.string(),
})

export type DeleteWalletSchemaType = z.infer<typeof DeleteWalletSchema>
