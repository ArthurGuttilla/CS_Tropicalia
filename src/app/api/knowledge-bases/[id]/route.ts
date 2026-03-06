import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  try {
    await tropicalia.deleteKnowledgeBase(projectId, id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    return NextResponse.json({ error: 'Failed to delete source' }, { status })
  }
}
