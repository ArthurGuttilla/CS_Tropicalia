import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../db/client'
import { acknowledgeAlert, resolveAlert } from '../services/AlertService'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  status: z.enum(['open', 'acknowledged', 'resolved']).optional(),
})

export async function alertRoutes(fastify: FastifyInstance) {
  // GET /alerts
  fastify.get('/alerts', async (request, reply) => {
    const query = querySchema.parse(request.query)
    const skip = (query.page - 1) * query.limit

    const where: Record<string, unknown> = {}
    if (query.status) where.status = query.status

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ created_at: 'desc' }],
        include: {
          account: {
            select: { id: true, name: true, health_score: true, health_tier: true, tier: true },
          },
        },
      }),
      prisma.alert.count({ where }),
    ])

    return reply.send({ data: alerts, total, page: query.page, limit: query.limit })
  })

  // PATCH /alerts/:alertId/acknowledge
  fastify.patch<{ Params: { alertId: string } }>(
    '/alerts/:alertId/acknowledge',
    async (request, reply) => {
      const alert = await acknowledgeAlert(request.params.alertId)
      return reply.send(alert)
    }
  )

  // PATCH /alerts/:alertId/resolve
  fastify.patch<{ Params: { alertId: string } }>(
    '/alerts/:alertId/resolve',
    async (request, reply) => {
      const alert = await resolveAlert(request.params.alertId)
      return reply.send(alert)
    }
  )
}
