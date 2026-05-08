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
import { getCreateUserSetting } from '@/lib/actions/user-setting'
import { GoalSchema } from '@/lib/schemas/goal'
import { GetFormatterForCurrency } from '@/lib/utils'

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

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => getCreateUserSetting(userId),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createGoal({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['goal-options'] })
      toast.success('Mục tiêu đã được tạo thành công!')
      form.reset()
    },
    onError: (error: Error) => {
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

  const formatter = GetFormatterForCurrency(userSettings?.currency || 'USD')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Quản lý Mục tiêu Tiết kiệm</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='border-b pb-6'>
            <h3 className='mb-4 text-lg font-medium'>Tạo Mục tiêu Mới</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên mục tiêu</FormLabel>
                        <FormControl>
                          <Input placeholder='Ví dụ: Mua xe hơi' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='targetAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền mục tiêu</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='10000'
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='priority'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ưu tiên</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn ưu tiên' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='high'>Cao</SelectItem>
                            <SelectItem value='medium'>Trung bình</SelectItem>
                            <SelectItem value='low'>Thấp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='targetDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày mục tiêu</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split('T')[0]
                                : field.value
                            }
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type='submit' className='w-full' disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo Mục tiêu'}
                </Button>
              </form>
            </Form>
          </div>

          <div>
            <h3 className='mb-4 text-lg font-medium'>Mục tiêu Hiện có</h3>
            {isLoading ? (
              <div className='py-8 text-center text-muted-foreground'>Đang tải...</div>
            ) : goals.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                <div className='mb-2 text-4xl'>🎯</div>
                <p>Chưa có mục tiêu nào</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {goals.map((goal: any) => (
                  <div key={goal.id} className='flex items-center justify-between rounded-lg border p-4'>
                    <div>
                      <h4 className='font-medium'>{goal.name}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {formatter.format(goal.contributed || 0)} /{' '}
                        {formatter.format(goal.targetAmount || 0)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs ${
                          goal.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : goal.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {goal.priority === 'high'
                          ? 'Cao'
                          : goal.priority === 'medium'
                            ? 'Trung bình'
                            : 'Thấp'}
                      </span>
                      {goal.isCompleted && <div className='mt-1 text-sm text-green-600'>✓ Hoàn thành</div>}
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
