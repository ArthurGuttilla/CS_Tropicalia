# CS Tropicalia — Customer Success AI Platform

> Memória semântica para cada cliente. Briefings automáticos, health scores e alertas proativos.

## Overview

CS Tropicalia é uma plataforma B2B SaaS que dá a cada CSM a memória semântica completa de cada cliente — para que toda interação seja contextualizada, toda ação seja proativa, e nenhum churn seja uma surpresa.

### MVP Features

- **Briefing automático pré-call** — Gerado via Claude API com summary, talking points, riscos e oportunidades
- **Health score baseado em regras** — Detecta queda de uso (WAU), breach de SLA, silêncio de interação e mudança de champion
- **Alertas via Slack** — Notificação automática quando health score cai abaixo de 60
- **Web app** — Lista de contas com filtros, perfil de conta completo, alertas view

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 · React · Tailwind CSS · Clerk |
| Backend | Fastify (Node.js) · Zod |
| Database | PostgreSQL 15 · Prisma ORM |
| Cache/Queue | Redis · BullMQ |
| LLM | Claude API (claude-sonnet-4-6) |
| Context (Tropicalia) | Mock via PostgreSQL (flag: `TROPICALIA_MOCK=true`) |
| Notifications | Slack Block Kit |

## Quick Start

### 1. Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 2. Instalar dependências

```bash
# Instalar pnpm se necessário
npm install -g pnpm

# Instalar todas as dependências do monorepo
pnpm install
```

### 3. Subir infraestrutura (Postgres + Redis)

```bash
pnpm docker:up
```

### 4. Configurar variáveis de ambiente

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edite apps/backend/.env e preencha:
# - ANTHROPIC_API_KEY (obrigatório para briefings via LLM)
# - Clerk keys (opcional para dev sem auth)
# - Slack tokens (opcional para notificações)

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
# Edite apps/frontend/.env e preencha as Clerk keys
```

### 5. Criar banco e seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Iniciar tudo

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Health check: http://localhost:3001/api/v1/health

## Desenvolvimento

### Sem Clerk (modo demo)

Para rodar sem configurar Clerk, remova o middleware de auth temporariamente:

```bash
# apps/frontend/middleware.ts
# Comente o bloco auth().protect()
```

### Testar scoring manualmente

```bash
# Trigger score-all via API
curl -X POST http://localhost:3001/api/v1/internal/score-all \
  -H "x-internal-key: dev-internal-key"
```

### Simular queda de uso (webhook mock)

```bash
curl -X POST http://localhost:3001/api/v1/webhooks/mixpanel \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "<ACCOUNT_ID>",
    "event": "usage_report",
    "payload": {
      "weekly_active_users": 5,
      "monthly_active_users": 15,
      "api_calls": 200,
      "feature_usage": {}
    }
  }'
```

### Prisma Studio (UI do banco)

```bash
pnpm db:studio
# Abre em http://localhost:5555
```

## Arquitetura

```
CS_Tropicalia/
├── apps/
│   ├── backend/          # Fastify API + serviços + workers
│   └── frontend/         # Next.js 14 web app
└── packages/
    └── shared/           # Tipos TypeScript compartilhados
```

### Serviços principais

| Serviço | Descrição |
|---------|-----------|
| `BriefingService` | Orquestra Tropicalia mock + Claude API, persiste briefing com TTL 4h |
| `RiskScoringService` | Calcula health score por regras determinísticas, emite RiskSignals |
| `AlertService` | Cria alertas quando score < 60, dispara Slack |
| `ContextService` | Wrapper Tropicalia com cache Redis 30min |
| `LLMOrchestrator` | Claude API com retry, fallback para haiku, cache Redis |
| `RiskScoringWorker` | BullMQ cron a cada 6h para scoring de todas as contas |
| `SignalIngestionWorker` | Processa webhooks de integrações e atualiza dados |

### Risk Scoring Rules

| Regra | Deducão | Sinal |
|-------|---------|-------|
| WAU < 50% baseline (30d) | -20 pts | `usage_drop` |
| Avg ticket resolution > 5d | -10 pts | `ticket_sla_breach` |
| Última interação > 14d | -15 pts | `interaction_silence` |
| Champion mudou | -12 pts | `champion_change` |
| Tickets P0/P1 abertos | -8 pts cada (cap -20) | `ticket_sla_breach` |

Health tiers: 🟢 green ≥75 · 🟡 yellow 50–74 · 🔴 red <50

### Tropicalia Mock

Em desenvolvimento, `TROPICALIA_MOCK=true` faz o `ContextService` montar o `ContextBundle` diretamente do PostgreSQL (tabelas `Interaction`, `Ticket`, `UsageSnapshot`, `RiskSignal`). Para usar a API real, configure `TROPICALIA_MOCK=false` e `TROPICALIA_API_URL` + `TROPICALIA_API_KEY`.

## Variáveis de Ambiente

Veja `.env.example` na raiz e em cada app para a lista completa.

**Mínimo para rodar localmente:**
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `ANTHROPIC_API_KEY` — Para geração de briefings com Claude

**Para notificações Slack:**
- `SLACK_BOT_TOKEN` — xoxb-...
- `SLACK_ALERTS_CHANNEL` — #cs-alerts

## Roadmap

- **MVP (atual):** Briefing, health score, alertas Slack, web app
- **V1.1:** Integrações reais (Jira, Zendesk, Google Calendar), health score híbrido (regras + LLM)
- **V1.2:** QBR/EBR generator, onboarding playbook, email digest
- **V2:** AI copilot em calls, expansion intelligence, modelo preditivo de churn
