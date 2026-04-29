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
import { createLoan, getLoans } from '@/lib/actions/loan'
import { LoanSchema } from '@/lib/schemas/loan'

interface Props {
  trigger: ReactNode
  userId: string
}

function LoanManagementDialog({ trigger, userId }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', userId],
    queryFn: () => getLoans(userId),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createLoan({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans', userId] })
      toast.success('Khoản vay đã được tạo thành công!')
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể tạo khoản vay')
    },
  })

  const form = useForm({
    resolver: zodResolver(LoanSchema),
    defaultValues: {
      name: '',
      totalAmount: 0,
      loanType: 'personal',
      dueDate: new Date(),
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
          <DialogTitle>Quản lý Khoản vay</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Loan Form */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Tạo Khoản vay Mới</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên khoản vay</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Vay mua xe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tổng số tiền vay ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25000" 
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
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại khoản vay</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại vay" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="auto">Vay mua ô tô</SelectItem>
                            <SelectItem value="mortgage">Vay mua nhà</SelectItem>
                            <SelectItem value="personal">Vay cá nhân</SelectItem>
                            <SelectItem value="student">Vay học sinh</SelectItem>
                            <SelectItem value="business">Vay kinh doanh</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày đáo hạn</FormLabel>
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
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo Khoản vay'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Existing Loans List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Khoản vay Hiện có</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải...
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">🏦</div>
                <p>Chưa có khoản vay nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loans.map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{loan.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${loan.paidAmount?.toFixed(2) || 0} / ${loan.totalAmount?.toFixed(2) || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        loan.status === 'active' ? 'bg-green-100 text-green-800' :
                        loan.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        loan.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {loan.status === 'active' ? 'Đang trả' :
                         loan.status === 'overdue' ? 'Quá hạn' :
                         loan.status === 'paid' ? 'Đã trả' : 'Không xác định'}
                      </span>
                      <div className="text-sm text-muted-foreground mt-1">
                        {loan.loanType}
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

export default LoanManagementDialog
