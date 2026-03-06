'use client'

import Header from '@/components/layout/Header'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Key, ExternalLink, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('tropicalia_api_key_preview') ?? ''
      : ''
  )
  const [saved, setSaved] = useState(false)
  const { success } = useToast()

  const handleSave = () => {
    // In a real app, this would be stored server-side as an env var
    // Here we just show where it should be configured
    success('See .env file to configure your API key securely.')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      <Header
        title="Settings"
        description="Configure your Tropicalia integration"
      />

      <div className="flex-1 px-6 py-6 max-w-2xl space-y-6">
        {/* API Configuration */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-gray-800">
              Tropicalia API Configuration
            </h2>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
            <p className="text-sm text-amber-800">
              <strong>Security note:</strong> API keys should be stored as
              environment variables, not in the browser. Configure your API key
              in the <code className="rounded bg-amber-100 px-1 font-mono">.env</code> file.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment Variable
              </label>
              <div className="flex items-center gap-3">
                <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-600">
                  TROPICALIA_API_KEY=your_key_here
                </code>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add this to your <code>.env</code> file (never commit to git).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Base URL
              </label>
              <code className="block rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-600">
                TROPICALIA_BASE_URL=https://api.tropicalia.dev
              </code>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.tropicalia.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
            >
              Get your API key at tropicalia.dev
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* App URL */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-800">
            Application URL
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            This URL is used to generate embed codes for your widgets. Make
            sure it matches your deployment URL.
          </p>
          <Input
            label="App URL"
            defaultValue={
              typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost:3000'
            }
            hint="Set NEXT_PUBLIC_APP_URL in your .env file."
            readOnly
          />
        </div>

        {/* Documentation */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-800">Documentation</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://docs.tropicalia.dev/working-with-tropicalia/introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-brand-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Tropicalia Getting Started Guide
              </a>
            </li>
            <li>
              <a
                href="https://docs.tropicalia.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-brand-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Full API Documentation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
