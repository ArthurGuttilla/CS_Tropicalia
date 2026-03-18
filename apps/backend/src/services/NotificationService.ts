import { config } from '../config'

interface AlertWithAccount {
  id: string
  title: string
  body: string
  severity: string
  account: {
    id: string
    name: string
    health_score: number
    health_tier: string
  }
}

const HEALTH_TIER_EMOJI: Record<string, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
}

const SEVERITY_EMOJI: Record<string, string> = {
  critical: '🚨',
  high: '⚠️',
  medium: '🔔',
  low: 'ℹ️',
}

export async function sendSlackAlert(alert: AlertWithAccount): Promise<void> {
  if (!config.SLACK_BOT_TOKEN) {
    console.log('[NotificationService] Slack not configured, skipping notification')
    return
  }

  const tier = alert.account.health_tier
  const severityEmoji = SEVERITY_EMOJI[alert.severity] || '🔔'
  const tierEmoji = HEALTH_TIER_EMOJI[tier] || '⚪'
  const frontendUrl = `${config.FRONTEND_URL}/accounts/${alert.account.id}`

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${severityEmoji} CS Alert — ${alert.account.name}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${alert.title}*\n${alert.body}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Health Score*\n${tierEmoji} ${alert.account.health_score}/100`,
        },
        {
          type: 'mrkdwn',
          text: `*Severidade*\n${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}`,
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '📋 Ver no CS Tropicalia', emoji: true },
          url: frontendUrl,
          style: 'primary',
        },
      ],
    },
    { type: 'divider' },
  ]

  const payload = {
    channel: config.SLACK_ALERTS_CHANNEL,
    text: alert.title,
    blocks,
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  })

  const data = await response.json() as { ok: boolean; error?: string }

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`)
  }

  console.log(`[NotificationService] Slack alert sent for account ${alert.account.id}`)
}
