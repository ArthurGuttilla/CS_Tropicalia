'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Bell, Building2, Home, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'

const navItems = [
  { href: '/accounts', label: 'Contas', icon: Building2 },
  { href: '/alerts', label: 'Alertas', icon: Bell },
]

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

      {/* User */}
      <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Minha conta</p>
        </div>
      </div>
    </aside>
  )
}
