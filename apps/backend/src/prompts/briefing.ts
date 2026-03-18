import { ContextBundle } from '../mocks/tropicalia'

export function buildBriefingPrompt(bundle: ContextBundle): string {
  const { accountMeta, interactions, openTickets, recentSignals, usageTrend } = bundle

  const renewalInfo = accountMeta.days_until_renewal !== null
    ? `Renovação em ${accountMeta.days_until_renewal} dias`
    : 'Sem data de renovação definida'

  const usageSummary = `WAU atual: ${usageTrend.current_wau} (baseline: ${usageTrend.baseline_wau}, variação: ${usageTrend.delta_pct > 0 ? '+' : ''}${usageTrend.delta_pct}%)`

  const interactionLines = interactions.length > 0
    ? interactions.map(i => `- ${new Date(i.occurred_at).toLocaleDateString('pt-BR')} [${i.type}]: ${i.subject}${i.summary ? ` — ${i.summary}` : ''}`).join('\n')
    : '- Nenhuma interação registrada no período'

  const ticketLines = openTickets.length > 0
    ? openTickets.map(t => `- [${t.priority.toUpperCase()}] ${t.title} — ${t.days_open} dias aberto${t.sla_breach ? ' ⚠️ SLA BREACH' : ''}`).join('\n')
    : '- Nenhum ticket aberto'

  const signalLines = recentSignals.length > 0
    ? recentSignals.map(s => `- [${s.severity}] ${s.type}: score_impact=${s.score_impact}`).join('\n')
    : '- Nenhum sinal de risco ativo'

  return `Você é um assistente especialista em Customer Success. Gere um briefing pré-call estruturado e objetivo para o CSM.

DADOS DA CONTA:
Nome: ${accountMeta.name}
Tier: ${accountMeta.tier}
ARR: $${accountMeta.arr.toLocaleString()}
Health Score: ${accountMeta.health_score}/100 (${accountMeta.health_tier})
Champion: ${accountMeta.champion_name || 'Não identificado'} (${accountMeta.champion_email || 'sem email'})
Produtos: ${accountMeta.products.join(', ') || 'N/A'}
${renewalInfo}

USO DO PRODUTO (últimos 30 dias):
${usageSummary}
Tendência: ${usageTrend.trend}

INTERAÇÕES RECENTES:
${interactionLines}

TICKETS ABERTOS:
${ticketLines}

SINAIS DE RISCO ATIVOS:
${signalLines}

Com base nesses dados, gere um briefing profissional em português do Brasil com:
1. Um resumo executivo (2-4 frases) do momento atual do cliente
2. Lista das interações mais relevantes recentes
3. Itens em aberto que precisam de atenção
4. Principais riscos identificados
5. Oportunidades de expansão ou melhoria
6. 3-5 talking points sugeridos para a próxima interação

Seja direto, objetivo e acionável. Foco no que o CSM precisa saber AGORA.`
}

export const briefingToolSchema = {
  name: 'generate_briefing',
  description: 'Gera um briefing estruturado pré-call para o CSM',
  input_schema: {
    type: 'object' as const,
    properties: {
      summary: {
        type: 'string',
        description: 'Resumo executivo do momento atual do cliente (2-4 frases)',
      },
      recent_interactions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            type: { type: 'string' },
            summary: { type: 'string' },
          },
          required: ['date', 'type', 'summary'],
        },
      },
      open_items: {
        type: 'array',
        items: { type: 'string' },
        description: 'Lista de itens pendentes e ações necessárias',
      },
      risks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Principais riscos identificados',
      },
      opportunities: {
        type: 'array',
        items: { type: 'string' },
        description: 'Oportunidades de expansão ou melhoria',
      },
      suggested_talking_points: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 talking points sugeridos para a próxima interação',
      },
    },
    required: ['summary', 'recent_interactions', 'open_items', 'risks', 'opportunities', 'suggested_talking_points'],
  },
}
