'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Copy, Check, ExternalLink, Code2, Globe } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface EmbedCodeSectionProps {
  projectId: string
  appUrl: string
}

export default function EmbedCodeSection({
  projectId,
  appUrl,
}: EmbedCodeSectionProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const { success } = useToast()

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    success('Copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  const scriptSnippet = `<!-- CS Tropicalia Chat Widget -->
<script
  src="${appUrl}/embed.js"
  data-project-id="${projectId}"
  data-app-url="${appUrl}"
  defer
></script>`

  const iframeSnippet = `<iframe
  src="${appUrl}/widget/${projectId}"
  width="400"
  height="600"
  style="border:none;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);"
  title="Chat Widget"
></iframe>`

  const reactSnippet = `import { useEffect } from 'react'

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '${appUrl}/embed.js'
    script.dataset.projectId = '${projectId}'
    script.dataset.appUrl = '${appUrl}'
    script.defer = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  return null
}`

  const CodeBlock = ({
    code,
    id,
    lang = 'html',
  }: {
    code: string
    id: string
    lang?: string
  }) => (
    <div className="relative">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-4 py-2">
        <span className="text-xs font-mono text-gray-400">{lang}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy(code, id)}
          className="h-6 gap-1 text-xs"
        >
          {copied === id ? (
            <Check className="h-3 w-3 text-brand-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied === id ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-b-xl border border-gray-200 bg-gray-900 p-4 text-xs text-gray-100 scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Option 1: Script tag */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Option 1: Script Tag (Recommended)
            </h3>
            <p className="text-xs text-gray-500">
              Add this snippet before the closing{' '}
              <code className="rounded bg-gray-100 px-1 font-mono">&lt;/body&gt;</code>{' '}
              tag of your HTML.
            </p>
          </div>
        </div>
        <CodeBlock code={scriptSnippet} id="script" lang="html" />
        <p className="mt-2 text-xs text-gray-400">
          This renders a floating chat button. Clicking it opens a chat panel
          using your widget configuration.
        </p>
      </div>

      {/* Option 2: iFrame */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Option 2: Inline iFrame
            </h3>
            <p className="text-xs text-gray-500">
              Embed the chat widget inline in your page layout.
            </p>
          </div>
        </div>
        <CodeBlock code={iframeSnippet} id="iframe" lang="html" />
      </div>

      {/* Option 3: React component */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
            <span className="text-xs font-bold">⚛</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Option 3: React / Next.js Component
            </h3>
            <p className="text-xs text-gray-500">
              Add the widget to your React application.
            </p>
          </div>
        </div>
        <CodeBlock code={reactSnippet} id="react" lang="tsx" />
      </div>

      {/* Widget URL */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">
          Direct Widget URL
        </h4>
        <div className="flex items-center gap-3">
          <code className="flex-1 truncate rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-600">
            {appUrl}/widget/{projectId}
          </code>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              copy(`${appUrl}/widget/${projectId}`, 'url')
            }
          >
            {copied === 'url' ? (
              <Check className="h-3.5 w-3.5 text-brand-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <a
            href={`/widget/${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
