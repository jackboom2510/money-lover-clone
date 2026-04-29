'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createBudget, getBudgets } from '@/lib/actions/budget'
import { BudgetSchema } from '@/lib/schemas/budget'

interface Props {
  trigger: ReactNode
  userId: string
}

function BudgetManagementDialog({ trigger, userId }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', userId],
    queryFn: () => getBudgets(userId),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createBudget({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', userId] })
      toast.success('Ngân sách đã được tạo thành công!')
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể tạo ngân sách')
    },
  })

  const form = useForm({
    resolver: zodResolver(BudgetSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category: 'general',
      startDate: new Date(),
      endDate: new Date(),
    },
  })

  const onSubmit = (data: any) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý Ngân sách</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Budget Form */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Tạo Ngân sách Mới</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên ngân sách</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Ngân sách tháng 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền ngân sách ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại ngân sách</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">Chung</SelectItem>
                            <SelectItem value="food">Ăn uống</SelectItem>
                            <SelectItem value="transport">Di chuyển</SelectItem>
                            <SelectItem value="entertainment">Giải trí</SelectItem>
                            <SelectItem value="shopping">Mua sắm</SelectItem>
                            <SelectItem value="health">Sức khỏe</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo Ngân sách'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Existing Budgets List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Ngân sách Hiện có</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải...
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">💰</div>
                <p>Chưa có ngân sách nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {budgets.map((budget: any) => (
                  <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{budget.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${budget.spent?.toFixed(2) || 0} / ${budget.amount?.toFixed(2) || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        budget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {budget.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                      <div className="text-sm text-muted-foreground mt-1">
                        {budget.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BudgetManagementDialog
