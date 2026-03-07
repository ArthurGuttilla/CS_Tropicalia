/**
 * Widget Config API
 *
 * Stores widget configuration per project.
 *
 * Storage strategy:
 *  - Local dev: JSON files in .widget-configs/ (writable filesystem)
 *  - Vercel / read-only environments: returns null (client uses defaults)
 *    → For production persistence, replace with Vercel KV, Upstash Redis,
 *      Postgres, or Tropicalia's project metadata API.
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { WidgetConfig } from '@/lib/types'

const CONFIG_DIR = path.join(process.cwd(), '.widget-configs')
const IS_READONLY = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

async function ensureDir() {
  await fs.mkdir(CONFIG_DIR, { recursive: true })
}

function configPath(projectId: string) {
  const safe = projectId.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(CONFIG_DIR, `${safe}.json`)
}

type Params = { params: Promise<{ projectId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params

  if (IS_READONLY) {
    // In read-only environments, configs are not persisted server-side.
    // The client will use the defaults from lib/types.ts.
    return NextResponse.json({ config: null })
  }

  try {
    await ensureDir()
    const file = await fs.readFile(configPath(projectId), 'utf-8')
    const config = JSON.parse(file) as WidgetConfig
    return NextResponse.json({ config })
  } catch {
    return NextResponse.json({ config: null })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { projectId } = await params
  const config = await req.json() as WidgetConfig

  if (IS_READONLY) {
    // Cannot persist on read-only filesystem — return success so the UI
    // doesn't show an error. In production, wire up a real database here.
    return NextResponse.json({ success: true, config, persisted: false })
  }

  try {
    await ensureDir()
    await fs.writeFile(configPath(projectId), JSON.stringify(config, null, 2))
    return NextResponse.json({ success: true, config, persisted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save config'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
