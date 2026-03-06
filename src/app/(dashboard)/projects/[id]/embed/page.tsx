'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import ProjectBreadcrumb from '@/components/layout/ProjectBreadcrumb'
import EmbedCodeSection from '@/components/widget/EmbedCodeSection'
import type { Project } from '@/lib/types'

export default function EmbedPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project))
  }, [id])

  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <ProjectBreadcrumb
          projectId={id}
          projectName={project?.name ?? '…'}
          currentPage="embed"
        />
      </div>

      <Header
        title="Embed Code"
        description="Copy one of these snippets to add your AI chatbot to any website."
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl">
        <EmbedCodeSection projectId={id} appUrl={appUrl} />
      </div>
    </div>
  )
}
