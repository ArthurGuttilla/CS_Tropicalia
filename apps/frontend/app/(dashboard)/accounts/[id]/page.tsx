import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, Globe, Tag, User } from 'lucide-react'
import { BriefingCard } from '@/components/briefing/briefing-card'
import { RiskSignalItem } from '@/components/risk/risk-signal-item'
import { HealthScoreBadge, HealthTierBadge, TierBadge } from '@/components/accounts/health-score-badge'
import { formatCurrency, formatDate, getDaysUntil, formatRelativeDate } from '@/lib/utils'

const API_URL = process.env.API_URL || 'http://localhost:3001'

async function getAccount(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/accounts/${id}`, { cache: 'no-store' })
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return null
  }
}

async function getBriefing(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/accounts/${id}/briefing`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

interface PageProps {
  params: { id: string }
}

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  call: 'Call',
  email: 'Email',
  slack_message: 'Slack',
  support_ticket: 'Ticket',
  qbr: 'QBR',
}

export default async function AccountProfilePage({ params }: PageProps) {
  const [account, briefing] = await Promise.all([
    getAccount(params.id),
    getBriefing(params.id),
  ])

  if (!account) notFound()

  const daysUntilRenewal = getDaysUntil(account.renewal_date)
  const renewalUrgent = daysUntilRenewal !== null && daysUntilRenewal <= 60

  return (
    <div>
      {/* Back nav */}
      <Link href="/accounts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar às contas
      </Link>

      {/* Account header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{account.name}</h1>
              <TierBadge tier={account.tier} />
              <HealthTierBadge tier={account.health_tier} />
            </div>
            <p className="text-sm text-slate-500 mt-1 capitalize">{account.industry} · {account.region}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span>ARR: <strong>{formatCurrency(account.arr)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span>MRR: <strong>{formatCurrency(account.mrr)}</strong></span>
              </div>
              {account.renewal_date && (
                <div className={`flex items-center gap-1.5 ${renewalUrgent ? 'text-orange-600' : ''}`}>
                  <Calendar className={`w-4 h-4 ${renewalUrgent ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>
                    Renovação: <strong>{formatDate(account.renewal_date)}</strong>
                    {daysUntilRenewal !== null && (
                      <span className="ml-1 text-xs">
                        ({daysUntilRenewal > 0 ? `em ${daysUntilRenewal} dias` : 'vencida'})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {account.champion_name && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Champion: <strong>{account.champion_name}</strong></span>
                </div>
              )}
              {account.csm && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>CSM: <strong>{account.csm.name}</strong></span>
                </div>
              )}
              {account.products?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>{account.products.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            <HealthScoreBadge score={account.health_score} tier={account.health_tier} size="lg" />
          </div>
        </div>
      </div>

      {/* Main content: 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Briefing (2/3) */}
        <div className="lg:col-span-2">
          <BriefingCard accountId={account.id} initialBriefing={briefing} />
        </div>

        {/* Right: Signals + Timeline (1/3) */}
        <div className="space-y-6">
          {/* Risk Signals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Sinais de Risco
              {account.risk_signals?.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  {account.risk_signals.length}
                </span>
              )}
            </h2>
            {!account.risk_signals?.length ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhum sinal de risco ativo</p>
            ) : (
              <div className="space-y-2">
                {account.risk_signals.map((signal: any) => (
                  <RiskSignalItem key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Interactions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Interações Recentes</h2>
            {!account.interactions?.length ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma interação registrada</p>
            ) : (
              <div className="space-y-3">
                {account.interactions.map((interaction: any) => (
                  <div key={interaction.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-700">{INTERACTION_TYPE_LABELS[interaction.type] || interaction.type}</span>
                        <span className="text-xs text-slate-400">{formatRelativeDate(interaction.occurred_at)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{interaction.subject}</p>
                      {interaction.summary && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{interaction.summary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Tickets */}
          {account.tickets?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Tickets Abertos</h2>
              <div className="space-y-2">
                {account.tickets.map((ticket: any) => {
                  const priorityColors: Record<string, string> = {
                    p0: 'text-red-700 bg-red-100',
                    p1: 'text-orange-700 bg-orange-100',
                    p2: 'text-yellow-700 bg-yellow-100',
                    p3: 'text-slate-700 bg-slate-100',
                  }
                  const daysOpen = Math.ceil((Date.now() - new Date(ticket.opened_at).getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={ticket.id} className={`rounded-lg p-3 ${ticket.sla_breach ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${priorityColors[ticket.priority] || priorityColors.p3}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        {ticket.sla_breach && (
                          <span className="text-xs text-red-600 font-medium">SLA BREACH</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700">{ticket.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Aberto há {daysOpen} dias</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
