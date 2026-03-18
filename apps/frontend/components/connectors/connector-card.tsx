'use client'

import { useState } from 'react'
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  KeyRound,
  Link2,
  Mail,
  MessageSquare,
  Plug,
  Users,
  Zap,
} from 'lucide-react'

const CONNECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  salesforce: Link2,
  mixpanel: BarChart3,
  slack: MessageSquare,
  tropicalia: Zap,
  anthropic: Bot,
  clerk: Users,
  resend: Mail,
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Ativo', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  webhook: { label: 'Via Webhook', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  mock: { label: 'Mock', color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-400' },
  inactive: { label: 'Inativo', color: 'text-slate-500 bg-slate-50 border-slate-200', dot: 'bg-slate-300' },
}

interface ConnectorCardProps {
  connector: {
    id: string
    name: string
    category: string
    description: string
    status: string
    configured: boolean
    webhook_url?: string
    channel?: string
    mock_mode?: boolean
    model?: string
    from_email?: string
  }
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const Icon = CONNECTOR_ICONS[connector.id] ?? Plug
  const statusCfg = STATUS_CONFIG[connector.status] ?? STATUS_CONFIG.inactive

  function copyWebhook() {
    if (!connector.webhook_url) return
    navigator.clipboard.writeText(connector.webhook_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasDetails = connector.webhook_url || connector.channel || connector.model || connector.from_email || connector.mock_mode !== undefined

  return (
    <div className={`bg-white rounded-xl border ${connector.configured ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-70'} flex flex-col`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${connector.configured ? 'bg-slate-900' : 'bg-slate-100'}`}>
            <Icon className={`w-5 h-5 ${connector.configured ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.color} flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 mb-1">{connector.name}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{connector.description}</p>
      </div>

      {/* Expandable details */}
      {hasDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-5 pb-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>

          {expanded && (
            <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
              {connector.webhook_url && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Webhook URL
                  </p>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    <code className="text-xs text-slate-700 truncate flex-1 min-w-0">{connector.webhook_url}</code>
                    <button onClick={copyWebhook} className="flex-shrink-0 text-slate-400 hover:text-slate-700 transition-colors">
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {connector.channel && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Canal: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{connector.channel}</code>
                </div>
              )}

              {connector.model && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                  Modelo: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{connector.model}</code>
                </div>
              )}

              {connector.from_email && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Remetente: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{connector.from_email}</code>
                </div>
              )}

              {connector.mock_mode && (
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <KeyRound className="w-3.5 h-3.5" />
                  Rodando em modo mock (sem chave de API)
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
