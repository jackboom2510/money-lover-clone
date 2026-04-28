"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/budgets', label: 'Budgets', icon: '💰' },
  { href: '/loans', label: 'Loans', icon: '💳' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/reports', label: 'Reports', icon: '📊' },
  { href: '/transactions', label: 'Transactions', icon: '💸' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="h-full w-56 bg-card border-r flex flex-col p-4 gap-2">
      <div className="text-2xl font-bold mb-6">Money Lover</div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition font-medium ${pathname.startsWith(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  )
}
