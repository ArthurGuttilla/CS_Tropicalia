import Header from '@/components/layout/Header'
import Link from 'next/link'
import {
  FolderOpen,
  MessageSquare,
  Database,
  ArrowRight,
  Zap,
  TrendingUp,
} from 'lucide-react'

const FEATURE_CARDS = [
  {
    icon: FolderOpen,
    color: 'bg-violet-100 text-violet-600',
    title: 'Create a Project',
    description:
      'Organize your AI chatbots by product or department. Each project has its own knowledge base and widget.',
    href: '/dashboard/projects',
    cta: 'Go to Projects',
  },
  {
    icon: Database,
    color: 'bg-blue-100 text-blue-600',
    title: 'Build a Knowledge Base',
    description:
      'Upload PDFs, add URLs, or paste text. Tropicalia indexes your content for accurate AI-powered answers.',
    href: '/dashboard/projects',
    cta: 'Manage Sources',
  },
  {
    icon: MessageSquare,
    color: 'bg-brand-100 text-brand-600',
    title: 'Configure Your Widget',
    description:
      'Customize the chatbot name, tone, colors, and instructions. Preview changes in real time before publishing.',
    href: '/dashboard/projects',
    cta: 'Configure Widget',
  },
]

const QUICK_STEPS = [
  {
    step: '01',
    title: 'Create a project',
    description: 'Give your project a name and description.',
  },
  {
    step: '02',
    title: 'Add knowledge sources',
    description: 'Upload documents, paste URLs, or add plain text.',
  },
  {
    step: '03',
    title: 'Configure the widget',
    description: 'Set the tone, persona, and appearance of your chatbot.',
  },
  {
    step: '04',
    title: 'Embed on your site',
    description: 'Copy one line of code and paste it into your website.',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col overflow-y-auto">
      <Header
        title="Dashboard"
        description="Welcome to CS Tropicalia — your AI customer success platform"
      />

      <div className="flex-1 px-6 py-8 space-y-10">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
          <div className="relative z-10 max-w-xl">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-200" />
              <span className="text-sm font-medium text-brand-200">
                Powered by Tropicalia AI
              </span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">
              Build AI chatbots that know your product inside out
            </h2>
            <p className="mt-2 text-brand-100 text-sm leading-relaxed max-w-sm">
              Create a project, upload your docs, and get an embeddable chat
              widget in minutes. No AI expertise required.
            </p>
            <Link
              href="/dashboard/projects"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow hover:bg-brand-50 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 h-full w-64 opacity-10">
            <div className="absolute right-8 top-8 h-40 w-40 rounded-full bg-white" />
            <div className="absolute right-24 bottom-4 h-24 w-24 rounded-full bg-white" />
          </div>
        </div>

        {/* How it works */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            How it works
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <span className="text-2xl font-black text-gray-100">
                  {s.step}
                </span>
                <h4 className="mt-1 font-semibold text-gray-800 text-sm">
                  {s.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-gray-800">{card.title}</h4>
                <p className="mt-1 flex-1 text-sm text-gray-500">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
                  {card.cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats placeholder */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Activity Overview
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
            <p className="text-sm">
              Create your first project to start tracking chat activity.
            </p>
            <Link
              href="/dashboard/projects"
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              Create a project →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
