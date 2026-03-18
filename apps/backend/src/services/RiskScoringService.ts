import prisma from '../db/client'
import { createAlert } from './AlertService'
import { invalidateContext } from './ContextService'

interface ScoreDeduction {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  points: number
  evidence: Record<string, unknown>
  suggested_action: Record<string, unknown>
}

function getHealthTier(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 75) return 'green'
  if (score >= 50) return 'yellow'
  return 'red'
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export async function scoreAccount(accountId: string): Promise<void> {
  let score = 100
  const deductions: ScoreDeduction[] = []

  // Fetch all data needed for scoring
  const [account, snapshots, tickets, interactions] = await Promise.all([
    prisma.account.findUniqueOrThrow({ where: { id: accountId } }),
    prisma.usageSnapshot.findMany({
      where: { account_id: accountId },
      orderBy: { snapshot_date: 'desc' },
      take: 35,
    }),
    prisma.ticket.findMany({
      where: { account_id: accountId, status: { in: ['open', 'in_progress', 'pending_customer'] } },
    }),
    prisma.interaction.findMany({
      where: { account_id: accountId },
      orderBy: { occurred_at: 'desc' },
      take: 1,
    }),
  ])

  // Rule 1: WAU drop (compares last 7 days vs days 8–35)
  if (snapshots.length >= 8) {
    const currentWau = avg(snapshots.slice(0, 7).map(s => s.weekly_active_users))
    const baselineWau = avg(snapshots.slice(7).map(s => s.weekly_active_users))

    if (baselineWau > 0 && currentWau < baselineWau * 0.5) {
      const deltaPct = ((currentWau - baselineWau) / baselineWau) * 100
      const severity = currentWau < baselineWau * 0.25 ? 'critical' : 'high'
      const points = 20
      score -= points
      deductions.push({
        type: 'usage_drop',
        severity,
        points,
        evidence: {
          metric: 'weekly_active_users',
          previous_value: Math.round(baselineWau),
          current_value: Math.round(currentWau),
          delta_pct: Math.round(deltaPct * 10) / 10,
          window_days: 14,
        },
        suggested_action: {
          type: 'reach_out',
          template: 'usage_drop_outreach',
          urgency: 'within_48h',
        },
      })
    }
  }

  // Rule 2: Ticket SLA breach (open P0/P1 tickets)
  const highPriorityTickets = tickets.filter(t => t.priority === 'p0' || t.priority === 'p1')
  const slaBreachTickets = highPriorityTickets.filter(t => {
    const daysOpen = (Date.now() - t.opened_at.getTime()) / (1000 * 60 * 60 * 24)
    return daysOpen > 5
  })

  if (slaBreachTickets.length > 0) {
    const points = Math.min(slaBreachTickets.length * 8, 20)
    score -= points
    deductions.push({
      type: 'ticket_sla_breach',
      severity: slaBreachTickets.some(t => t.priority === 'p0') ? 'critical' : 'high',
      points,
      evidence: {
        breach_count: slaBreachTickets.length,
        ticket_ids: slaBreachTickets.map(t => t.id),
        priorities: slaBreachTickets.map(t => t.priority),
      },
      suggested_action: {
        type: 'escalate',
        template: 'sla_breach_escalation',
        urgency: slaBreachTickets.some(t => t.priority === 'p0') ? 'immediate' : 'within_24h',
      },
    })

    // Mark tickets as SLA breach in DB
    await prisma.ticket.updateMany({
      where: { id: { in: slaBreachTickets.map(t => t.id) } },
      data: { sla_breach: true },
    })
  }

  // Rule 3: Interaction silence (> 14 days)
  if (interactions.length === 0 || (Date.now() - interactions[0].occurred_at.getTime()) > 14 * 24 * 60 * 60 * 1000) {
    const daysSince = interactions.length
      ? Math.ceil((Date.now() - interactions[0].occurred_at.getTime()) / (1000 * 60 * 60 * 24))
      : 999
    const points = 15
    score -= points
    deductions.push({
      type: 'interaction_silence',
      severity: daysSince > 30 ? 'high' : 'medium',
      points,
      evidence: {
        last_interaction_date: interactions[0]?.occurred_at.toISOString() || null,
        days_since_last_interaction: daysSince,
        threshold_days: 14,
      },
      suggested_action: {
        type: 'reach_out',
        template: 'silence_check_in',
        urgency: 'within_48h',
      },
    })
  }

  // Rule 4: Open P0/P1 tickets (additional penalty)
  const openCriticalTickets = tickets.filter(t => t.priority === 'p0')
  if (openCriticalTickets.length > 0) {
    const points = Math.min(openCriticalTickets.length * 8, 20)
    score -= points
    // Already counted in SLA breach above, only add if not already deducted
    const alreadyCounted = deductions.find(d => d.type === 'ticket_sla_breach')
    if (!alreadyCounted) {
      deductions.push({
        type: 'ticket_sla_breach',
        severity: 'critical',
        points,
        evidence: {
          open_p0_tickets: openCriticalTickets.length,
          ticket_ids: openCriticalTickets.map(t => t.id),
        },
        suggested_action: {
          type: 'escalate',
          template: 'p0_escalation',
          urgency: 'immediate',
        },
      })
    }
  }

  score = Math.max(score, 0)
  const healthTier = getHealthTier(score)
  const previousScore = account.health_score
  const previousTier = account.health_tier

  // Persist score update
  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: accountId },
      data: { health_score: score, health_tier: healthTier },
    })

    // Create new risk signals for new deductions
    for (const d of deductions) {
      const existing = await tx.riskSignal.findFirst({
        where: {
          account_id: accountId,
          type: d.type as any,
          resolved_at: null,
        },
      })

      if (!existing) {
        await tx.riskSignal.create({
          data: {
            account_id: accountId,
            type: d.type as any,
            severity: d.severity as any,
            score_impact: -d.points,
            evidence: d.evidence,
            suggested_action: d.suggested_action,
          },
        })
      }
    }
  })

  // Fire alert if score dropped below threshold (60)
  if (previousScore >= 60 && score < 60) {
    await createAlert({
      accountId,
      type: 'health_score_drop',
      severity: score < 40 ? 'critical' : 'high',
      title: `${score < 40 ? '🚨' : '⚠️'} Health score caiu para ${score} — ${account.name}`,
      body: `Score caiu de ${previousScore} para ${score} (${previousTier} → ${healthTier}). Deduções: ${deductions.map(d => `${d.type} (-${d.points})`).join(', ')}`,
    })
  }

  // Invalidate context cache so next briefing gets fresh data
  if (deductions.length > 0) {
    invalidateContext(accountId).catch(() => {})
  }

  console.log(`[RiskScoring] ${account.name}: score ${previousScore} → ${score} (${healthTier})`)
}

export async function scoreAllAccounts(): Promise<void> {
  const accounts = await prisma.account.findMany({
    where: { onboarding_status: { not: 'churned' } },
    select: { id: true, name: true },
  })

  console.log(`[RiskScoring] Scoring ${accounts.length} accounts...`)

  // Process in batches of 5
  const batchSize = 5
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize)
    await Promise.allSettled(batch.map(a => scoreAccount(a.id)))
  }

  console.log('[RiskScoring] All accounts scored')
}
