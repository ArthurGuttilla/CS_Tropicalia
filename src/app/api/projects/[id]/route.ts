import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const project = await tropicalia.getProject(params.id)
    return NextResponse.json({ project })
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    return NextResponse.json({ error: 'Project not found' }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json()
    const project = await tropicalia.updateProject(params.id, body)
    return NextResponse.json({ project })
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    const msg = err instanceof Error ? err.message : 'Failed to update project'
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await tropicalia.deleteProject(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    return NextResponse.json({ error: 'Failed to delete project' }, { status })
  }
}
