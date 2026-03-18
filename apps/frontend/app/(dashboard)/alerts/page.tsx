'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AlertTriangle, Bell, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { getSeverityColor, formatRelativeDate } from '@/lib/utils'

type AlertStatus = 'open' | 'acknowledged' | 'resolved'

interface Alert {
  id: string
  title: string
  body: string
  type: string
  severity: string
  status: AlertStatus
  created_at: string
  acknowledged_at: string | null
  account: {
    id: string
    name: string
    health_score: number
    health_tier: string
    tier: string
  }
}

const STATUS_LABELS: Record<AlertStatus, string> = {
  open: 'Aberto',
  acknowledged: 'Reconhecido',
  resolved: 'Resolvido',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('open')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterStatus !== 'all') params.status = filterStatus
      const data = await api.alerts.list(params)
      setAlerts(data.data)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to fetch alerts', err)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const handleAcknowledge = async (alertId: string) => {
    setProcessingId(alertId)
    try {
      await api.alerts.acknowledge(alertId)
      await fetchAlerts()
    } finally {
      setProcessingId(null)
    }
  }

  const handleResolve = async (alertId: string) => {
    setProcessingId(alertId)
    try {
      await api.alerts.resolve(alertId)
      await fetchAlerts()
    } finally {
      setProcessingId(null)
    }
  }

  const healthTierColor: Record<string, string> = {
    green: 'text-emerald-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alertas
          </h1>
          <p className="text-sm text-slate-500 mt-1">{total} alerta{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['open', 'acknowledged', 'resolved', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {status === 'all' ? 'Todos' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full mb-1" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
          <p className="text-slate-400">Nenhum alerta {filterStatus !== 'all' ? STATUS_LABELS[filterStatus as AlertStatus].toLowerCase() : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const severityClass = getSeverityColor(alert.severity)
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-5 ${alert.status === 'open' ? 'border-l-4' : 'border'} ${
                  alert.status === 'open'
                    ? alert.severity === 'critical' ? 'border-l-red-500 border-red-200' :
                      alert.severity === 'high' ? 'border-l-orange-500 border-orange-200' :
                      'border-l-yellow-500 border-yellow-200'
                    : 'border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{alert.body}</p>

                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                      <Link
                        href={`/accounts/${alert.account.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        {alert.account.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className={`font-medium ${healthTierColor[alert.account.health_tier] || ''}`}>
                        Score: {alert.account.health_score}
                      </span>
                      <span>{formatRelativeDate(alert.created_at)}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${severityClass}`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        alert.status === 'open' ? 'bg-red-100 text-red-700' :
                        alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {STATUS_LABELS[alert.status]}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {alert.status === 'open' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={processingId === alert.id}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reconhecer
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={processingId === alert.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
