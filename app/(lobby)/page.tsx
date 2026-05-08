import { Shell } from '@/components/app-ui/shell'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import * as React from 'react'

export default function IndexPage() {
  return (
    <React.Suspense fallback={<h1>Loading...</h1>}>
      <Shell className='max-w-6xl'>
        <section className='mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 py-24 text-center md:py-32'>
          <h1
            className='animate-fade-up text-balance font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl'
            style={{ animationDelay: '0.10s', animationFillMode: 'both' }}
          >
            Track expenses & income with a clean modern dashboard
          </h1>
          <p
            className='max-w-2xl animate-fade-up text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8'
            style={{ animationDelay: '0.20s', animationFillMode: 'both' }}
          >
            Track income, control spending, and follow your budgets, goals, loans, and wallets in one place.
          </p>
          <div
            className='flex animate-fade-up flex-wrap items-center justify-center gap-4'
            style={{ animationDelay: '0.30s', animationFillMode: 'both' }}
          >
            <Button asChild>
              <Link href='/wizard'>
                Wirazd
                <span className='sr-only'>Wirazd</span>
              </Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/dashboard'>
                Dashboard
                <span className='sr-only'>Dashboard</span>
              </Link>
            </Button>
          </div>
        </section>
      </Shell>
    </React.Suspense>
  )
}
