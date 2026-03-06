'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import ProjectBreadcrumb from '@/components/layout/ProjectBreadcrumb'
import WidgetConfigurator from '@/components/widget/WidgetConfigurator'
import type { Project } from '@/lib/types'

export default function WidgetPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project))
  }, [id])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <ProjectBreadcrumb
          projectId={id}
          projectName={project?.name ?? '…'}
          currentPage="widget"
        />
      </div>

      <Header
        title="Widget Configuration"
        description="Customize your chatbot's identity, behavior, and appearance. Preview updates in real time."
      />

      <div className="flex flex-1 overflow-hidden">
        <WidgetConfigurator projectId={id} />
      </div>
    </div>
  )
}
