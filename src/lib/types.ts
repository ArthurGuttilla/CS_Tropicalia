// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  knowledgeBasesCount?: number
  widgetConfig?: WidgetConfig
}

export interface KnowledgeBase {
  id: string
  projectId: string
  name: string
  type: 'document' | 'url' | 'text'
  status: 'processing' | 'ready' | 'error'
  fileName?: string
  fileSize?: number
  url?: string
  content?: string
  createdAt: string
}

// ─── Widget Configuration ─────────────────────────────────────────────────────

export interface WidgetConfig {
  // Identity
  chatbotName: string
  avatarEmoji: string
  welcomeMessage: string
  placeholder: string

  // Behavior
  systemPrompt: string
  tone: 'formal' | 'casual' | 'friendly' | 'technical'
  language: string
  showSources: boolean
  maxResponseLength: 'concise' | 'moderate' | 'detailed'

  // Appearance
  primaryColor: string
  bubbleColor: string
  position: 'bottom-right' | 'bottom-left'
  theme: 'light' | 'dark'

  // Restrictions
  allowedTopics: string
  deniedTopics: string
  fallbackMessage: string
}

export const defaultWidgetConfig: WidgetConfig = {
  chatbotName: 'AI Assistant',
  avatarEmoji: '🤖',
  welcomeMessage: 'Hello! How can I help you today?',
  placeholder: 'Type your message...',
  systemPrompt: 'You are a helpful customer support assistant. Answer questions based on the provided knowledge base. Be concise, accurate, and friendly.',
  tone: 'friendly',
  language: 'English',
  showSources: true,
  maxResponseLength: 'moderate',
  primaryColor: '#22c55e',
  bubbleColor: '#22c55e',
  position: 'bottom-right',
  theme: 'light',
  allowedTopics: '',
  deniedTopics: '',
  fallbackMessage: "I'm sorry, I don't have information about that. Please contact our support team for further assistance.",
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
  isLoading?: boolean
}

export interface Source {
  title: string
  url?: string
  excerpt?: string
}

export interface ChatRequest {
  projectId: string
  message: string
  history?: { role: 'user' | 'assistant'; content: string }[]
  widgetConfig?: Partial<WidgetConfig>
}

export interface ChatResponse {
  answer: string
  sources?: Source[]
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
