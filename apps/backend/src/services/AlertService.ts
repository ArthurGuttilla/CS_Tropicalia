import prisma from '../db/client'
import { sendSlackAlert } from './NotificationService'

export async function createAlert(params: {
  accountId: string
  riskSignalId?: string
  type: string
  severity: string
  title: string
  body: string
}) {
  const alert = await prisma.alert.create({
    data: {
      account_id: params.accountId,
      risk_signal_id: params.riskSignalId,
      type: params.type,
      severity: params.severity,
      title: params.title,
      body: params.body,
    },
    include: { account: true },
  })

  // Fire-and-forget Slack notification
  sendSlackAlert(alert).catch(err =>
    console.error('Slack notification failed:', err.message)
  )

  return alert
}

export async function acknowledgeAlert(alertId: string) {
  return prisma.alert.update({
    where: { id: alertId },
    data: { status: 'acknowledged', acknowledged_at: new Date() },
  })
}

export async function resolveAlert(alertId: string) {
  return prisma.alert.update({
    where: { id: alertId },
    data: { status: 'resolved', resolved_at: new Date() },
  })
}
