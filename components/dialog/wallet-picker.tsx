'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Wallet } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import React, { useCallback, useEffect } from 'react'
import CreateWalletDialog from './create-wallet'
import { getWallets } from '@/lib/actions/wallets'

interface Props {
  onChange: (value: string) => void
  userId: string
  value?: string
}

function WalletPicker({ onChange, userId, value: controlledValue }: Props) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  useEffect(() => {
    if (controlledValue === undefined) return
    setValue(controlledValue)
  }, [controlledValue])

  useEffect(() => {
    if (!value) return
    onChange(value)
  }, [onChange, value])

  const walletsQuery = useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => getWallets(userId),
  })

  const selectedWallet = Array.isArray(walletsQuery.data)
    ? walletsQuery.data.find((wallet: Wallet) => wallet.id === value)
    : undefined

  const successCallback = useCallback(
    (wallet: Wallet) => {
      setValue(wallet.id)
      setOpen((prev) => !prev)
    },
    [setValue, setOpen]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {selectedWallet ? <WalletRow wallet={selectedWallet} /> : 'Select wallet'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <CommandInput placeholder='Search wallet...' />
          <CreateWalletDialog userId={userId} successCallback={successCallback} />
          <CommandEmpty>
            <p>Wallet not found</p>
            <p className='text-xs text-muted-foreground'>Tip: Create a new wallet</p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {walletsQuery.data &&
                walletsQuery.data.map((wallet: Wallet) => (
                  <CommandItem
                    key={wallet.id}
                    onSelect={() => {
                      setValue(wallet.id)
                      setOpen((prev) => !prev)
                    }}
                  >
                    <WalletRow wallet={wallet} />
                    <Check
                      className={cn('mr-2 w-4 h-4 opacity-0', value === wallet.id && 'opacity-100')}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default WalletPicker

function WalletRow({ wallet }: { wallet: Wallet }) {
  return (
    <div className='flex items-center gap-2'>
      <span role='img'>{wallet.icon}</span>
      <span>{wallet.name}</span>
    </div>
  )
}
