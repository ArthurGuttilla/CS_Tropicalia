import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'
import type { ChatRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest

    const { projectId, message, history, widgetConfig } = body

    if (!projectId || !message?.trim()) {
      return NextResponse.json(
        { error: 'projectId and message are required' },
        { status: 400 }
      )
    }

    const response = await tropicalia.chat({
      projectId,
      message: message.trim(),
      history,
      widgetConfig,
    })

    return NextResponse.json(response)
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    const msg = err instanceof Error ? err.message : 'Failed to get AI response'
    return NextResponse.json({ error: msg }, { status })
  }
}
