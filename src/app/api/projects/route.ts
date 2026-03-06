import { NextRequest, NextResponse } from 'next/server'
import * as tropicalia from '@/lib/tropicalia'

export async function GET() {
  try {
    const projects = await tropicalia.listProjects()
    return NextResponse.json({ projects })
  } catch (err) {
    const msg = err instanceof tropicalia.TropicaliaError
      ? err.message
      : 'Failed to fetch projects'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description } = body as { name: string; description?: string }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = await tropicalia.createProject({ name: name.trim(), description })
    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    const msg = err instanceof tropicalia.TropicaliaError
      ? err.message
      : 'Failed to create project'
    const status = err instanceof tropicalia.TropicaliaError ? err.status : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
