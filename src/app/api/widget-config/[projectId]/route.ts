/**
 * Widget Config API
 *
 * Stores widget configuration per project.
 * Uses a local JSON file for persistence (suitable for development and small deployments).
 * For production, replace with a database (Postgres, Redis, etc.) or
 * use Tropicalia's project metadata API (tropicalia.saveWidgetConfig).
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { WidgetConfig } from '@/lib/types'

const CONFIG_DIR = path.join(process.cwd(), '.widget-configs')

async function ensureDir() {
  await fs.mkdir(CONFIG_DIR, { recursive: true })
}

function configPath(projectId: string) {
  // Sanitize to prevent path traversal
  const safe = projectId.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(CONFIG_DIR, `${safe}.json`)
}

type Params = { params: { projectId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await ensureDir()
    const file = await fs.readFile(configPath(params.projectId), 'utf-8')
    const config = JSON.parse(file) as WidgetConfig
    return NextResponse.json({ config })
  } catch {
    // No config saved yet — return null (client will use defaults)
    return NextResponse.json({ config: null })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const config = await req.json() as WidgetConfig
    await ensureDir()
    await fs.writeFile(configPath(params.projectId), JSON.stringify(config, null, 2))
    return NextResponse.json({ success: true, config })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save config'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
