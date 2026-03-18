/**
 * Mock Tropicalia SDK
 *
 * Simulates the Tropicalia semantic memory API by reading from PostgreSQL.
 * In production, replace with actual Tropicalia SDK calls.
 *
 * Interface contract mirrors the real Tropicalia REST API:
 * GET /contexts/{contextId}/bundle?timeframe_days=N
 */

import prisma from '../db/client'

export interface InteractionSummary {
  id: string
  type: string
  subject: string
  summary: string | null
  occurred_at: Date
  source: string
}

export interface TicketSummary {
  id: string
  title: string
  priority: string
  status: string
  opened_at: Date
  resolved_at: Date | null
  sla_breach: boolean
  days_open: number
}

export interface SignalSummary {
  id: string
  type: string
  severity: string
  score_impact: number
  evidence: Record<string, unknown>
  detected_at: Date
}

export interface UsageTrend {
  current_wau: number
  baseline_wau: number
  delta_pct: number
  current_mau: number
  trend: 'up' | 'stable' | 'down' | 'critical'
}

export interface AccountMeta {
  name: string
  tier: string
  arr: number
  health_score: number
  health_tier: string
  renewal_date: Date | null
  champion_name: string | null
  champion_email: string | null
  products: string[]
  days_until_renewal: number | null
}

export interface ContextBundle {
  accountId: string
  generatedAt: Date
  interactions: InteractionSummary[]
  openTickets: TicketSummary[]
  recentSignals: SignalSummary[]
  usageTrend: UsageTrend
  accountMeta: AccountMeta
}

export async function getContextBundle(
  accountId: string,
  timeframeDays = 30
): Promise<ContextBundle> {
  const since = new Date()
  since.setDate(since.getDate() - timeframeDays)

  const [account, interactions, tickets, signals, snapshots] = await Promise.all([
    prisma.account.findUniqueOrThrow({ where: { id: accountId } }),
    prisma.interaction.findMany({
      where: { account_id: accountId, occurred_at: { gte: since } },
      orderBy: { occurred_at: 'desc' },
      take: 10,
    }),
    prisma.ticket.findMany({
      where: { account_id: accountId, status: { not: 'closed' } },
      orderBy: [{ priority: 'asc' }, { opened_at: 'desc' }],
      take: 10,
    }),
    prisma.riskSignal.findMany({
      where: { account_id: accountId, resolved_at: null },
      orderBy: { detected_at: 'desc' },
      take: 10,
    }),
    prisma.usageSnapshot.findMany({
      where: { account_id: accountId },
      orderBy: { snapshot_date: 'desc' },
      take: 35,
    }),
  ])

  // Calculate usage trend
  const currentSnapshots = snapshots.slice(0, 7)
  const baselineSnapshots = snapshots.slice(7, 35)

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const currentWau = Math.round(avg(currentSnapshots.map(s => s.weekly_active_users)))
  const baselineWau = Math.round(avg(baselineSnapshots.map(s => s.weekly_active_users)))
  const deltaPct = baselineWau > 0 ? ((currentWau - baselineWau) / baselineWau) * 100 : 0

  let trend: UsageTrend['trend'] = 'stable'
  if (deltaPct <= -50) trend = 'critical'
  else if (deltaPct <= -20) trend = 'down'
  else if (deltaPct >= 10) trend = 'up'

  const daysUntilRenewal = account.renewal_date
    ? Math.ceil((account.renewal_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return {
    accountId,
    generatedAt: new Date(),
    interactions: interactions.map(i => ({
      id: i.id,
      type: i.type,
      subject: i.subject,
      summary: i.summary,
      occurred_at: i.occurred_at,
      source: i.source,
    })),
    openTickets: tickets.map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      opened_at: t.opened_at,
      resolved_at: t.resolved_at,
      sla_breach: t.sla_breach,
      days_open: Math.ceil((Date.now() - t.opened_at.getTime()) / (1000 * 60 * 60 * 24)),
    })),
    recentSignals: signals.map(s => ({
      id: s.id,
      type: s.type,
      severity: s.severity,
      score_impact: s.score_impact,
      evidence: s.evidence as Record<string, unknown>,
      detected_at: s.detected_at,
    })),
    usageTrend: {
      current_wau: currentWau,
      baseline_wau: baselineWau,
      delta_pct: Math.round(deltaPct * 10) / 10,
      current_mau: Math.round(avg(currentSnapshots.map(s => s.monthly_active_users))),
      trend,
    },
    accountMeta: {
      name: account.name,
      tier: account.tier,
      arr: account.arr,
      health_score: account.health_score,
      health_tier: account.health_tier,
      renewal_date: account.renewal_date,
      champion_name: account.champion_name,
      champion_email: account.champion_email,
      products: account.products,
      days_until_renewal: daysUntilRenewal,
    },
  }
}
