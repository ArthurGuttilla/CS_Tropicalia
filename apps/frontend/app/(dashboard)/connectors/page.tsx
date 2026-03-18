import { Plug } from 'lucide-react'
import { ConnectorCard } from '@/components/connectors/connector-card'

async function getConnectors() {
  const url = `${process.env.API_URL || 'http://localhost:3001'}/api/v1/connectors`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return { data: [] }
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  crm: 'CRM',
  analytics: 'Analytics',
  notifications: 'Notificações',
  ai: 'Inteligência Artificial',
  auth: 'Autenticação',
}

export default async function ConnectorsPage() {
  const { data: connectors } = await getConnectors()

  const byCategory = (connectors as any[]).reduce((acc: Record<string, any[]>, c: any) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})

  const categoryOrder = ['crm', 'analytics', 'ai', 'notifications', 'auth']
  const activeCount = (connectors as any[]).filter((c: any) => c.status === 'active' || c.status === 'mock' || c.status === 'webhook').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plug className="w-6 h-6" />
            Conectores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeCount} de {connectors.length} conectores ativos
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Ativos',
            count: (connectors as any[]).filter((c: any) => c.status === 'active').length,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
          },
          {
            label: 'Via Webhook',
            count: (connectors as any[]).filter((c: any) => c.status === 'webhook').length,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            label: 'Inativos',
            count: (connectors as any[]).filter((c: any) => c.status === 'inactive').length,
            color: 'text-slate-500',
            bg: 'bg-slate-50 border-slate-200',
          },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* By category */}
      <div className="space-y-8">
        {categoryOrder
          .filter((cat) => byCategory[cat]?.length > 0)
          .map((cat) => (
            <section key={cat}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {byCategory[cat].map((connector: any) => (
                  <ConnectorCard key={connector.id} connector={connector} />
                ))}
              </div>
            </section>
          ))}
      </div>

      {connectors.length === 0 && (
        <div className="text-center py-16">
          <Plug className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Nenhum conector disponível</p>
        </div>
      )}
    </div>
  )
}
