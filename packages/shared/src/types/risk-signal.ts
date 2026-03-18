export type SignalType = 'usage_drop' | 'ticket_sla_breach' | 'interaction_silence' | 'champion_change'
export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export interface RiskSignal {
  id: string
  account_id: string
  type: SignalType
  severity: SignalSeverity
  score_impact: number
  evidence: Record<string, unknown>
  suggested_action: Record<string, unknown> | null
  detected_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  created_at: string
}

export interface Alert {
  id: string
  account_id: string
  risk_signal_id: string | null
  type: string
  severity: string
  title: string
  body: string
  status: AlertStatus
  slack_sent_at: string | null
  email_sent_at: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  account?: {
    id: string
    name: string
    health_score: number
    health_tier: string
  }
}
