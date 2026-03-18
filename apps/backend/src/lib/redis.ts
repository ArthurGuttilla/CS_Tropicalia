import Redis from 'ioredis'
import { config } from '../config'

let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message)
    })
  }
  return redisClient
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
