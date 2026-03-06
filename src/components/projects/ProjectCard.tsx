'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import {
  Database,
  Settings2,
  Code2,
  MoreVertical,
  Trash2,
  ArrowUpRight,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'

interface ProjectCardProps {
  project: Project
  onDeleted: (id: string) => void
}

export default function ProjectCard({ project, onDeleted }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { error, success } = useToast()
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`))
      return

    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete project')
      success('Project deleted')
      onDeleted(project.id)
    } catch {
      error('Failed to delete project')
    } finally {
      setDeleting(false)
      setMenuOpen(false)
    }
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="block font-semibold text-gray-900 hover:text-brand-600 transition-colors truncate"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Context menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
                Open
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Database className="h-3.5 w-3.5" />
          {project.knowledgeBasesCount ?? 0} sources
        </span>
        <span>·</span>
        <span>Updated {formatRelativeTime(project.updatedAt)}</span>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/dashboard/projects/${project.id}/knowledge-base`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Database className="h-3.5 w-3.5" />
          Knowledge Base
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}/widget`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Widget
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}/embed`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Code2 className="h-3.5 w-3.5" />
          Embed
        </Link>
      </div>
    </div>
  )
}
