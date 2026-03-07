# CS Tropicalia — Customer Success Platform

An AI-powered customer success platform that lets companies create intelligent chatbot widgets backed by managed knowledge bases. All AI context and answers are provided by [Tropicalia](https://www.tropicalia.dev).

## Features

- **Project Management** — Organize chatbots by product or department
- **Knowledge Base Manager** — Upload PDFs, add URLs, or paste text; Tropicalia indexes it all
- **Widget Configurator** — Customize chatbot name, tone, language, appearance, and behavior rules with a **live preview**
- **Embeddable Widget** — One-line script tag, iframe, or React component
- **Multi-format embed** — Floating bubble (script), inline iframe, or React/Next.js component

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Get your API key at https://www.tropicalia.dev
TROPICALIA_API_KEY=your_api_key_here
TROPICALIA_BASE_URL=https://api.tropicalia.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/
│   ├── (dashboard)/          # Dashboard pages (layout with sidebar)
│   │   ├── page.tsx          # Overview
│   │   ├── projects/         # Project list + CRUD
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Project detail
│   │   │       ├── knowledge-base/       # Knowledge base manager
│   │   │       ├── widget/               # Widget configurator + live preview
│   │   │       └── embed/                # Embed code generator
│   │   └── settings/         # API key & app settings
│   ├── widget/[projectId]/   # Standalone chat widget page (embeddable via iframe)
│   └── api/
│       ├── projects/         # CRUD → Tropicalia Projects API
│       ├── knowledge-bases/  # CRUD → Tropicalia Knowledge Bases API
│       ├── chat/             # POST → Tropicalia Chat/Query API
│       └── widget-config/    # Widget config persistence (file-based)
├── components/
│   ├── chat/                 # Full chat widget UI
│   ├── knowledge-base/       # Source management components
│   ├── layout/               # Sidebar, header, breadcrumb
│   ├── projects/             # Project cards, create modal
│   ├── ui/                   # Base UI components
│   └── widget/               # Configurator, live preview, embed code
└── lib/
    ├── tropicalia.ts         # Tropicalia API client
    ├── types.ts              # TypeScript types
    └── utils.ts              # Utilities
```

## Embedding a Widget

### Script tag (recommended)

```html
<script
  src="https://your-app.com/embed.js"
  data-project-id="YOUR_PROJECT_ID"
  data-app-url="https://your-app.com"
  defer
></script>
```

This renders a floating chat bubble that opens a chat panel.

### iFrame

```html
<iframe
  src="https://your-app.com/widget/YOUR_PROJECT_ID"
  width="400"
  height="600"
  style="border:none;border-radius:16px;"
></iframe>
```

### React / Next.js

```tsx
import { useEffect } from 'react'

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://your-app.com/embed.js'
    script.dataset.projectId = 'YOUR_PROJECT_ID'
    script.defer = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])
  return null
}
```

## Widget Config Persistence

Widget configurations are stored as JSON files in `.widget-configs/` during development. For production, replace the file-based storage in `src/app/api/widget-config/[projectId]/route.ts` with a database (Postgres, Redis, etc.) or use Tropicalia's project metadata API.

## Tropicalia Integration

All AI answering and knowledge base management is handled by [Tropicalia](https://www.tropicalia.dev). The integration is encapsulated in `src/lib/tropicalia.ts` with clear documentation of each API call.

See the [Tropicalia docs](https://docs.tropicalia.dev/working-with-tropicalia/introduction) for API reference.
