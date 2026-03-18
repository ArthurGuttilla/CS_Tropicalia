'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Building2, Plug, User, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/accounts', label: 'Contas', icon: Building2 },
  { href: '/alerts', label: 'Alertas', icon: Bell },
  { href: '/connectors', label: 'Conectores', icon: Plug },
]

const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY

function UserSection() {
  if (!clerkEnabled) {
    return (
      <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-xs text-slate-400">Demo mode</p>
      </div>
    )
  }

  // Lazy-load UserButton only when Clerk is configured
  const { UserButton } = require('@clerk/nextjs')
  return (
    <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
      <UserButton afterSignOutUrl="/sign-in" />
      <p className="text-xs text-slate-400">Minha conta</p>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">CS Tropicalia</p>
          <p className="text-xs text-slate-400">Customer Success AI</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <UserSection />
    </aside>
  )
}
