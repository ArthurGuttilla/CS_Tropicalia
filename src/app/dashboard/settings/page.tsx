'use client'

import Header from '@/components/layout/Header'
import { ExternalLink, CheckCircle, Key, Server, BookOpen } from 'lucide-react'

const ENV_VARS = [
  {
    name: 'TROPICALIA_API_KEY',
    value: 'your_api_key_here',
    hint: 'Never commit this to git. Get it at tropicalia.dev.',
    secret: true,
  },
  {
    name: 'TROPICALIA_BASE_URL',
    value: 'https://api.tropicalia.dev',
    hint: 'Base URL for the Tropicalia API.',
    secret: false,
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    value: 'https://your-app.vercel.app',
    hint: 'Your deployed app URL — used in embed code generation.',
    secret: false,
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col overflow-y-auto">
      <Header
        title="Settings"
        description="Configure your Tropicalia integration and deployment"
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-2xl">

        {/* Environment Variables */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-gray-800">Environment Variables</h2>
          </div>

          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="text-sm text-amber-800">
              <strong>Security:</strong> Configure these in your{' '}
              <code className="rounded bg-amber-100 px-1 font-mono">.env</code> file
              locally and in your Vercel project settings for production.
              Never expose secret keys client-side.
            </p>
          </div>

          <div className="space-y-4">
            {ENV_VARS.map((v) => (
              <div key={v.name}>
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 rounded px-1.5 py-0.5">
                    {v.name}
                  </code>
                  {v.secret && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                      secret
                    </span>
                  )}
                </div>
                <code className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-600">
                  {v.name}={v.value}
                </code>
                <p className="mt-1 text-xs text-gray-400">{v.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-brand-500" />
            <a
              href="https://www.tropicalia.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:underline"
            >
              Get your API key at tropicalia.dev
            </a>
            <ExternalLink className="h-3.5 w-3.5 text-brand-400" />
          </div>
        </div>

        {/* Vercel Deployment */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-violet-600" />
            <h2 className="font-semibold text-gray-800">Vercel Deployment</h2>
          </div>
          <ol className="space-y-2.5 text-sm text-gray-600">
            {[
              'Push your code to GitHub',
              'Import the repository on vercel.com',
              'Add environment variables in Project → Settings → Environment Variables',
              'Deploy — Vercel will run npm install && next build automatically',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-3.5">
            <p className="text-sm text-blue-800">
              <strong>Widget config storage:</strong> On Vercel the filesystem is
              read-only. To persist widget configurations, add a{' '}
              <a
                href="https://vercel.com/docs/storage/vercel-kv"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Vercel KV
              </a>{' '}
              or{' '}
              <a
                href="https://upstash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Upstash Redis
              </a>{' '}
              database and update{' '}
              <code className="rounded bg-blue-100 px-1 font-mono text-xs">
                src/app/api/widget-config/[projectId]/route.ts
              </code>
              .
            </p>
          </div>
        </div>

        {/* Documentation */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Documentation</h2>
          </div>
          <ul className="space-y-2">
            {[
              {
                label: 'Tropicalia Getting Started',
                url: 'https://docs.tropicalia.dev/working-with-tropicalia/introduction',
              },
              {
                label: 'Tropicalia API Reference',
                url: 'https://docs.tropicalia.dev',
              },
              {
                label: 'Next.js 15 Docs',
                url: 'https://nextjs.org/docs',
              },
            ].map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
