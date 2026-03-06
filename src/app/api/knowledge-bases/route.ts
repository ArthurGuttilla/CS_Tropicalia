import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  try {
    const knowledgeBases = await tropicalia.listKnowledgeBases(projectId)
    return NextResponse.json({ knowledgeBases })
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    return NextResponse.json({ error: 'Failed to fetch knowledge bases' }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const projectId = formData.get('projectId') as string
    const type = formData.get('type') as 'document' | 'url' | 'text'
    const name = formData.get('name') as string

    if (!projectId || !type || !name) {
      return NextResponse.json(
        { error: 'projectId, type, and name are required' },
        { status: 400 }
      )
    }

    let knowledgeBase

    if (type === 'document') {
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 })
      }
      knowledgeBase = await tropicalia.uploadDocument(projectId, file, name)
    } else if (type === 'url') {
      const url = formData.get('url') as string
      if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
      }
      knowledgeBase = await tropicalia.addUrlSource(projectId, { name, url })
    } else if (type === 'text') {
      const content = formData.get('content') as string
      if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 })
      }
      knowledgeBase = await tropicalia.addTextSource(projectId, { name, content })
    } else {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
    }

    return NextResponse.json({ knowledgeBase }, { status: 201 })
  } catch (err) {
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    const msg = err instanceof Error ? err.message : 'Failed to add source'
    return NextResponse.json({ error: msg }, { status })
  }
}
