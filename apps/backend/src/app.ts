import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import { config } from './config'
import { registerRoutes } from './routes'

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
      ...(config.NODE_ENV !== 'production' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }),
    },
  })

  await fastify.register(cors, {
    origin: [config.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
  })

  await fastify.register(sensible)

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error)
    if (error.validation) {
      return reply.status(422).send({ error: 'Validation error', details: error.validation })
    }
    return reply.status(error.statusCode || 500).send({
      error: error.message || 'Internal server error',
    })
  })

  await registerRoutes(fastify)

  return fastify
}
