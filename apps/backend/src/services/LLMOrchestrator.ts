import crypto from 'crypto'
import { getAnthropicClient } from '../lib/claude'
import { getRedis } from '../lib/redis'
import { config } from '../config'
import { ContextBundle } from '../mocks/tropicalia'
import { buildBriefingPrompt, briefingToolSchema } from '../prompts/briefing'

export interface BriefingOutput {
  summary: string
  recent_interactions: Array<{ date: string; type: string; summary: string }>
  open_items: string[]
  risks: string[]
  opportunities: string[]
  suggested_talking_points: string[]
}

export interface LLMResult<T> {
  data: T
  modelUsed: string
  promptTokens: number
  completionTokens: number
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function contextHash(bundle: ContextBundle): string {
  const key = `${bundle.accountId}:${bundle.usageTrend.current_wau}:${bundle.interactions.length}:${bundle.recentSignals.length}`
  return crypto.createHash('md5').update(key).digest('hex').slice(0, 12)
}

export async function generateBriefing(bundle: ContextBundle): Promise<LLMResult<BriefingOutput>> {
  const redis = getRedis()
  const hash = contextHash(bundle)
  const cacheKey = `llm:briefing:${bundle.accountId}:${hash}`
  const ttlSeconds = config.BRIEFING_TTL_HOURS * 3600

  // Check cache
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch {
    // Cache miss
  }

  const prompt = buildBriefingPrompt(bundle)
  const anthropic = getAnthropicClient()

  let lastError: Error | null = null
  const models = [config.LLM_PRIMARY_MODEL, config.LLM_FALLBACK_MODEL]

  for (let attempt = 0; attempt < 3; attempt++) {
    const model = attempt < 2 ? models[0] : models[1]
    const delay = attempt === 0 ? 0 : attempt === 1 ? 1000 : 2000

    if (delay > 0) await sleep(delay)

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: config.LLM_MAX_TOKENS,
        tools: [briefingToolSchema],
        tool_choice: { type: 'tool', name: 'generate_briefing' },
        messages: [{ role: 'user', content: prompt }],
      })

      const toolUse = response.content.find(c => c.type === 'tool_use')
      if (!toolUse || toolUse.type !== 'tool_use') {
        throw new Error('No tool_use in response')
      }

      const result: LLMResult<BriefingOutput> = {
        data: toolUse.input as BriefingOutput,
        modelUsed: model,
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
      }

      // Cache result
      try {
        await redis.set(cacheKey, JSON.stringify(result), 'EX', ttlSeconds)
      } catch {
        // Non-fatal
      }

      return result
    } catch (error: unknown) {
      lastError = error as Error
      const status = (error as { status?: number }).status
      // Only retry on 529 (overloaded) or 5xx
      if (status && status < 500 && status !== 429) throw error
    }
  }

  throw lastError || new Error('LLM generation failed after retries')
}
