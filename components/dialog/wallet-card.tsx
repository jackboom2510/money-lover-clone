'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Wallet } from '@prisma/client'
import { Pencil, Trash2 } from 'lucide-react'
import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteWallet, getWalletBalance } from '@/lib/actions/wallets'
import { GetFormatterForCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import EditWalletDialog from './edit-wallet'

interface Props {
  wallet: Wallet
  userId: string
}

export function WalletCard({ wallet, userId }: Props) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const balanceQuery = useQuery({
    queryKey: ['wallet-balance', wallet.id],
    queryFn: () => getWalletBalance(wallet.id, userId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteWallet(userId, wallet.id),
    onSuccess: async () => {
      toast.success('Wallet deleted successfully', {
        id: 'delete-wallet',
      })
      await queryClient.invalidateQueries({
        queryKey: ['wallets'],
      })

      queryClient.removeQueries({
        queryKey: ['wallet-balance', wallet.id],
      })

      router.refresh()
    },
    onError: () => {
      toast.error('Failed to delete wallet', {
        id: 'delete-wallet',
      })
    },
  })

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${wallet.name}"? All transactions in this wallet will be deleted.`)) {
      toast.loading('Deleting wallet...', {
        id: 'delete-wallet',
      })
      deleteMutation.mutate()
    }
  }

  const formatter = GetFormatterForCurrency(wallet.currency)
  const balance = balanceQuery.data?.balance || 0

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl' role='img'>
            {wallet.icon}
          </span>
          <div>
            <h3 className='font-semibold'>{wallet.name}</h3>
            <p className='text-xs text-muted-foreground capitalize'>{wallet.type.replace('-', ' ')}</p>
          </div>
        </div>
        <div className='flex gap-1'>
          <EditWalletDialog
            wallet={wallet}
            userId={userId}
            trigger={
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <Pencil className='h-4 w-4' />
              </Button>
            }
          />
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-destructive'
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{formatter.format(balance)}</div>
        <p className='text-xs text-muted-foreground'>Current balance</p>
      </CardContent>
    </Card>
  )
}
