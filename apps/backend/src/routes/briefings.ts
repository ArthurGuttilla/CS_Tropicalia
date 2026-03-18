import { FastifyInstance } from 'fastify'
import { getOrGenerateBriefing } from '../services/BriefingService'

export async function briefingRoutes(fastify: FastifyInstance) {
  // GET /accounts/:id/briefing
  fastify.get<{ Params: { id: string }; Querystring: { force?: string } }>(
    '/accounts/:id/briefing',
    async (request, reply) => {
      try {
        const forceRefresh = request.query.force === 'true'
        const briefing = await getOrGenerateBriefing(request.params.id, forceRefresh)
        return reply.send(briefing)
      } catch (error: unknown) {
        const err = error as Error
        if (err.message?.includes('No record') || err.message?.includes('not found')) {
          return reply.status(404).send({ error: 'Account not found' })
        }
        if (err.message?.includes('LLM') || err.message?.includes('Anthropic')) {
          return reply.status(503).send({ error: 'Briefing generation unavailable', message: err.message })
        }
        throw error
      }
    }
  )

  // POST /accounts/:id/briefing/refresh
  fastify.post<{ Params: { id: string } }>(
    '/accounts/:id/briefing/refresh',
    async (request, reply) => {
      try {
        const briefing = await getOrGenerateBriefing(request.params.id, true)
        return reply.send(briefing)
      } catch (error: unknown) {
        const err = error as Error
        if (err.message?.includes('No record') || err.message?.includes('not found')) {
          return reply.status(404).send({ error: 'Account not found' })
        }
        return reply.status(503).send({ error: 'Briefing generation failed', message: err.message })
      }
    }
  )
}
