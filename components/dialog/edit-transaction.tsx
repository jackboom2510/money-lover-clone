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
import {
  UpdateTransactionSchema,
  UpdateTransactionSchemaType,
} from '@/lib/schemas/transactions'
import CategoryPicker from './category-picker'
import WalletPicker from './wallet-picker'
import { BudgetSelect, GoalSelect, LoanSelect } from '@/components/ui/entity-select'

interface TransactionRecord {
  id: string
  amount: number
  description: string
  date: string | Date
  category: string
  type: TransactionType
  walletId: string
  budget?: { id: string } | null
  goal?: { id: string } | null
  loan?: { id: string } | null
}

interface Props {
  transaction: TransactionRecord
  userId: string
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function EditTransactionDialog({ trigger, transaction, userId, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const form = useForm<UpdateTransactionSchemaType>({
    resolver: zodResolver(UpdateTransactionSchema),
    defaultValues: {
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date),
      category: transaction.category,
      type: transaction.type,
      walletId: transaction.walletId,
      budgetId: transaction.budget?.id || undefined,
      goalId: transaction.goal?.id || undefined,
      loanId: transaction.loan?.id || undefined,
    },
  })

  useEffect(() => {
    form.reset({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date),
      category: transaction.category,
      type: transaction.type,
      walletId: transaction.walletId,
      budgetId: transaction.budget?.id || undefined,
      goalId: transaction.goal?.id || undefined,
      loanId: transaction.loan?.id || undefined,
    })
  }, [form, transaction])

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

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: UpdateTransactionSchemaType) => {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Failed to update transaction')
      }

      return response.json()
    },
    onSuccess: async (_, values) => {
      toast.success('Transaction updated successfully', {
        id: `edit-transaction-${transaction.id}`,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['overview'] }),
        queryClient.invalidateQueries({ queryKey: ['overview', 'history'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet-balance'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['budget-options'] }),
        queryClient.invalidateQueries({ queryKey: ['goal-options'] }),
        queryClient.invalidateQueries({ queryKey: ['loan-options'] }),
      ])

      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update transaction', {
        id: `edit-transaction-${transaction.id}`,
      })
    },
  })

  const onSubmit = useCallback(
    (values: UpdateTransactionSchemaType) => {
      toast.loading('Updating transaction...', { id: `edit-transaction-${transaction.id}` })
      mutate({
        ...values,
        date: DateToUTCDateOnly(values.date),
      })
    },
    [mutate, transaction.id]
  )

  const transactionType = form.watch('type')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit{' '}
            <span className={cn('m-1', transactionType === 'income' ? 'text-emerald-500' : 'text-red-500')}>
              {transactionType}
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
                    <Input {...field} value={field.value ?? ''} />
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
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        type='button'
                        variant={field.value === 'income' ? 'default' : 'outline'}
                        onClick={() => field.onChange('income')}
                      >
                        Income
                      </Button>
                      <Button
                        type='button'
                        variant={field.value === 'expense' ? 'default' : 'outline'}
                        onClick={() => field.onChange('expense')}
                      >
                        Expense
                      </Button>
                    </div>
                  </FormControl>
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
                    <WalletPicker userId={userId} value={field.value} onChange={handleWalletChange} />
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
                      <CategoryPicker
                        userId={userId}
                        type={transactionType}
                        value={field.value}
                        onChange={handleCategoryChange}
                      />
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
                            variant='outline'
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

            <div className='space-y-4 border-t pt-4'>
              <h3 className='text-sm font-medium text-muted-foreground'>Link to Financial Entities (Optional)</h3>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='budgetId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Budget</FormLabel>
                      <FormControl>
                        <BudgetSelect
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          placeholder='Select a budget...'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='goalId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Goal</FormLabel>
                      <FormControl>
                        <GoalSelect
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          placeholder='Select a goal...'
                        />
                      </FormControl>
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
                          onValueChange={field.onChange}
                          placeholder='Select a loan...'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && 'Save changes'}
            {isPending && <Loader2 className='animate-spin' />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditTransactionDialog
