import 'dotenv/config'
import { buildApp } from './app'
import { config } from './config'
import { startRiskScoringWorker } from './workers/RiskScoringWorker'
import { startSignalIngestionWorker } from './workers/SignalIngestionWorker'
import { closeRedis } from './lib/redis'
import prisma from './db/client'

async function main() {
  const app = await buildApp()

  // Start background workers
  const riskWorker = startRiskScoringWorker()
  const ingestionWorker = startSignalIngestionWorker()

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...')
    await app.close()
    await riskWorker.close()
    await ingestionWorker.close()
    await closeRedis()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`🚀 Server running at http://localhost:${config.PORT}`)
    console.log(`📊 API: http://localhost:${config.PORT}/api/v1`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
