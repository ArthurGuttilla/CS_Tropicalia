import { Job } from 'bullmq'
import { createWorker, riskScoringQueue } from '../lib/queue'
import { scoreAccount, scoreAllAccounts } from '../services/RiskScoringService'

interface ScoreAccountJob {
  accountId: string
}

export function startRiskScoringWorker() {
  const worker = createWorker<ScoreAccountJob | Record<string, never>>(
    'risk-scoring',
    async (job: Job) => {
      if (job.name === 'score-all-accounts') {
        await scoreAllAccounts()
      } else if (job.name === 'score-account') {
        const data = job.data as ScoreAccountJob
        await scoreAccount(data.accountId)
      }
    },
    5
  )

  worker.on('failed', (job, err) => {
    console.error(`[RiskScoringWorker] Job ${job?.name} failed:`, err.message)
  })

  worker.on('completed', (job) => {
    console.log(`[RiskScoringWorker] Job ${job.name} completed`)
  })

  // Schedule cron: every 6 hours
  riskScoringQueue.add(
    'score-all-accounts',
    {},
    {
      repeat: { cron: '0 */6 * * *' },
      jobId: 'score-all-cron',
    }
  ).catch(err => console.error('Failed to register cron job:', err.message))

  console.log('[RiskScoringWorker] Started, cron: every 6 hours')
  return worker
}
