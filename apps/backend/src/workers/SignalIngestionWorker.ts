import { Job } from 'bullmq'
import { createWorker, riskScoringQueue } from '../lib/queue'
import prisma from '../db/client'

interface SalesforceEventJob {
  account_id: string
  event: 'ticket.created' | 'interaction.logged' | 'contact.changed'
  payload: Record<string, unknown>
}

export function startSignalIngestionWorker() {
  const worker = createWorker<SalesforceEventJob>(
    'signal-ingestion',
    async (job: Job<SalesforceEventJob>) => {
      const { account_id, event, payload } = job.data

      try {
        switch (event) {
          case 'ticket.created': {
            await prisma.ticket.create({
              data: {
                account_id,
                external_id: payload.id as string,
                title: payload.title as string || 'Ticket criado via integração',
                priority: (payload.priority as 'p0' | 'p1' | 'p2' | 'p3') || 'p2',
                status: 'open',
                opened_at: new Date(),
                source: 'salesforce',
                metadata: payload,
              },
            })
            break
          }

          case 'interaction.logged': {
            await prisma.interaction.create({
              data: {
                account_id,
                type: (payload.type as any) || 'call',
                subject: payload.subject as string || 'Interação registrada',
                summary: payload.summary as string,
                occurred_at: payload.occurred_at ? new Date(payload.occurred_at as string) : new Date(),
                source: 'salesforce',
                metadata: payload,
              },
            })
            break
          }

          case 'contact.changed': {
            await prisma.account.update({
              where: { id: account_id },
              data: {
                champion_name: payload.new_champion_name as string,
                champion_email: payload.new_champion_email as string,
              },
            })

            await prisma.interaction.create({
              data: {
                account_id,
                type: 'email',
                subject: `Mudança de contato: ${payload.new_champion_name || 'novo champion'}`,
                summary: `Champion alterado para ${payload.new_champion_name} (${payload.new_champion_email})`,
                occurred_at: new Date(),
                source: 'salesforce',
              },
            })
            break
          }
        }

        // Trigger re-scoring for this account
        await riskScoringQueue.add('score-account', { accountId: account_id })
        console.log(`[SignalIngestion] Processed ${event} for account ${account_id}`)
      } catch (err: unknown) {
        console.error(`[SignalIngestion] Error processing ${event}:`, (err as Error).message)
        throw err
      }
    },
    3
  )

  worker.on('failed', (job, err) => {
    console.error(`[SignalIngestionWorker] Job ${job?.name} failed:`, err.message)
  })

  console.log('[SignalIngestionWorker] Started')
  return worker
}
