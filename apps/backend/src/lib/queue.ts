import { Queue, Worker, QueueEvents } from 'bullmq'
import { getRedis } from './redis'

const connection = { host: 'localhost', port: 6379 }

function getConnectionFromUrl(redisUrl: string) {
  try {
    const url = new URL(redisUrl)
    return { host: url.hostname, port: parseInt(url.port || '6379') }
  } catch {
    return connection
  }
}

export function createQueue(name: string) {
  const redis = getRedis()
  return new Queue(name, {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  })
}

export function createWorker<T>(
  name: string,
  processor: (job: import('bullmq').Job<T>) => Promise<void>,
  concurrency = 5
) {
  const redis = getRedis()
  return new Worker<T>(name, processor, {
    connection: redis as any,
    concurrency,
  })
}

// Named queues
export const riskScoringQueue = createQueue('risk-scoring')
export const signalIngestionQueue = createQueue('signal-ingestion')
