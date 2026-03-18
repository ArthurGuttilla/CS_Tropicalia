import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../db/client'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  health_tier: z.enum(['green', 'yellow', 'red']).optional(),
  search: z.string().optional(),
})

export async function accountRoutes(fastify: FastifyInstance) {
  // GET /accounts
  fastify.get('/accounts', async (request, reply) => {
    const query = querySchema.parse(request.query)
    const skip = (query.page - 1) * query.limit

    const where: Record<string, unknown> = {}
    if (query.health_tier) where.health_tier = query.health_tier
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' }
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ health_score: 'asc' }, { renewal_date: 'asc' }],
        include: {
          csm: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              risk_signals: { where: { resolved_at: null } },
              alerts: { where: { status: 'open' } },
            },
          },
        },
      }),
      prisma.account.count({ where }),
    ])

    return reply.send({
      data: accounts,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    })
  })

  // GET /accounts/:id
  fastify.get<{ Params: { id: string } }>('/accounts/:id', async (request, reply) => {
    const account = await prisma.account.findUnique({
      where: { id: request.params.id },
      include: {
        csm: { select: { id: true, name: true, email: true } },
        risk_signals: {
          where: { resolved_at: null },
          orderBy: { detected_at: 'desc' },
          take: 10,
        },
        interactions: {
          orderBy: { occurred_at: 'desc' },
          take: 10,
        },
        tickets: {
          where: { status: { not: 'closed' } },
          orderBy: [{ priority: 'asc' }, { opened_at: 'desc' }],
          take: 10,
        },
        _count: {
          select: {
            risk_signals: { where: { resolved_at: null } },
            alerts: { where: { status: 'open' } },
          },
        },
      },
    })

    if (!account) return reply.status(404).send({ error: 'Account not found' })

    return reply.send(account)
  })

  // PATCH /accounts/:id
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/accounts/:id',
    async (request, reply) => {
      const updateSchema = z.object({
        renewal_date: z.string().optional(),
        champion_name: z.string().optional(),
        champion_email: z.string().email().optional(),
        executive_sponsor: z.string().optional(),
      })

      const data = updateSchema.parse(request.body)

      const account = await prisma.account.update({
        where: { id: request.params.id },
        data: {
          ...data,
          renewal_date: data.renewal_date ? new Date(data.renewal_date) : undefined,
        },
      })

      return reply.send(account)
    }
  )
}
