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
import { getBudgetOptions, getGoalOptions, getLoanOptions, BudgetOption, GoalOption, LoanOption } from '@/lib/services/entity.service'

interface BudgetSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export function BudgetSelect({ value, onValueChange, placeholder }: BudgetSelectProps) {
  const { user } = useUser()

  const { data: options, isLoading } = useQuery({
    queryKey: ['budget-options', user?.id],
    queryFn: () => fetch('/api/entities/budgets').then((res) => res.json()),
    enabled: !!user?.id,
  })

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading budgets..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No budgets available" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || "Link to budget..."} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name} (${option.spent?.toFixed(2) || 0}/${option.amount?.toFixed(2) || 0})
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
}

export function GoalSelect({ value, onValueChange, placeholder }: GoalSelectProps) {
  const { user } = useUser()

  const { data: options, isLoading } = useQuery({
    queryKey: ['goal-options', user?.id],
    queryFn: () => fetch('/api/entities/goals').then((res) => res.json()),
    enabled: !!user?.id,
  })

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading goals..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No goals available" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || "Link to goal..."} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name} (${option.contributed?.toFixed(2) || 0}/${option.targetAmount?.toFixed(2) || 0})
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
}

export function LoanSelect({ value, onValueChange, placeholder }: LoanSelectProps) {
  const { user } = useUser()

  const { data: options, isLoading } = useQuery({
    queryKey: ['loan-options', user?.id],
    queryFn: () => fetch('/api/entities/loans').then((res) => res.json()),
    enabled: !!user?.id,
  })

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading loans..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (!options || options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No loans available" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || "Link to loan..."} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: any) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name} ({option.loanType}) - ${option.paidAmount?.toFixed(2) || 0}/${option.totalAmount?.toFixed(2) || 0}
            {option.status && ` (${option.status})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
