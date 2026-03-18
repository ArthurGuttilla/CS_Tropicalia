import { PrismaClient, Tier, HealthTier, SignalType, SignalSeverity, AlertStatus, InteractionType, TicketPriority, TicketStatus } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up
  await prisma.alert.deleteMany()
  await prisma.briefing.deleteMany()
  await prisma.riskSignal.deleteMany()
  await prisma.usageSnapshot.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Users (CSMs)
  const csm1 = await prisma.user.create({
    data: {
      clerk_id: 'user_seed_csm1',
      email: 'marina.k@cstropicalia.dev',
      name: 'Marina K.',
      role: 'csm',
    },
  })

  const csm2 = await prisma.user.create({
    data: {
      clerk_id: 'user_seed_csm2',
      email: 'rafael.l@cstropicalia.dev',
      name: 'Rafael L.',
      role: 'csm',
    },
  })

  // Accounts
  const accounts = [
    // GREEN accounts
    {
      name: 'Nubank Enterprise',
      tier: Tier.enterprise,
      arr: 240000,
      mrr: 20000,
      industry: 'fintech',
      region: 'latam',
      health_score: 92,
      health_tier: HealthTier.green,
      renewal_date: daysFromNow(180),
      csm_id: csm1.id,
      champion_name: 'Carlos Mendes',
      champion_email: 'carlos.mendes@nubank.com',
      executive_sponsor: 'Thais Rocha',
      products: ['core', 'analytics', 'automation'],
      integrations_active: ['salesforce', 'slack', 'mixpanel'],
      tropicalia_context_id: 'ctx_nubank_001',
      wau_base: 120,
      scenario: 'green',
    },
    {
      name: 'Creditas',
      tier: Tier.growth,
      arr: 84000,
      mrr: 7000,
      industry: 'fintech',
      region: 'latam',
      health_score: 88,
      health_tier: HealthTier.green,
      renewal_date: daysFromNow(210),
      csm_id: csm2.id,
      champion_name: 'Fernanda Alves',
      champion_email: 'fernanda@creditas.com',
      executive_sponsor: null,
      products: ['core', 'analytics'],
      integrations_active: ['hubspot', 'slack', 'mixpanel'],
      tropicalia_context_id: 'ctx_creditas_001',
      wau_base: 65,
      scenario: 'green',
    },
    // YELLOW accounts
    {
      name: 'Totvs Mid-Market',
      tier: Tier.growth,
      arr: 60000,
      mrr: 5000,
      industry: 'erp',
      region: 'latam',
      health_score: 68,
      health_tier: HealthTier.yellow,
      renewal_date: daysFromNow(90),
      csm_id: csm1.id,
      champion_name: 'André Lima',
      champion_email: 'andre.lima@totvs.com',
      executive_sponsor: 'Roberto Faria',
      products: ['core'],
      integrations_active: ['salesforce', 'slack'],
      tropicalia_context_id: 'ctx_totvs_001',
      wau_base: 40,
      scenario: 'yellow_silence',
    },
    {
      name: 'RD Station',
      tier: Tier.growth,
      arr: 72000,
      mrr: 6000,
      industry: 'martech',
      region: 'latam',
      health_score: 62,
      health_tier: HealthTier.yellow,
      renewal_date: daysFromNow(120),
      csm_id: csm2.id,
      champion_name: 'Patricia Sousa',
      champion_email: 'patricia@rdstation.com',
      executive_sponsor: null,
      products: ['core', 'analytics'],
      integrations_active: ['salesforce', 'mixpanel'],
      tropicalia_context_id: 'ctx_rdstation_001',
      wau_base: 55,
      scenario: 'yellow_tickets',
    },
    {
      name: 'Conta Azul',
      tier: Tier.starter,
      arr: 24000,
      mrr: 2000,
      industry: 'accounting',
      region: 'latam',
      health_score: 71,
      health_tier: HealthTier.yellow,
      renewal_date: daysFromNow(150),
      csm_id: csm1.id,
      champion_name: 'Lucas Ribeiro',
      champion_email: 'lucas@contaazul.com',
      executive_sponsor: null,
      products: ['core'],
      integrations_active: ['hubspot', 'slack'],
      tropicalia_context_id: 'ctx_contaazul_001',
      wau_base: 18,
      scenario: 'yellow',
    },
    // RED accounts
    {
      name: 'Acme Corp',
      tier: Tier.enterprise,
      arr: 120000,
      mrr: 10000,
      industry: 'manufacturing',
      region: 'latam',
      health_score: 38,
      health_tier: HealthTier.red,
      renewal_date: daysFromNow(45),
      csm_id: csm1.id,
      champion_name: 'João Souza',
      champion_email: 'joao@acmecorp.com',
      executive_sponsor: 'Ana Lima',
      products: ['core', 'analytics'],
      integrations_active: ['salesforce', 'slack', 'mixpanel'],
      tropicalia_context_id: 'ctx_acme_001',
      wau_base: 45,
      scenario: 'red_usage_drop',
    },
    {
      name: 'Loggi Tech',
      tier: Tier.enterprise,
      arr: 180000,
      mrr: 15000,
      industry: 'logistics',
      region: 'latam',
      health_score: 44,
      health_tier: HealthTier.red,
      renewal_date: daysFromNow(30),
      csm_id: csm2.id,
      champion_name: 'Renata Dias',
      champion_email: 'renata@loggi.com',
      executive_sponsor: 'Paulo Vaz',
      products: ['core', 'analytics', 'automation'],
      integrations_active: ['salesforce', 'slack', 'jira'],
      tropicalia_context_id: 'ctx_loggi_001',
      wau_base: 90,
      scenario: 'red_champion_change',
    },
    {
      name: 'Movile Holdings',
      tier: Tier.enterprise,
      arr: 300000,
      mrr: 25000,
      industry: 'telecom',
      region: 'latam',
      health_score: 29,
      health_tier: HealthTier.red,
      renewal_date: daysFromNow(15),
      csm_id: csm1.id,
      champion_name: 'Bruno Costa',
      champion_email: 'bruno@movile.com',
      executive_sponsor: 'Sandra Fonseca',
      products: ['core', 'analytics', 'automation'],
      integrations_active: ['salesforce', 'slack', 'mixpanel', 'jira'],
      tropicalia_context_id: 'ctx_movile_001',
      wau_base: 200,
      scenario: 'red_critical',
    },
  ]

  for (const acc of accounts) {
    const { wau_base, scenario, ...accountData } = acc as typeof acc & { wau_base: number; scenario: string }

    const account = await prisma.account.create({ data: accountData })

    // Generate 35 days of usage snapshots
    for (let day = 35; day >= 0; day--) {
      let wau = wau_base
      if (scenario === 'red_usage_drop' && day <= 14) {
        wau = Math.floor(wau_base * (0.25 + Math.random() * 0.15))
      } else if (scenario === 'red_critical' && day <= 10) {
        wau = Math.floor(wau_base * (0.15 + Math.random() * 0.1))
      } else if (scenario === 'yellow_silence' && day <= 7) {
        wau = Math.floor(wau_base * (0.65 + Math.random() * 0.1))
      } else {
        wau = Math.floor(wau_base * (0.85 + Math.random() * 0.3))
      }

      await prisma.usageSnapshot.create({
        data: {
          account_id: account.id,
          snapshot_date: daysAgo(day),
          weekly_active_users: Math.max(wau, 1),
          monthly_active_users: Math.floor(wau * 2.8),
          api_calls: Math.floor(wau * 45),
          feature_usage: {
            dashboard: Math.floor(wau * 0.9),
            reports: Math.floor(wau * 0.6),
            integrations: Math.floor(wau * 0.4),
            automations: Math.floor(wau * 0.3),
          },
        },
      })
    }

    // Interactions
    const interactionScenarios: Record<string, Array<{ daysAgo_: number; type: InteractionType; subject: string; summary: string }>> = {
      green: [
        { daysAgo_: 3, type: InteractionType.call, subject: 'QBR Q1 2025', summary: 'Excelente reunião. Cliente muito satisfeito com os resultados de adoção. Discutimos expansão para novos times.' },
        { daysAgo_: 10, type: InteractionType.email, subject: 'Follow-up onboarding analytics', summary: 'Cliente confirmou que o módulo de analytics está funcionando conforme esperado.' },
        { daysAgo_: 18, type: InteractionType.slack_message, subject: 'Feedback sobre novo recurso', summary: 'Champion elogiou a nova funcionalidade de automação.' },
      ],
      yellow_silence: [
        { daysAgo_: 20, type: InteractionType.call, subject: 'Check-in mensal', summary: 'Reunião OK mas champion pareceu distraído. Mencionou reestruturação interna.' },
        { daysAgo_: 30, type: InteractionType.email, subject: 'Revisão de adoção', summary: 'Email enviado sobre oportunidades de expansão. Sem resposta até agora.' },
      ],
      yellow_tickets: [
        { daysAgo_: 5, type: InteractionType.call, subject: 'Call técnica sobre integração', summary: 'Time técnico do cliente com dificuldades na integração de API.' },
        { daysAgo_: 12, type: InteractionType.email, subject: 'Atualização de roadmap', summary: 'Cliente perguntou sobre feature X no roadmap.' },
        { daysAgo_: 8, type: InteractionType.support_ticket, subject: 'Bug na integração Salesforce', summary: 'Erro na sincronização de dados.' },
      ],
      yellow: [
        { daysAgo_: 8, type: InteractionType.call, subject: 'Check-in', summary: 'Reunião de acompanhamento normal. Sem grandes novidades.' },
        { daysAgo_: 15, type: InteractionType.email, subject: 'Novas funcionalidades', summary: 'Apresentamos as novidades do produto.' },
      ],
      red_usage_drop: [
        { daysAgo_: 18, type: InteractionType.call, subject: 'Check-in urgente', summary: 'Champion João mencionou que o time está com prioridades desviadas para um projeto interno. Uso da plataforma caiu drasticamente.' },
        { daysAgo_: 25, type: InteractionType.email, subject: 'Follow-up proposta de upsell', summary: 'Proposta de expansão para o módulo analytics enviada. Sem resposta.' },
        { daysAgo_: 30, type: InteractionType.slack_message, subject: 'Pergunta sobre roadmap', summary: 'João perguntou se a feature de relatórios customizados está no roadmap.' },
      ],
      red_champion_change: [
        { daysAgo_: 7, type: InteractionType.email, subject: 'Mudança de ponto de contato', summary: 'Email de Renata informando que ela está saindo da empresa. Novo contato será Marco Oliveira.' },
        { daysAgo_: 14, type: InteractionType.call, subject: 'Discussão sobre renovação', summary: 'Renata mencionou dificuldades de ROI. Disse que vai conversar com a diretoria antes da renovação.' },
        { daysAgo_: 21, type: InteractionType.support_ticket, subject: 'Falha crítica na integração', summary: 'P0 ticket aberto. Sistema offline por 2h.' },
      ],
      red_critical: [
        { daysAgo_: 2, type: InteractionType.support_ticket, subject: 'Performance degradada', summary: 'Time reportou lentidão severa. SLA em risco.' },
        { daysAgo_: 10, type: InteractionType.call, subject: 'Reunião de crise', summary: 'VP do cliente ameaçou cancelar contrato. Pediu SLA de 99.9%.' },
        { daysAgo_: 16, type: InteractionType.email, subject: 'Ata reunião de crise', summary: 'Action items enviados. Aguardando resolução dos tickets P0.' },
        { daysAgo_: 22, type: InteractionType.call, subject: 'QBR - Resultados decepcionantes', summary: 'Adoção muito abaixo do esperado. Apenas 15% do time usando a plataforma.' },
      ],
    }

    const interactions = interactionScenarios[scenario] || interactionScenarios.green
    for (const interaction of interactions) {
      const { daysAgo_: dAgo, ...intData } = interaction
      await prisma.interaction.create({
        data: {
          account_id: account.id,
          ...intData,
          occurred_at: daysAgo(dAgo),
          csm_id: account.csm_id,
          source: 'salesforce',
        },
      })
    }

    // Tickets
    if (scenario.includes('yellow_tickets') || scenario.includes('red')) {
      await prisma.ticket.create({
        data: {
          account_id: account.id,
          external_id: `SF-${randomInt(1000, 9999)}`,
          title: 'Erro na sincronização de dados com Salesforce',
          priority: TicketPriority.p1,
          status: TicketStatus.open,
          opened_at: daysAgo(8),
          sla_breach: scenario === 'red_critical',
        },
      })
    }

    if (scenario === 'red_critical') {
      await prisma.ticket.create({
        data: {
          account_id: account.id,
          external_id: `SF-${randomInt(1000, 9999)}`,
          title: 'Performance degradada — sistema lento para todos usuários',
          priority: TicketPriority.p0,
          status: TicketStatus.in_progress,
          opened_at: daysAgo(3),
          sla_breach: true,
        },
      })
      await prisma.ticket.create({
        data: {
          account_id: account.id,
          external_id: `SF-${randomInt(1000, 9999)}`,
          title: 'Falha no módulo de relatórios',
          priority: TicketPriority.p1,
          status: TicketStatus.open,
          opened_at: daysAgo(6),
          sla_breach: true,
        },
      })
    }

    if (scenario === 'red_champion_change') {
      await prisma.ticket.create({
        data: {
          account_id: account.id,
          external_id: `SF-${randomInt(1000, 9999)}`,
          title: 'Falha crítica na integração — sistema offline',
          priority: TicketPriority.p0,
          status: TicketStatus.resolved,
          opened_at: daysAgo(21),
          resolved_at: daysAgo(19),
          sla_breach: false,
        },
      })
    }

    // Risk signals for red/yellow accounts
    if (scenario === 'red_usage_drop') {
      const signal = await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.usage_drop,
          severity: SignalSeverity.high,
          score_impact: -20,
          evidence: {
            metric: 'weekly_active_users',
            previous_value: 45,
            current_value: 12,
            delta_pct: -73.3,
            window_days: 14,
          },
          suggested_action: {
            type: 'reach_out',
            template: 'usage_drop_outreach',
            urgency: 'within_48h',
          },
          detected_at: daysAgo(2),
        },
      })

      const interactionSilenceSignal = await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.interaction_silence,
          severity: SignalSeverity.medium,
          score_impact: -15,
          evidence: {
            last_interaction_date: daysAgo(18).toISOString(),
            days_since_last_interaction: 18,
            threshold_days: 14,
          },
          suggested_action: {
            type: 'reach_out',
            template: 'silence_check_in',
            urgency: 'within_48h',
          },
          detected_at: daysAgo(4),
        },
      })

      // Alert for usage drop
      await prisma.alert.create({
        data: {
          account_id: account.id,
          risk_signal_id: signal.id,
          type: 'signal_detected',
          severity: 'high',
          title: `⚠️ Queda crítica de uso — ${account.name}`,
          body: `WAU caiu 73% nas últimas 2 semanas (45 → 12 usuários). Health score: ${account.health_score}. Ação urgente necessária.`,
          status: AlertStatus.open,
        },
      })

      // Pre-generated briefing
      const ttl = new Date()
      ttl.setHours(ttl.getHours() + 4)
      await prisma.briefing.create({
        data: {
          account_id: account.id,
          ttl_expires_at: ttl,
          context_window_days: 30,
          summary: `Acme Corp está em momento crítico: o uso da plataforma despencou 73% nas últimas 2 semanas (de 45 para 12 usuários ativos semanais). João Souza, o champion, mencionou na última call que o time está com atenção voltada para um projeto interno. A renovação está em 45 dias com ARR de $120k em risco. Há um ticket P1 aberto há 8 dias sem resolução.`,
          recent_interactions: [
            { date: daysAgo(18).toISOString().split('T')[0], type: 'call', summary: 'Champion mencionou prioridades desviadas para projeto interno' },
            { date: daysAgo(25).toISOString().split('T')[0], type: 'email', summary: 'Proposta de upsell enviada — sem resposta' },
          ],
          open_items: [
            'Ticket P1 #SF-1234 aberto há 8 dias sem resolução',
            'Proposta de upsell analytics pendente de resposta',
            'Renovação em 45 dias ($120k ARR)',
          ],
          risks: [
            'Uso caiu 73% em 2 semanas — sinal grave de desengajamento',
            'Champion com atenção desviada, pode estar reduzindo prioridade do produto',
            'Renovação próxima sem histórico de valor demonstrado recente',
          ],
          opportunities: [
            'Expansão para módulo analytics com desconto de renovação',
            'Novo recurso de automação alinhado ao caso de uso prometido na venda',
          ],
          suggested_talking_points: [
            'Entender o que está ocupando o time internamente e quando a atenção volta',
            'Revisar juntos os resultados dos últimos 90 dias para reforçar valor',
            'Confirmar se João ainda é o champion ou se há novo decisor',
            'Propor sessão de treinamento para reativar usuários inativos',
          ],
          model_used: 'claude-sonnet-4-6',
          prompt_tokens: 1240,
          completion_tokens: 420,
        },
      })
    }

    if (scenario === 'red_champion_change') {
      const champSignal = await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.champion_change,
          severity: SignalSeverity.critical,
          score_impact: -12,
          evidence: {
            previous_champion: 'renata@loggi.com',
            new_contact: 'Marco Oliveira',
            detected_from: 'email',
            change_date: daysAgo(7).toISOString(),
          },
          suggested_action: {
            type: 'reach_out',
            template: 'champion_change_intro',
            urgency: 'within_24h',
          },
          detected_at: daysAgo(7),
        },
      })

      const usageSignal = await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.usage_drop,
          severity: SignalSeverity.high,
          score_impact: -20,
          evidence: {
            metric: 'weekly_active_users',
            previous_value: 90,
            current_value: 38,
            delta_pct: -57.8,
            window_days: 14,
          },
          suggested_action: {
            type: 'reach_out',
            template: 'usage_drop_outreach',
            urgency: 'within_48h',
          },
          detected_at: daysAgo(3),
        },
      })

      await prisma.alert.create({
        data: {
          account_id: account.id,
          risk_signal_id: champSignal.id,
          type: 'signal_detected',
          severity: 'critical',
          title: `🚨 Champion mudou — renovação em risco — ${account.name}`,
          body: `Renata Dias saiu da empresa. Novo contato: Marco Oliveira. Nenhuma relação estabelecida. Renovação em 30 dias. WAU também caiu 58%.`,
          status: AlertStatus.open,
        },
      })

      const ttl = new Date()
      ttl.setHours(ttl.getHours() + 4)
      await prisma.briefing.create({
        data: {
          account_id: account.id,
          ttl_expires_at: ttl,
          context_window_days: 30,
          summary: `Loggi Tech enfrenta uma dupla crise: mudança de champion e queda de uso. Renata Dias, que era a principal advogada interna do produto, saiu da empresa há 7 dias. O novo contato é Marco Oliveira, com quem ainda não há relacionamento. Somado a isso, o WAU caiu 58% nas últimas 2 semanas. A renovação é em 30 dias com $180k de ARR em jogo.`,
          recent_interactions: [
            { date: daysAgo(7).toISOString().split('T')[0], type: 'email', summary: 'Renata informou saída da empresa e indicou Marco Oliveira como novo contato' },
            { date: daysAgo(14).toISOString().split('T')[0], type: 'call', summary: 'Renata mencionou dificuldades de ROI e necessidade de aprovação da diretoria' },
            { date: daysAgo(21).toISOString().split('T')[0], type: 'support_ticket', summary: 'P0 resolvido: sistema offline por 2h' },
          ],
          open_items: [
            'Apresentar produto ao novo champion Marco Oliveira',
            'Reunião executiva necessária para discussão de renovação',
            'Demonstrar ROI para a nova liderança',
          ],
          risks: [
            'Mudança de champion sem relacionamento estabelecido com o sucessor',
            'Renata mencionou dificuldades de ROI antes de sair',
            'WAU caiu 58% — sinal de desengajamento crescente',
            'Renovação em 30 dias — janela crítica',
          ],
          opportunities: [
            'Nova liderança pode trazer nova perspectiva e orçamento',
            'Caso de uso de automação pode justificar expansão',
          ],
          suggested_talking_points: [
            'Fazer onboarding executivo com Marco Oliveira — apresentar valor já entregue',
            'Trazer dados concretos de ROI: horas economizadas, processos automatizados',
            'Propor QBR executivo com VP Paulo Vaz para alinhar renovação',
            'Entender se Marco tem autoridade de renovação ou se há outro decisor',
          ],
          model_used: 'claude-sonnet-4-6',
          prompt_tokens: 1380,
          completion_tokens: 490,
        },
      })
    }

    if (scenario === 'red_critical') {
      const p0Signal = await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.ticket_sla_breach,
          severity: SignalSeverity.critical,
          score_impact: -18,
          evidence: {
            open_p0_tickets: 1,
            open_p1_tickets: 1,
            avg_resolution_days: 3,
            sla_breach_count: 2,
          },
          suggested_action: {
            type: 'escalate',
            template: 'sla_breach_escalation',
            urgency: 'immediate',
          },
          detected_at: daysAgo(1),
        },
      })

      await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.usage_drop,
          severity: SignalSeverity.critical,
          score_impact: -20,
          evidence: {
            metric: 'weekly_active_users',
            previous_value: 200,
            current_value: 28,
            delta_pct: -86,
            window_days: 10,
          },
          suggested_action: {
            type: 'emergency_call',
            template: 'critical_usage_drop',
            urgency: 'immediate',
          },
          detected_at: daysAgo(2),
        },
      })

      await prisma.alert.create({
        data: {
          account_id: account.id,
          risk_signal_id: p0Signal.id,
          type: 'signal_detected',
          severity: 'critical',
          title: `🚨 CRÍTICO — 2 tickets em SLA breach — ${account.name}`,
          body: `P0 + P1 em breach de SLA. WAU caiu 86%. VP ameaçou cancelar. Renovação em 15 dias. ARR: $300k.`,
          status: AlertStatus.open,
        },
      })

      const ttl = new Date()
      ttl.setHours(ttl.getHours() + 4)
      await prisma.briefing.create({
        data: {
          account_id: account.id,
          ttl_expires_at: ttl,
          context_window_days: 30,
          summary: `Movile Holdings está em estado crítico. O WAU despencou 86% em 10 dias (200 → 28 usuários), há 2 tickets em breach de SLA (P0 + P1), e o VP da empresa ameaçou cancelar o contrato na última reunião. A renovação é em apenas 15 dias com $300k de ARR em risco. Esta conta exige intervenção imediata da liderança de CS.`,
          recent_interactions: [
            { date: daysAgo(2).toISOString().split('T')[0], type: 'support_ticket', summary: 'P0: Performance degradada — sistema lento para todos' },
            { date: daysAgo(10).toISOString().split('T')[0], type: 'call', summary: 'VP ameaçou cancelar contrato. Exigiu SLA 99.9%' },
            { date: daysAgo(16).toISOString().split('T')[0], type: 'email', summary: 'Ata de reunião de crise enviada com action items' },
            { date: daysAgo(22).toISOString().split('T')[0], type: 'call', summary: 'QBR: adoção muito abaixo do esperado — apenas 15% do time usando' },
          ],
          open_items: [
            'P0 ticket: Performance degradada — em andamento há 3 dias',
            'P1 ticket: Falha no módulo de relatórios — aberto há 6 dias',
            'Compromissos de SLA assumidos na reunião de crise',
            'Renovação em 15 dias sem confirmação',
          ],
          risks: [
            'VP ameaçou cancelar — churn iminente',
            '2 tickets em breach de SLA — credibilidade comprometida',
            'WAU caiu 86% em 10 dias — produto não está sendo usado',
            'Renovação crítica em 15 dias',
          ],
          opportunities: [
            'Resolução rápida dos P0/P1 pode reverter sentimento',
            'Crédito de serviço pode suavizar negociação de renovação',
          ],
          suggested_talking_points: [
            'Atualizar sobre status dos tickets P0/P1 com timeline de resolução',
            'Escalar para liderança de Engenharia para demonstrar prioridade',
            'Oferecer crédito de serviço pelo downtime como gesto de boa fé',
            'Propor plano de recuperação com milestones claros para a renovação',
            'Identificar quem na Movile tem poder de decisão final sobre renovação',
          ],
          model_used: 'claude-sonnet-4-6',
          prompt_tokens: 1520,
          completion_tokens: 560,
        },
      })
    }

    if (scenario === 'yellow_silence') {
      await prisma.riskSignal.create({
        data: {
          account_id: account.id,
          type: SignalType.interaction_silence,
          severity: SignalSeverity.medium,
          score_impact: -15,
          evidence: {
            last_interaction_date: daysAgo(20).toISOString(),
            days_since_last_interaction: 20,
            threshold_days: 14,
          },
          suggested_action: {
            type: 'reach_out',
            template: 'silence_check_in',
            urgency: 'within_48h',
          },
          detected_at: daysAgo(6),
        },
      })
    }

    console.log(`  ✓ ${account.name} (${account.health_tier})`)
  }

  console.log('\n✅ Seed completo!')
  console.log(`  ${accounts.length} contas criadas`)
  console.log('  CSMs: marina.k@cstropicalia.dev, rafael.l@cstropicalia.dev')
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
