'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import ProjectBreadcrumb from '@/components/layout/ProjectBreadcrumb'
import EditProjectModal from '@/components/projects/EditProjectModal'
import Button from '@/components/ui/Button'
import type { Project } from '@/lib/types'
import { Database, Settings2, Code2, ExternalLink, Loader2, Pencil } from 'lucide-react'

const SUB_NAV = [
  {
    href: 'knowledge-base',
    label: 'Knowledge Base',
    icon: Database,
    description: 'Manage documents, URLs, and text sources that the AI uses to answer questions.',
  },
  {
    href: 'widget',
    label: 'Widget Config',
    icon: Settings2,
    description: 'Customize the chatbot name, tone, appearance, and behavior rules.',
  },
  {
    href: 'embed',
    label: 'Embed Code',
    icon: Code2,
    description: 'Get the code snippet to embed your chatbot widget on any website.',
  },
]

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/projects/${id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setProject(d.project))
      .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Project not found.</p>
        <Link href="/dashboard/projects" className="text-sm text-brand-600 hover:underline">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col overflow-y-auto">
        <div className="border-b border-gray-100 bg-white px-6 py-3">
          <ProjectBreadcrumb projectId={id} projectName={project.name} />
        </div>

        <Header
          title={project.name}
          description={project.description ?? 'Manage your project'}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <a
                href={`/widget/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Preview Widget
              </a>
            </div>
          }
        />

        <div className="flex-1 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SUB_NAV.map((item) => (
              <Link
                key={item.href}
                href={`/dashboard/projects/${id}/${item.href}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-700 transition-colors">
                  {item.label}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 flex-1">
                  {item.description}
                </p>
                <p className="mt-4 text-sm font-medium text-brand-600">Open →</p>
              </Link>
            ))}
          </div>

          {/* Project details */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Project Details
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-400">Project ID</dt>
                <dd className="mt-1 font-mono text-xs text-gray-700 bg-gray-50 rounded px-2 py-1">
                  {project.id}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Knowledge Sources</dt>
                <dd className="mt-1 font-semibold text-gray-800">
                  {project.knowledgeBasesCount ?? 0}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {project && (
        <EditProjectModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          project={project}
          onUpdated={(updated) => setProject(updated)}
        />
      )}
    </>
  )
}
