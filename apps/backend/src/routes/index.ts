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

  // Connectors status
  fastify.get(`${prefix}/connectors`, async (_, reply) => {
    const baseUrl = config.API_BASE_URL

    const connectors = [
      {
        id: 'salesforce',
        name: 'Salesforce',
        category: 'crm',
        description: 'Sincroniza tickets de suporte e interações com clientes do CRM.',
        status: 'webhook',
        webhook_url: `${baseUrl}/api/v1/webhooks/salesforce`,
        configured: true,
        docs_url: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm',
      },
      {
        id: 'mixpanel',
        name: 'Mixpanel',
        category: 'analytics',
        description: 'Recebe snapshots de uso do produto para cálculo de health score.',
        status: 'webhook',
        webhook_url: `${baseUrl}/api/v1/webhooks/mixpanel`,
        configured: true,
        docs_url: 'https://docs.mixpanel.com/docs/tracking-methods/integrations/webhooks',
      },
      {
        id: 'slack',
        name: 'Slack',
        category: 'notifications',
        description: 'Envia alertas de risco e notificações proativas para o canal #cs-alerts.',
        status: config.SLACK_BOT_TOKEN ? 'active' : 'inactive',
        configured: !!config.SLACK_BOT_TOKEN,
        channel: config.SLACK_ALERTS_CHANNEL,
      },
      {
        id: 'tropicalia',
        name: 'Tropicalia Memory',
        category: 'ai',
        description: 'Memória semântica contextual que alimenta briefings e insights de IA.',
        status: config.TROPICALIA_MOCK ? 'mock' : (config.TROPICALIA_API_KEY ? 'active' : 'inactive'),
        configured: config.TROPICALIA_MOCK || !!config.TROPICALIA_API_KEY,
        mock_mode: config.TROPICALIA_MOCK,
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        category: 'ai',
        description: `Gera briefings pré-call e análise de risco usando ${config.LLM_PRIMARY_MODEL}.`,
        status: config.ANTHROPIC_API_KEY ? 'active' : 'inactive',
        configured: !!config.ANTHROPIC_API_KEY,
        model: config.LLM_PRIMARY_MODEL,
      },
      {
        id: 'clerk',
        name: 'Clerk',
        category: 'auth',
        description: 'Autenticação e gestão de usuários com SSO.',
        status: 'webhook',
        webhook_url: `${baseUrl}/api/v1/webhooks/clerk`,
        configured: true,
      },
      {
        id: 'resend',
        name: 'Resend',
        category: 'notifications',
        description: 'Envio de alertas e relatórios por email.',
        status: config.RESEND_API_KEY ? 'active' : 'inactive',
        configured: !!config.RESEND_API_KEY,
        from_email: config.EMAIL_FROM,
      },
    ]

    return reply.send({ data: connectors })
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
