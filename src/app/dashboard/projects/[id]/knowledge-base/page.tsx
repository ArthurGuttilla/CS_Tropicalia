'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import ProjectBreadcrumb from '@/components/layout/ProjectBreadcrumb'
import AddSourceModal from '@/components/knowledge-base/AddSourceModal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { KnowledgeBase, Project } from '@/lib/types'
import { formatBytes, formatRelativeTime } from '@/lib/utils'
import {
  Plus,
  FileText,
  Link2,
  AlignLeft,
  Trash2,
  Loader2,
  Database,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

function SourceIcon({ type }: { type: KnowledgeBase['type'] }) {
  if (type === 'url') return <Link2 className="h-4 w-4" />
  if (type === 'text') return <AlignLeft className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

function statusVariant(status: KnowledgeBase['status']) {
  if (status === 'ready') return 'success' as const
  if (status === 'error') return 'error' as const
  return 'processing' as const
}

export default function KnowledgeBasePage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [sources, setSources] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { error, success } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [projRes, kbRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/knowledge-bases?projectId=${id}`),
      ])
      const projData = await projRes.json()
      const kbData = await kbRes.json()
      setProject(projData.project)
      setSources(kbData.knowledgeBases ?? [])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdded = (source: KnowledgeBase) => {
    setSources((prev) => [source, ...prev])
  }

  const handleDelete = async (kbId: string) => {
    if (!confirm('Remove this source from the knowledge base?')) return
    try {
      const res = await fetch(`/api/knowledge-bases/${kbId}?projectId=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      success('Source removed')
      setSources((prev) => prev.filter((s) => s.id !== kbId))
    } catch {
      error('Failed to remove source')
    }
  }

  return (
    <>
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <ProjectBreadcrumb
          projectId={id}
          projectName={project?.name ?? '…'}
          currentPage="knowledge-base"
        />
      </div>

      <Header
        title="Knowledge Base"
        description="Sources the AI uses to answer customer questions"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              No sources yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Add documents, URLs, or text that the AI should use when answering
              questions.
            </p>
            <Button className="mt-5" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Add First Source
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Stats bar */}
            <div className="mb-4 flex items-center gap-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              <Database className="h-4 w-4" />
              <span>
                <strong>{sources.length}</strong> source
                {sources.length !== 1 ? 's' : ''} in knowledge base
              </span>
              <span className="text-brand-300">·</span>
              <span>
                <strong>{sources.filter((s) => s.status === 'ready').length}</strong>{' '}
                ready
              </span>
              {sources.some((s) => s.status === 'processing') && (
                <>
                  <span className="text-brand-300">·</span>
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {sources.filter((s) => s.status === 'processing').length}{' '}
                    processing
                  </span>
                </>
              )}
            </div>

            {/* Sources list */}
            {sources.map((source) => (
              <div
                key={source.id}
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-300 transition-colors"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <SourceIcon type={source.type} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 truncate">
                      {source.name}
                    </span>
                    <Badge variant={statusVariant(source.status)}>
                      {source.status === 'processing' && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {source.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize">{source.type}</span>
                    {source.fileSize && (
                      <>
                        <span>·</span>
                        <span>{formatBytes(source.fileSize)}</span>
                      </>
                    )}
                    {source.url && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-xs">{source.url}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Added {formatRelativeTime(source.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(source.id)}
                  className="flex-shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove source"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddSourceModal
        open={showModal}
        onClose={() => setShowModal(false)}
        projectId={id}
        onAdded={handleAdded}
      />
    </>
  )
}
