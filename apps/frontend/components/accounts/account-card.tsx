import Link from 'next/link'
import { AlertTriangle, Calendar, DollarSign, User } from 'lucide-react'
import { HealthScoreBadge, HealthTierBadge, TierBadge } from './health-score-badge'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'

interface AccountCardProps {
  account: {
    id: string
    name: string
    tier: string
    arr: number
    health_score: number
    health_tier: string
    renewal_date: string | null
    champion_name: string | null
    industry: string
    csm?: { name: string }
    _count?: { risk_signals: number; alerts: number }
  }
}

export function AccountCard({ account }: AccountCardProps) {
  const daysUntilRenewal = getDaysUntil(account.renewal_date)
  const renewalUrgent = daysUntilRenewal !== null && daysUntilRenewal <= 60

  return (
    <Link href={`/accounts/${account.id}`} className="block">
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 truncate">{account.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{account.industry}</p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <HealthScoreBadge score={account.health_score} tier={account.health_tier} size="sm" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <TierBadge tier={account.tier} />
          <HealthTierBadge tier={account.health_tier} />
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>ARR: <strong>{formatCurrency(account.arr)}</strong></span>
          </div>

          {account.renewal_date && (
            <div className={`flex items-center gap-2 text-xs ${renewalUrgent ? 'text-orange-600' : 'text-slate-600'}`}>
              <Calendar className={`w-3.5 h-3.5 ${renewalUrgent ? 'text-orange-400' : 'text-slate-400'}`} />
              <span>
                Renovação: <strong>{formatDate(account.renewal_date)}</strong>
                {daysUntilRenewal !== null && (
                  <span className={`ml-1 ${renewalUrgent ? 'font-semibold' : ''}`}>
                    ({daysUntilRenewal > 0 ? `em ${daysUntilRenewal}d` : 'vencida'})
                  </span>
                )}
              </span>
            </div>
          )}

          {account.champion_name && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{account.champion_name}</span>
            </div>
          )}
        </div>

        {/* Signals count */}
        {account._count && account._count.risk_signals > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs text-orange-600 font-medium">
              {account._count.risk_signals} sinal{account._count.risk_signals !== 1 ? 'is' : ''} ativo{account._count.risk_signals !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
