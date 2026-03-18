'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, TrendingDown, User } from 'lucide-react'
import { getSeverityColor, formatRelativeDate } from '@/lib/utils'
import { api } from '@/lib/api'

interface RiskSignal {
  id: string
  type: string
  severity: string
  score_impact: number
  evidence: Record<string, unknown>
  suggested_action: Record<string, unknown> | null
  detected_at: string
  acknowledged_at: string | null
  resolved_at: string | null
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  usage_drop: { label: 'Queda de uso', icon: TrendingDown },
  ticket_sla_breach: { label: 'SLA em breach', icon: Clock },
  interaction_silence: { label: 'Silêncio de interação', icon: AlertTriangle },
  champion_change: { label: 'Mudança de champion', icon: User },
}

interface RiskSignalItemProps {
  signal: RiskSignal
  onUpdate?: () => void
}

export function RiskSignalItem({ signal, onUpdate }: RiskSignalItemProps) {
  const [loading, setLoading] = useState(false)
  const config = TYPE_CONFIG[signal.type] || { label: signal.type, icon: AlertTriangle }
  const Icon = config.icon
  const colorClass = getSeverityColor(signal.severity)

  const formatEvidence = (evidence: Record<string, unknown>) => {
    if (evidence.delta_pct !== undefined) {
      return `${evidence.previous_value} → ${evidence.current_value} WAU (${evidence.delta_pct}%)`
    }
    if (evidence.days_since_last_interaction) {
      return `${evidence.days_since_last_interaction} dias sem interação`
    }
    if (evidence.breach_count) {
      return `${evidence.breach_count} ticket(s) em breach de SLA`
    }
    if (evidence.previous_champion) {
      return `Champion anterior: ${evidence.previous_champion}`
    }
    return JSON.stringify(evidence).slice(0, 80)
  }

  const handleAcknowledge = async () => {
    setLoading(true)
    try {
      await api.signals.acknowledge(signal.id)
      onUpdate?.()
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    setLoading(true)
    try {
      await api.signals.resolve(signal.id)
      onUpdate?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold">{config.label}</span>
            <span className="text-xs opacity-70 flex-shrink-0">{formatRelativeDate(signal.detected_at)}</span>
          </div>
          <p className="text-xs mt-0.5 opacity-80">{formatEvidence(signal.evidence)}</p>
          <p className="text-xs mt-0.5 font-medium">Impacto: {signal.score_impact} pts</p>

          {signal.suggested_action && (
            <p className="text-xs mt-1 opacity-70">
              Ação: {(signal.suggested_action as any).template?.replace(/_/g, ' ')}
              {(signal.suggested_action as any).urgency && ` · ${(signal.suggested_action as any).urgency}`}
            </p>
          )}

          {!signal.acknowledged_at && !signal.resolved_at && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAcknowledge}
                disabled={loading}
                className="text-xs px-2 py-0.5 rounded border border-current opacity-70 hover:opacity-100 disabled:opacity-40"
              >
                Reconhecer
              </button>
              <button
                onClick={handleResolve}
                disabled={loading}
                className="text-xs px-2 py-0.5 rounded border border-current opacity-70 hover:opacity-100 disabled:opacity-40"
              >
                Resolver
              </button>
            </div>
          )}

          {signal.acknowledged_at && !signal.resolved_at && (
            <p className="text-xs mt-1 flex items-center gap-1 opacity-70">
              <CheckCircle className="w-3 h-3" /> Reconhecido
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
