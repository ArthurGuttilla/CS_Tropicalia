import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../db/client'

export async function riskSignalRoutes(fastify: FastifyInstance) {
  // GET /accounts/:id/signals
  fastify.get<{
    Params: { id: string }
    Querystring: { resolved?: string; type?: string }
  }>('/accounts/:id/signals', async (request, reply) => {
    const where: Record<string, unknown> = { account_id: request.params.id }

    if (request.query.resolved === 'false') where.resolved_at = null
    if (request.query.resolved === 'true') where.resolved_at = { not: null }
    if (request.query.type) where.type = request.query.type

    const signals = await prisma.riskSignal.findMany({
      where,
      orderBy: { detected_at: 'desc' },
      take: 50,
    })

    return reply.send(signals)
  })

  // PATCH /signals/:signalId/acknowledge
  fastify.patch<{ Params: { signalId: string } }>(
    '/signals/:signalId/acknowledge',
    async (request, reply) => {
      const signal = await prisma.riskSignal.update({
        where: { id: request.params.signalId },
        data: { acknowledged_at: new Date() },
      })
      return reply.send(signal)
    }
  )

  // PATCH /signals/:signalId/resolve
  fastify.patch<{ Params: { signalId: string } }>(
    '/signals/:signalId/resolve',
    async (request, reply) => {
      const signal = await prisma.riskSignal.update({
        where: { id: request.params.signalId },
        data: { resolved_at: new Date() },
      })
      return reply.send(signal)
    }
  )
}
