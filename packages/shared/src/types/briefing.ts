export interface InteractionSummary {
  date: string
  type: string
  summary: string
}

export interface BriefingSections {
  summary: string
  recent_interactions: InteractionSummary[]
  open_items: string[]
  risks: string[]
  opportunities: string[]
  suggested_talking_points: string[]
}

export interface Briefing {
  id: string
  account_id: string
  generated_at: string
  ttl_expires_at: string
  context_window_days: number
  summary: string
  recent_interactions: InteractionSummary[]
  open_items: string[]
  risks: string[]
  opportunities: string[]
  suggested_talking_points: string[]
  model_used: string
  prompt_tokens: number | null
  completion_tokens: number | null
  created_at: string
}
