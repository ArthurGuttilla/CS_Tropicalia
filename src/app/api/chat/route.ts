import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'
import { handleRoute } from '@/lib/api'
import type { ChatRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest
  const { projectId, message, history, widgetConfig } = body

  if (!projectId || !message?.trim()) {
    return NextResponse.json(
      { error: 'projectId and message are required' },
      { status: 400 }
    )
  }

  return handleRoute(async () => {
    const response = await tropicalia.chat({
      projectId,
      message: message.trim(),
      history,
      widgetConfig,
    })
    return NextResponse.json(response)
  })
}
