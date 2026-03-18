'use client'

import { getHealthColor } from '@/lib/utils'

interface HealthScoreBadgeProps {
  score: number
  tier: string
  size?: 'sm' | 'md' | 'lg'
}

export function HealthScoreBadge({ score, tier, size = 'md' }: HealthScoreBadgeProps) {
  const color = getHealthColor(tier)
  const sizes = {
    sm: { container: 48, stroke: 4, text: '12', label: '8' },
    md: { container: 72, stroke: 5, text: '18', label: '10' },
    lg: { container: 100, stroke: 6, text: '24', label: '11' },
  }
  const s = sizes[size]
  const radius = (s.container - s.stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const center = s.container / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={s.container} height={s.container}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={s.stroke}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={s.text}
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x={center}
          y={center + parseInt(s.text) / 1.5 + 2}
          textAnchor="middle"
          fontSize={s.label}
          fill="#94a3b8"
        >
          /100
        </text>
      </svg>
    </div>
  )
}

export function HealthTierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    red: 'bg-red-100 text-red-700 border border-red-200',
  }
  const labels: Record<string, string> = {
    green: '● Saudável',
    yellow: '● Em risco',
    red: '● Crítico',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[tier] || styles.green}`}>
      {labels[tier] || tier}
    </span>
  )
}

export function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    enterprise: 'bg-purple-100 text-purple-700',
    growth: 'bg-blue-100 text-blue-700',
    starter: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[tier] || styles.starter}`}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  )
}
