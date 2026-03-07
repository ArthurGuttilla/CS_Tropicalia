import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'
import { handleRoute } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return handleRoute(async () => {
    const project = await tropicalia.getProject(id)
    return NextResponse.json({ project })
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  return handleRoute(async () => {
    const project = await tropicalia.updateProject(id, body)
    return NextResponse.json({ project })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return handleRoute(async () => {
    await tropicalia.deleteProject(id)
    return NextResponse.json({ success: true })
  })
}
