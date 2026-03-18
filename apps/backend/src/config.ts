import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_BASE_URL: z.string().default('http://localhost:3001'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ANTHROPIC_API_KEY: z.string().default(''),
  LLM_PRIMARY_MODEL: z.string().default('claude-sonnet-4-6'),
  LLM_FALLBACK_MODEL: z.string().default('claude-haiku-4-5-20251001'),
  LLM_MAX_TOKENS: z.coerce.number().default(4096),
  TROPICALIA_MOCK: z.string().transform(v => v === 'true').default('true'),
  TROPICALIA_API_URL: z.string().default('https://api.tropicalia.ai'),
  TROPICALIA_API_KEY: z.string().default(''),
  SLACK_BOT_TOKEN: z.string().default(''),
  SLACK_SIGNING_SECRET: z.string().default(''),
  SLACK_ALERTS_CHANNEL: z.string().default('#cs-alerts'),
  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('alerts@cstropicalia.dev'),
  INTERNAL_API_KEY: z.string().default('dev-internal-key'),
  BRIEFING_TTL_HOURS: z.coerce.number().default(4),
  CONTEXT_CACHE_TTL_MINUTES: z.coerce.number().default(30),
})

const parsed = configSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data
