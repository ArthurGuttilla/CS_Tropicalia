import prisma from '../db/client'
import { getRedis } from '../lib/redis'
import { config } from '../config'
import { getContext } from './ContextService'
import { generateBriefing } from './LLMOrchestrator'

const BRIEFING_CACHE_KEY = (accountId: string) => `briefing:latest:${accountId}`

export async function getOrGenerateBriefing(accountId: string, forceRefresh = false) {
  // Check DB for valid cached briefing
  if (!forceRefresh) {
    const existing = await prisma.briefing.findFirst({
      where: {
        account_id: accountId,
        ttl_expires_at: { gt: new Date() },
      },
      orderBy: { generated_at: 'desc' },
    })

    if (existing) return existing
  }

  // Generate new briefing
  const bundle = await getContext(accountId, 30)
  const llmResult = await generateBriefing(bundle)

  const ttlExpires = new Date()
  ttlExpires.setHours(ttlExpires.getHours() + config.BRIEFING_TTL_HOURS)

  const briefing = await prisma.briefing.create({
    data: {
      account_id: accountId,
      ttl_expires_at: ttlExpires,
      context_window_days: 30,
      summary: llmResult.data.summary,
      recent_interactions: llmResult.data.recent_interactions,
      open_items: llmResult.data.open_items,
      risks: llmResult.data.risks,
      opportunities: llmResult.data.opportunities,
      suggested_talking_points: llmResult.data.suggested_talking_points,
      model_used: llmResult.modelUsed,
      prompt_tokens: llmResult.promptTokens,
      completion_tokens: llmResult.completionTokens,
    },
  })

  // Cache in Redis too
  const redis = getRedis()
  try {
    await redis.set(
      BRIEFING_CACHE_KEY(accountId),
      JSON.stringify(briefing),
      'EX',
      config.BRIEFING_TTL_HOURS * 3600
    )
  } catch {
    // Non-fatal
  }

  return briefing
}
