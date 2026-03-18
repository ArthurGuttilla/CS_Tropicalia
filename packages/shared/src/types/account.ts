export type Tier = 'starter' | 'growth' | 'enterprise'
export type HealthTier = 'green' | 'yellow' | 'red'
export type OnboardingStatus = 'pending' | 'active' | 'completed' | 'churned'

export interface Account {
  id: string
  name: string
  tier: Tier
  arr: number
  mrr: number
  industry: string
  region: string
  health_score: number
  health_tier: HealthTier
  renewal_date: string | null
  onboarding_status: OnboardingStatus
  integrations_active: string[]
  tropicalia_context_id: string | null
  champion_name: string | null
  champion_email: string | null
  executive_sponsor: string | null
  products: string[]
  csm_id: string
  created_at: string
  updated_at: string
}

export interface AccountWithMeta extends Account {
  csm: { id: string; name: string; email: string }
  _count: {
    risk_signals: number
    alerts: number
  }
}
