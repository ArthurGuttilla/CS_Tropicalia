import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'
import { handleRoute } from '@/lib/api'

export function GET() {
  return handleRoute(async () => {
    const projects = await tropicalia.listProjects()
    return NextResponse.json({ projects })
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description } = body as { name: string; description?: string }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
  }

  return handleRoute(async () => {
    const project = await tropicalia.createProject({ name: name.trim(), description })
    return NextResponse.json({ project }, { status: 201 })
  })
}
