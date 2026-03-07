/**
 * Tropicalia API Client
 *
 * This module handles all communication with the Tropicalia API (www.tropicalia.dev).
 * Tropicalia is an AI Context Layer that links knowledge bases, documents, and external
 * APIs to feed AI systems with real, up-to-date information.
 *
 * Configuration:
 *   TROPICALIA_API_KEY  - Your Tropicalia API key (from https://www.tropicalia.dev/settings)
 *   TROPICALIA_BASE_URL - Base URL (defaults to https://api.tropicalia.dev)
 *
 * @see https://docs.tropicalia.dev/working-with-tropicalia/introduction
 */

import type {
  Project,
  KnowledgeBase,
  ChatRequest,
  ChatResponse,
  WidgetConfig,
} from './types'

const BASE_URL = process.env.TROPICALIA_BASE_URL ?? 'https://api.tropicalia.dev'
const API_KEY = process.env.TROPICALIA_API_KEY ?? ''

// ─── HTTP Client ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new TropicaliaError(res.status, body || res.statusText)
  }

  return res.json() as Promise<T>
}

export class TropicaliaError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'TropicaliaError'
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

/**
 * List all projects for the authenticated account.
 * @see https://docs.tropicalia.dev/working-with-tropicalia/projects
 */
export async function listProjects(): Promise<Project[]> {
  const res = await request<{ projects: Project[] }>('/v1/projects')
  return res.projects
}

/**
 * Create a new project.
 */
export async function createProject(data: {
  name: string
  description?: string
}): Promise<Project> {
  const res = await request<{ project: Project }>('/v1/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.project
}

/**
 * Get a single project by ID.
 */
export async function getProject(id: string): Promise<Project> {
  const res = await request<{ project: Project }>(`/v1/projects/${id}`)
  return res.project
}

/**
 * Update a project.
 */
export async function updateProject(
  id: string,
  data: Partial<Pick<Project, 'name' | 'description'>>
): Promise<Project> {
  const res = await request<{ project: Project }>(`/v1/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return res.project
}

/**
 * Delete a project.
 */
export async function deleteProject(id: string): Promise<void> {
  await request(`/v1/projects/${id}`, { method: 'DELETE' })
}

// ─── Knowledge Bases ──────────────────────────────────────────────────────────

/**
 * List all knowledge bases for a project.
 * @see https://docs.tropicalia.dev/working-with-tropicalia/knowledge-bases
 */
export async function listKnowledgeBases(
  projectId: string
): Promise<KnowledgeBase[]> {
  const res = await request<{ knowledgeBases: KnowledgeBase[] }>(
    `/v1/projects/${projectId}/knowledge-bases`
  )
  return res.knowledgeBases
}

/**
 * Add a URL source to a project's knowledge base.
 */
export async function addUrlSource(
  projectId: string,
  data: { name: string; url: string }
): Promise<KnowledgeBase> {
  const res = await request<{ knowledgeBase: KnowledgeBase }>(
    `/v1/projects/${projectId}/knowledge-bases`,
    {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'url' }),
    }
  )
  return res.knowledgeBase
}

/**
 * Add a plain text source to a project's knowledge base.
 */
export async function addTextSource(
  projectId: string,
  data: { name: string; content: string }
): Promise<KnowledgeBase> {
  const res = await request<{ knowledgeBase: KnowledgeBase }>(
    `/v1/projects/${projectId}/knowledge-bases`,
    {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'text' }),
    }
  )
  return res.knowledgeBase
}

/**
 * Upload a document file to a project's knowledge base.
 * Accepts PDF, DOCX, TXT, MD, CSV files.
 */
export async function uploadDocument(
  projectId: string,
  file: File,
  name?: string
): Promise<KnowledgeBase> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name ?? file.name)
  formData.append('type', 'document')

  const res = await fetch(
    `${BASE_URL}/v1/projects/${projectId}/knowledge-bases/upload`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: formData,
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new TropicaliaError(res.status, body || res.statusText)
  }

  const json = await res.json()
  return json.knowledgeBase as KnowledgeBase
}

/**
 * Delete a knowledge base source.
 */
export async function deleteKnowledgeBase(
  projectId: string,
  kbId: string
): Promise<void> {
  await request(
    `/v1/projects/${projectId}/knowledge-bases/${kbId}`,
    { method: 'DELETE' }
  )
}

// ─── Chat / Query ─────────────────────────────────────────────────────────────

/**
 * Send a chat message and receive an AI-generated answer based on the project's
 * knowledge bases. Tropicalia performs RAG (Retrieval-Augmented Generation)
 * to ground the answer in your knowledge base content.
 *
 * @see https://docs.tropicalia.dev/working-with-tropicalia/querying
 */
export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const body: Record<string, unknown> = {
    message: req.message,
    history: req.history ?? [],
  }

  // Pass widget configuration as instructions to shape the AI response
  if (req.widgetConfig) {
    const cfg = req.widgetConfig
    const instructions: string[] = []

    if (cfg.systemPrompt) instructions.push(cfg.systemPrompt)
    if (cfg.tone) instructions.push(`Respond in a ${cfg.tone} tone.`)
    if (cfg.language) instructions.push(`Respond in ${cfg.language}.`)
    if (cfg.maxResponseLength === 'concise')
      instructions.push('Keep your answers brief and to the point.')
    if (cfg.maxResponseLength === 'detailed')
      instructions.push('Provide thorough, detailed answers.')
    if (cfg.deniedTopics)
      instructions.push(
        `Do not discuss the following topics: ${cfg.deniedTopics}.`
      )
    if (cfg.allowedTopics)
      instructions.push(
        `Only answer questions related to: ${cfg.allowedTopics}.`
      )

    body.instructions = instructions.join('\n')
    body.include_sources = cfg.showSources ?? true
  }

  const res = await request<ChatResponse>(
    `/v1/projects/${req.projectId}/chat`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )

  return res
}

// ─── Widget Config (stored as project metadata) ───────────────────────────────

/**
 * Save widget configuration as project metadata.
 */
export async function saveWidgetConfig(
  projectId: string,
  config: WidgetConfig
): Promise<void> {
  await request(`/v1/projects/${projectId}/metadata`, {
    method: 'PUT',
    body: JSON.stringify({ widgetConfig: config }),
  })
}

/**
 * Load widget configuration from project metadata.
 */
export async function loadWidgetConfig(
  projectId: string
): Promise<WidgetConfig | null> {
  try {
    const res = await request<{ metadata: { widgetConfig?: WidgetConfig } }>(
      `/v1/projects/${projectId}/metadata`
    )
    return res.metadata?.widgetConfig ?? null
  } catch {
    return null
  }
}
