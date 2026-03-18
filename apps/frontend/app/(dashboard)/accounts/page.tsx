import { Building2, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { AccountCard } from '@/components/accounts/account-card'

async function getAccounts(searchParams: Record<string, string>) {
  const params = new URLSearchParams()
  if (searchParams.health_tier) params.set('health_tier', searchParams.health_tier)
  if (searchParams.search) params.set('search', searchParams.search)
  params.set('limit', '50')

  const url = `${process.env.API_URL || 'http://localhost:3001'}/api/v1/accounts?${params}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return { data: [], total: 0 }
  }
}

interface PageProps {
  searchParams: { health_tier?: string; search?: string }
}

export default async function AccountsPage({ searchParams }: PageProps) {
  const { data: accounts, total } = await getAccounts(searchParams)

  const greenCount = accounts.filter((a: any) => a.health_tier === 'green').length
  const yellowCount = accounts.filter((a: any) => a.health_tier === 'yellow').length
  const redCount = accounts.filter((a: any) => a.health_tier === 'red').length

  const filterHref = (tier: string | null) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    if (tier) params.set('health_tier', tier)
    else params.delete('health_tier')
    return `/accounts?${params}`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Contas
          </h1>
          <p className="text-sm text-slate-500 mt-1">{total} contas ativas no seu portfólio</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <a href={filterHref(null)} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
        </a>
        <a href={filterHref('green')} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Saudáveis</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{greenCount}</p>
        </a>
        <a href={filterHref('yellow')} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-yellow-300 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-slate-500">Em risco</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{yellowCount}</p>
        </a>
        <a href={filterHref('red')} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-red-300 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-500">Críticos</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{redCount}</p>
        </a>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { label: 'Todos', tier: null },
          { label: '● Saudáveis', tier: 'green' },
          { label: '● Em risco', tier: 'yellow' },
          { label: '● Críticos', tier: 'red' },
        ].map(({ label, tier }) => {
          const isActive = (tier === null && !searchParams.health_tier) || searchParams.health_tier === tier
          return (
            <a
              key={label}
              href={filterHref(tier)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      {/* Grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma conta encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account: any) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  )
}
