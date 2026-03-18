/**
 * ContextService — Tropicalia API wrapper with Redis cache
 *
 * When TROPICALIA_MOCK=true: uses mock implementation reading from PostgreSQL
 * When TROPICALIA_MOCK=false: calls real Tropicalia REST API
 */

import { getRedis } from '../lib/redis'
import { config } from '../config'
import { getContextBundle, ContextBundle } from '../mocks/tropicalia'

const CACHE_TTL_SECONDS = config.CONTEXT_CACHE_TTL_MINUTES * 60

function cacheKey(accountId: string, timeframeDays: number) {
  return `context:${accountId}:${timeframeDays}`
}

export async function getContext(accountId: string, timeframeDays = 30): Promise<ContextBundle> {
  const redis = getRedis()
  const key = cacheKey(accountId, timeframeDays)

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached, (k, v) => {
        // Revive date strings
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v)
        return v
      })
    }
  } catch {
    // Cache miss or Redis error — fall through
  }

  let bundle: ContextBundle

  if (config.TROPICALIA_MOCK) {
    bundle = await getContextBundle(accountId, timeframeDays)
  } else {
    // Real Tropicalia API call
    const response = await fetch(
      `${config.TROPICALIA_API_URL}/contexts/${accountId}/bundle?timeframe_days=${timeframeDays}`,
      {
        headers: {
          Authorization: `Bearer ${config.TROPICALIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!response.ok) throw new Error(`Tropicalia API error: ${response.status}`)
    bundle = await response.json()
  }

  try {
    await redis.set(key, JSON.stringify(bundle), 'EX', CACHE_TTL_SECONDS)
  } catch {
    // Redis write failure — non-fatal
  }

  return bundle
}

export async function invalidateContext(accountId: string) {
  const redis = getRedis()
  const keys = await redis.keys(`context:${accountId}:*`)
  if (keys.length > 0) await redis.del(...keys)
}
