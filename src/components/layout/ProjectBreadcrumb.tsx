'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface ProjectBreadcrumbProps {
  projectId: string
  projectName: string
  currentPage?: string
}

const SUB_PAGES: Record<string, string> = {
  'knowledge-base': 'Knowledge Base',
  widget: 'Widget Config',
  embed: 'Embed Code',
}

export default function ProjectBreadcrumb({
  projectId,
  projectName,
  currentPage,
}: ProjectBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500">
      <Link
        href="/dashboard/projects"
        className="hover:text-gray-700 transition-colors"
      >
        Projects
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
      <Link
        href={`/dashboard/projects/${projectId}`}
        className={
          currentPage
            ? 'hover:text-gray-700 transition-colors'
            : 'font-medium text-gray-900'
        }
      >
        {projectName}
      </Link>
      {currentPage && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-medium text-gray-900">
            {SUB_PAGES[currentPage] ?? currentPage}
          </span>
        </>
      )}
    </nav>
  )
}
