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
import { CircleOff, Loader2, PlusSquare } from 'lucide-react'
import React, { ReactNode, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet } from '@prisma/client'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { createWallet } from '@/lib/actions/wallets'
import { getCreateUserSetting } from '@/lib/actions/user-setting'
import { CreateWalletSchema, CreateWalletSchemaType } from '@/lib/schemas/wallets'

interface Props {
  successCallback?: (wallet: Wallet) => void
  trigger?: ReactNode
  userId: string
}

function CreateWalletDialog({ successCallback, trigger, userId }: Props) {
  const [open, setOpen] = useState(false)
  const form = useForm<CreateWalletSchemaType>({
    resolver: zodResolver(CreateWalletSchema),
    defaultValues: {
      type: 'cash',
      currency: 'USD',
      icon: '💰',
    },
  })

  const queryClient = useQueryClient()
  const theme = useTheme()
  const router = useRouter()
  const userSettings = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => getCreateUserSetting(userId),
  })

  React.useEffect(() => {
    if (!userSettings.data?.currency) return
    form.setValue('currency', userSettings.data.currency)
  }, [form, userSettings.data?.currency])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CreateWalletSchemaType) => createWallet(userId, values),
    onSuccess: async (data: Wallet) => {
      form.reset({
        name: '',
        type: 'cash',
        currency: userSettings.data?.currency ?? 'USD',
        icon: '💰',
      })

      toast.success(`Wallet ${data.name} created successfully 🎉`, {
        id: 'create-wallet',
      })

      if (successCallback) {
        successCallback(data)
      }

      await queryClient.invalidateQueries({
        queryKey: ['wallets'],
      })

      router.refresh()

      setOpen((prev) => !prev)
    },
    onError: () => {
      toast.error('Something went wrong', {
        id: 'create-wallet',
      })
    },
  })

  const onSubmit = useCallback(
    (values: CreateWalletSchemaType) => {
      toast.loading('Creating wallet...', {
        id: 'create-wallet',
      })
      mutate(values)
    },
    [mutate]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={'ghost'}
            className='flex border-separate items-center justify-start roudned-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className='mr-2 h-4 w-4' />
            Create new wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new wallet</DialogTitle>
          <DialogDescription>Wallets help you organize your money</DialogDescription>
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
                    <Input placeholder='My Wallet' {...field} />
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
                        <Button variant={'outline'} className='h-[100px] w-full'>
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

export default CreateWalletDialog
