'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DateToUTCDateOnly, cn } from '@/lib/utils'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { TransactionType } from '@/types'
import { CreateTransactionSchema, CreateTransactionSchemaType } from '@/lib/schemas/transactions'
import CategoryPicker from './category-picker'
import WalletPicker from './wallet-picker'
import { createTransaction } from '@/lib/actions/transactions'
import { BudgetSelect, GoalSelect, LoanSelect } from '@/components/ui/entity-select'

interface Props {
  trigger: ReactNode
  type: TransactionType
  userId: string
}

function CreateTransactionDialog({ trigger, type, userId }: Props) {
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
      budgetId: undefined,
      goalId: undefined,
      loanId: undefined,
    },
  })
  const [open, setOpen] = useState(false)
  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue('category', value)
    },
    [form]
  )

  const handleWalletChange = useCallback(
    (value: string) => {
      form.setValue('walletId', value)
    },
    [form]
  )

  const queryClient = useQueryClient()
  const transactionType = form.watch('type')
  const selectedBudgetId = form.watch('budgetId')
  const selectedLoanId = form.watch('loanId')

  useEffect(() => {
    if (transactionType === 'income') {
      form.setValue('budgetId', undefined, { shouldValidate: true })
      form.setValue('loanId', undefined, { shouldValidate: true })
    }

    if (transactionType === 'expense') {
      form.setValue('goalId', undefined, { shouldValidate: true })
    }
  }, [form, transactionType])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CreateTransactionSchemaType) => createTransaction(userId, values),
    onSuccess: async (_, values) => {
      toast.success('Transaction created successfully 🎉', {
        id: 'create-transaction',
      })

      form.reset({
        type,
        description: '',
        amount: 0,
        date: new Date(),
        category: undefined,
        walletId: undefined,
        budgetId: undefined,
        goalId: undefined,
        loanId: undefined,
      })

      // After creating a transaction, we need to invalidate the overview query which will refetch data in the homepage
      await queryClient.invalidateQueries({
        queryKey: ['overview'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['overview', 'history'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['dashboard-summary'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['transactions'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['wallet-balance', values.walletId],
      })

      setOpen((prev) => !prev)
    },
  })

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading('Creating transaction...', { id: 'create-transaction' })

      mutate({
        ...values,
        date: DateToUTCDateOnly(values.date),
      })
    },
    [mutate]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new{' '}
            <span className={cn('m-1', type === 'income' ? 'text-emerald-500' : 'text-red-500')}>
              {type}
            </span>
            transaction
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input defaultValue={''} {...field} />
                  </FormControl>
                  <FormDescription>Transaction description (optional)</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={0}
                      type='number'
                      inputMode='decimal'
                      min='0'
                      step='0.01'
                      className='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Transaction amount (required)</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='walletId'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Wallet</FormLabel>
                  <FormControl>
                    <WalletPicker userId={userId} onChange={handleWalletChange} />
                  </FormControl>
                  <FormDescription>Select which wallet this transaction belongs to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center justify-between gap-2'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategoryPicker userId={userId} type={type} onChange={handleCategoryChange} />
                    </FormControl>
                    <FormDescription>Select a category for this transaction</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Transaction date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[200px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={(value) => {
                            if (!value) return
                            field.onChange(value)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Select a date for this</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Entity Linking Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Link to Financial Entities (Optional)</h3>
              <p className="text-xs text-muted-foreground">
                Income transactions can only link to goals. Expense transactions can link to either a budget or a loan.
              </p>

              {transactionType === 'income' ? (
                <FormField
                  control={form.control}
                  name='goalId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Goal</FormLabel>
                      <FormControl>
                        <GoalSelect
                          value={field.value || ''}
                          onValueChange={(value) => field.onChange(value === '__none__' ? undefined : value)}
                          placeholder="Select a goal..."
                          allowClear
                        />
                      </FormControl>
                      <FormDescription>Use income transactions to contribute toward a financial goal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name='budgetId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link to Budget</FormLabel>
                        <FormControl>
                          <BudgetSelect
                            value={field.value || ''}
                            onValueChange={(value) => {
                              const nextValue = value === '__none__' ? undefined : value
                              field.onChange(nextValue)
                              form.setValue('loanId', undefined, { shouldValidate: true })
                            }}
                            placeholder="Select a budget..."
                            allowClear
                          />
                        </FormControl>
                        <FormDescription>Use this for regular expense tracking against a budget</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='loanId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link to Loan</FormLabel>
                        <FormControl>
                          <LoanSelect
                            value={field.value || ''}
                            onValueChange={(value) => {
                              const nextValue = value === '__none__' ? undefined : value
                              field.onChange(nextValue)
                              form.setValue('budgetId', undefined, { shouldValidate: true })
                            }}
                            placeholder="Select a loan..."
                            allowClear
                          />
                        </FormControl>
                        <FormDescription>Use this for repayment transactions instead of budget tracking</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {transactionType === 'expense' && (selectedBudgetId || selectedLoanId) ? (
                <p className="text-xs text-muted-foreground">
                  Selecting one expense link clears the other to keep the transaction semantically consistent.
                </p>
              ) : null}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              variant={'secondary'}
              onClick={() => {
                form.reset()
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && 'Create'}
            {isPending && <Loader2 className='animate-spin' />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTransactionDialog
