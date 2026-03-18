import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../db/client'
import { signalIngestionQueue, riskScoringQueue } from '../lib/queue'

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhooks/mixpanel — simulate usage data push
  fastify.post<{ Body: unknown }>('/webhooks/mixpanel', async (request, reply) => {
    const schema = z.object({
      account_id: z.string(),
      event: z.literal('usage_report'),
      payload: z.object({
        weekly_active_users: z.number(),
        monthly_active_users: z.number(),
        api_calls: z.number().default(0),
        feature_usage: z.record(z.number()).default({}),
      }),
    })

    const body = schema.parse(request.body)

    await prisma.usageSnapshot.upsert({
      where: {
        account_id_snapshot_date: {
          account_id: body.account_id,
          snapshot_date: new Date(new Date().toDateString()),
        },
      },
      update: {
        weekly_active_users: body.payload.weekly_active_users,
        monthly_active_users: body.payload.monthly_active_users,
        api_calls: body.payload.api_calls,
        feature_usage: body.payload.feature_usage,
      },
      create: {
        account_id: body.account_id,
        snapshot_date: new Date(new Date().toDateString()),
        weekly_active_users: body.payload.weekly_active_users,
        monthly_active_users: body.payload.monthly_active_users,
        api_calls: body.payload.api_calls,
        feature_usage: body.payload.feature_usage,
        source: 'mixpanel',
      },
    })

    await riskScoringQueue.add('score-account', { accountId: body.account_id })

    return reply.status(202).send({ status: 'accepted' })
  })

  // POST /webhooks/salesforce — simulate CRM event push
  fastify.post<{ Body: unknown }>('/webhooks/salesforce', async (request, reply) => {
    const schema = z.object({
      account_id: z.string(),
      event: z.enum(['ticket.created', 'interaction.logged', 'contact.changed']),
      payload: z.record(z.unknown()),
    })

    const body = schema.parse(request.body)

    await signalIngestionQueue.add('ingest-salesforce-event', body)

    return reply.status(202).send({ status: 'accepted' })
  })

  // POST /webhooks/clerk — user sync
  fastify.post<{ Body: unknown }>('/webhooks/clerk', async (request, reply) => {
    const schema = z.object({
      type: z.string(),
      data: z.object({
        id: z.string(),
        email_addresses: z.array(z.object({ email_address: z.string() })),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      }),
    })

    const body = schema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid payload' })

    if (body.data.type === 'user.created' || body.data.type === 'user.updated') {
      const email = body.data.data.email_addresses[0]?.email_address
      const name = [body.data.data.first_name, body.data.data.last_name].filter(Boolean).join(' ') || email

      await prisma.user.upsert({
        where: { clerk_id: body.data.data.id },
        update: { email: email!, name },
        create: { clerk_id: body.data.data.id, email: email!, name },
      })
    }

    return reply.status(200).send({ status: 'ok' })
  })
}
