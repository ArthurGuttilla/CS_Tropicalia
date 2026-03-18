'use client'

import { useState, useCallback } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, Copy, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { BriefingSkeleton } from './briefing-skeleton'
import { formatRelativeDate } from '@/lib/utils'

interface BriefingData {
  id: string
  summary: string
  recent_interactions: Array<{ date: string; type: string; summary: string }>
  open_items: string[]
  risks: string[]
  opportunities: string[]
  suggested_talking_points: string[]
  model_used: string
  generated_at: string
  ttl_expires_at: string
}

interface BriefingCardProps {
  accountId: string
  initialBriefing?: BriefingData | null
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

export function BriefingCard({ accountId, initialBriefing }: BriefingCardProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(initialBriefing || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<number | null>(null)

  const fetchBriefing = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.briefings.get(accountId, force)
      setBriefing(data)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [accountId])

  const handleRefresh = () => fetchBriefing(true)

  const copyPoint = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const ttlExpired = briefing ? new Date(briefing.ttl_expires_at) < new Date() : false
  const ttlTime = briefing ? new Date(briefing.ttl_expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null

  if (!briefing && !loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center py-8">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Nenhum briefing gerado ainda</p>
          <button
            onClick={() => fetchBriefing(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gerar Briefing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Briefing Pré-Call</h2>
        </div>
        <div className="flex items-center gap-3">
          {briefing && (
            <div className={`flex items-center gap-1 text-xs ${ttlExpired ? 'text-orange-500' : 'text-slate-400'}`}>
              <Clock className="w-3.5 h-3.5" />
              {ttlExpired ? 'Desatualizado' : `Válido até ${ttlTime}`}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Gerando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}. Verifique se a ANTHROPIC_API_KEY está configurada.
        </div>
      )}

      {loading && <BriefingSkeleton />}

      {briefing && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{briefing.summary}</p>
          </div>

          {/* Talking Points */}
          <Section title="Talking Points Sugeridos" icon={Sparkles}>
            <ol className="space-y-2">
              {briefing.suggested_talking_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-semibold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-slate-600 flex-1">{point}</span>
                  <button
                    onClick={() => copyPoint(point, idx)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copiar"
                  >
                    {copied === idx
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <Copy className="w-4 h-4 text-slate-400" />
                    }
                  </button>
                </li>
              ))}
            </ol>
          </Section>

          {/* Risks */}
          {briefing.risks.length > 0 && (
            <Section title="Riscos" icon={AlertTriangle} defaultOpen={true}>
              <ul className="space-y-1.5">
                {briefing.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">●</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Opportunities */}
          {briefing.opportunities.length > 0 && (
            <Section title="Oportunidades" icon={TrendingUp} defaultOpen={false}>
              <ul className="space-y-1.5">
                {briefing.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">●</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Open Items */}
          {briefing.open_items.length > 0 && (
            <Section title="Itens em Aberto" icon={CheckCircle2} defaultOpen={false}>
              <ul className="space-y-1.5">
                {briefing.open_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-orange-400 mt-0.5 flex-shrink-0">□</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Recent Interactions */}
          {briefing.recent_interactions.length > 0 && (
            <Section title="Interações Recentes" icon={Clock} defaultOpen={false}>
              <div className="space-y-2">
                {briefing.recent_interactions.map((interaction, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <span className="text-slate-400 flex-shrink-0 text-xs mt-0.5">
                      {new Date(interaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase">{interaction.type}</span>
                      <p className="text-slate-600">{interaction.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
            <span>Gerado {formatRelativeDate(briefing.generated_at)}</span>
            <span>{briefing.model_used}</span>
          </div>
        </div>
      )}
    </div>
  )
}
