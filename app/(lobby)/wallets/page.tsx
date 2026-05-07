import { Button } from '@/components/ui/button'
import { getCachedUser } from '@/lib/queries/user'
import { redirect } from 'next/navigation'
import React from 'react'
import { getWallets } from '@/lib/actions/wallets'
import CreateWalletDialog from '@/components/dialog/create-wallet'
import { WalletCard } from '@/components/dialog/wallet-card'
import { PlusSquare } from 'lucide-react'

async function WalletsPage() {
  const user = await getCachedUser()
  if (!user) {
    redirect('/signin')
  }

  const wallets = await getWallets(user.id)

  return (
    <>
      {/* HEADER */}
      <div className='border-b bg-card'>
        <div className='container flex flex-wrap items-center justify-between gap-6 py-8'>
          <div>
            <p className='text-3xl font-bold'>Wallets</p>
            <p className='text-muted-foreground'>Manage your wallets and track balances</p>
          </div>
          <CreateWalletDialog
            userId={user.id}
            trigger={
              <Button className='gap-2 text-sm'>
                <PlusSquare className='h-4 w-4' />
                Create wallet
              </Button>
            }
          />
        </div>
      </div>
      {/* END HEADER */}
      <div className='container flex flex-col gap-4 p-4'>
        {wallets.length === 0 ? (
          <div className='flex h-[400px] flex-col items-center justify-center gap-4'>
            <p className='text-lg text-muted-foreground'>No wallets yet</p>
            <p className='text-sm text-muted-foreground'>Create your first wallet to get started</p>
            <CreateWalletDialog
              userId={user.id}
              trigger={
                <Button>
                  <PlusSquare className='mr-2 h-4 w-4' />
                  Create wallet
                </Button>
              }
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} userId={user.id} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default WalletsPage
