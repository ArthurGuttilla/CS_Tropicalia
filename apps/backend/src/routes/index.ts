import { FastifyInstance } from 'fastify'
import { accountRoutes } from './accounts'
import { briefingRoutes } from './briefings'
import { riskSignalRoutes } from './risk-signals'
import { alertRoutes } from './alerts'
import { webhookRoutes } from './webhooks'
import { scoreAllAccounts } from '../services/RiskScoringService'
import { config } from '../config'
import prisma from '../db/client'
import { getRedis } from '../lib/redis'

export async function registerRoutes(fastify: FastifyInstance) {
  const prefix = '/api/v1'

  fastify.register(accountRoutes, { prefix })
  fastify.register(briefingRoutes, { prefix })
  fastify.register(riskSignalRoutes, { prefix })
  fastify.register(alertRoutes, { prefix })
  fastify.register(webhookRoutes, { prefix })

  // Health check
  fastify.get(`${prefix}/health`, async (_, reply) => {
    let dbStatus = 'ok'
    let redisStatus = 'ok'

    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      dbStatus = 'error'
    }

    try {
      const redis = getRedis()
      await redis.ping()
    } catch {
      redisStatus = 'error'
    }

    return reply.send({
      status: dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    })
  })

  // Internal: trigger score-all (protected by internal API key)
  fastify.post(`${prefix}/internal/score-all`, async (request, reply) => {
    const key = (request.headers['x-internal-key'] as string) || ''
    if (key !== config.INTERNAL_API_KEY) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    // Fire and forget
    scoreAllAccounts().catch(err => console.error('scoreAllAccounts error:', err))

    return reply.status(202).send({ status: 'accepted', message: 'Scoring started' })
  })
}
