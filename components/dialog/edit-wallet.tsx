'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleOff, Loader2 } from 'lucide-react'
import React, { ReactNode, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet } from '@prisma/client'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { updateWallet } from '@/lib/actions/wallets'
import { UpdateWalletSchema, UpdateWalletSchemaType } from '@/lib/schemas/wallets'

interface Props {
  wallet: Wallet
  userId: string
  trigger: ReactNode
}

function EditWalletDialog({ wallet, userId, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const queryClient = useQueryClient()
  const router = useRouter()

  const form = useForm<UpdateWalletSchemaType>({
    resolver: zodResolver(UpdateWalletSchema),
    defaultValues: {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type as UpdateWalletSchemaType['type'],
      icon: wallet.icon,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: UpdateWalletSchemaType) => updateWallet(userId, values),
    onSuccess: async (updatedWallet) => {
      toast.success(`Wallet ${updatedWallet.name} updated successfully`, {
        id: `edit-wallet-${wallet.id}`,
      })

      await queryClient.invalidateQueries({
        queryKey: ['wallets'],
      })

      router.refresh()
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update wallet', {
        id: `edit-wallet-${wallet.id}`,
      })
    },
  })

  const onSubmit = useCallback(
    (values: UpdateWalletSchemaType) => {
      toast.loading('Updating wallet...', {
        id: `edit-wallet-${wallet.id}`,
      })
      mutate(values)
    },
    [mutate, wallet.id]
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      form.reset({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type as UpdateWalletSchemaType['type'],
        icon: wallet.icon,
      })
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit wallet</DialogTitle>
          <DialogDescription>Update your wallet details</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='My Wallet' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>This is how your wallet will appear in the app</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select wallet type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='cash'>Cash</SelectItem>
                      <SelectItem value='bank'>Bank Account</SelectItem>
                      <SelectItem value='e-wallet'>E-Wallet</SelectItem>
                      <SelectItem value='credit-card'>Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of wallet</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='icon'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' className='h-[100px] w-full'>
                          {form.watch('icon') ? (
                            <div className='flex flex-col items-center gap-2'>
                              <span className='text-5xl' role='img'>
                                {field.value}
                              </span>
                              <p className='text-xs text-muted-foreground'>Click to change</p>
                            </div>
                          ) : (
                            <div className='flex flex-col items-center gap-2'>
                              <CircleOff className='h-[48px] w-[48px]' />
                              <p className='text-xs text-muted-foreground'>Click to select</p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full'>
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) => {
                            field.onChange(emoji.native)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>Choose an icon for your wallet</FormDescription>
                </FormItem>
              )}
            />
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

export default EditWalletDialog
