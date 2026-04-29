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
import { createGoal, getGoals } from '@/lib/actions/goal'
import { GoalSchema } from '@/lib/schemas/goal'

interface Props {
  trigger: ReactNode
  userId: string
}

function GoalManagementDialog({ trigger, userId }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', userId],
    queryFn: () => getGoals(userId),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createGoal({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
      toast.success('Mục tiêu đã được tạo thành công!')
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể tạo mục tiêu')
    },
  })

  const form = useForm({
    resolver: zodResolver(GoalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      priority: 'medium',
      targetDate: new Date(),
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
          <DialogTitle>Quản lý Mục tiêu Tiết kiệm</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Goal Form */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Tạo Mục tiêu Mới</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên mục tiêu</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Mua xe hơi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền mục tiêu ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ưu tiên</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn ưu tiên" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">Cao</SelectItem>
                            <SelectItem value="medium">Trung bình</SelectItem>
                            <SelectItem value="low">Thấp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày mục tiêu</FormLabel>
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
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo Mục tiêu'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Existing Goals List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Mục tiêu Hiện có</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải...
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">🎯</div>
                <p>Chưa có mục tiêu nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal: any) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${goal.contributed?.toFixed(2) || 0} / ${goal.targetAmount?.toFixed(2) || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {goal.priority === 'high' ? 'Cao' : goal.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      {goal.isCompleted && (
                        <div className="text-green-600 text-sm mt-1">✓ Hoàn thành</div>
                      )}
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

export default GoalManagementDialog
