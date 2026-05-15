"use client"

import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCreateUserSetting } from '@/lib/actions/user-setting'
import { GetFormatterForCurrency } from '@/lib/utils'

interface BudgetSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  allowClear?: boolean
}

export function BudgetSelect({ value, onValueChange, placeholder, allowClear = false }: BudgetSelectProps) {
  const { user } = useUser()

  const { data: options, isLoading } = useQuery({
    queryKey: ['budget-options', user?.id],
    queryFn: () => fetch('/api/entities/budgets').then((res) => res.json()),
    enabled: !!user?.id,
  })

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: () => getCreateUserSetting(user!.id),
    enabled: !!user?.id,
  })

  const formatter = GetFormatterForCurrency(userSettings?.currency || 'USD')

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='Loading budgets...' />
        </SelectTrigger>
      </Select>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='No budgets available' />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || 'Link to budget...'} />
      </SelectTrigger>
      <SelectContent>
        {allowClear ? <SelectItem value='__none__'>No budget link</SelectItem> : null}
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name} ({formatter.format(option.spent || 0)}/{formatter.format(option.amount || 0)})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface GoalSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  allowClear?: boolean
}

export function GoalSelect({ value, onValueChange, placeholder, allowClear = false }: GoalSelectProps) {
  const { user } = useUser()

  const { data: options, isLoading } = useQuery({
    queryKey: ['goal-options', user?.id],
    queryFn: () => fetch('/api/entities/goals').then((res) => res.json()),
    enabled: !!user?.id,
  })

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: () => getCreateUserSetting(user!.id),
    enabled: !!user?.id,
  })

  const formatter = GetFormatterForCurrency(userSettings?.currency || 'USD')

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='Loading goals...' />
        </SelectTrigger>
      </Select>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='No goals available' />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || 'Link to goal...'} />
      </SelectTrigger>
      <SelectContent>
        {allowClear ? <SelectItem value='__none__'>No goal link</SelectItem> : null}
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name} ({formatter.format(option.contributed || 0)}/
            {formatter.format(option.targetAmount || 0)})
            {option.isCompleted && ' ✓'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface LoanSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  allowClear?: boolean
}

export function LoanSelect({ value, onValueChange, placeholder, allowClear = false }: LoanSelectProps) {
  const { user } = useUser()

  const { data: options, isLoading } = useQuery({
    queryKey: ['loan-options', user?.id],
    queryFn: () => fetch('/api/entities/loans').then((res) => res.json()),
    enabled: !!user?.id,
  })

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: () => getCreateUserSetting(user!.id),
    enabled: !!user?.id,
  })

  const formatter = GetFormatterForCurrency(userSettings?.currency || 'USD')

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='Loading loans...' />
        </SelectTrigger>
      </Select>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='No loans available' />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || 'Link to loan...'} />
      </SelectTrigger>
      <SelectContent>
        {allowClear ? <SelectItem value='__none__'>No loan link</SelectItem> : null}
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name} ({option.loanType}) - {formatter.format(option.paidAmount || 0)}/
            {formatter.format(option.totalAmount || 0)}
            {option.status && ` (${option.status})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
