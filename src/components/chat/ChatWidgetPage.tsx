'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatMessage, WidgetConfig } from '@/lib/types'
import { defaultWidgetConfig } from '@/lib/types'
import { Send, Loader2, RotateCcw, ExternalLink } from 'lucide-react'
import { cn, generateId } from '@/lib/utils'

interface ChatWidgetPageProps {
  projectId: string
}

function TypingIndicator({ emoji }: { emoji: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 text-lg">{emoji}</span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-gray-300 animate-[pulseDot_1.4s_0s_infinite]" />
        <span className="h-2 w-2 rounded-full bg-gray-300 animate-[pulseDot_1.4s_0.2s_infinite]" />
        <span className="h-2 w-2 rounded-full bg-gray-300 animate-[pulseDot_1.4s_0.4s_infinite]" />
      </div>
    </div>
  )
}

export default function ChatWidgetPage({ projectId }: ChatWidgetPageProps) {
  const [config, setConfig] = useState<WidgetConfig>(defaultWidgetConfig)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load widget config
  useEffect(() => {
    fetch(`/api/widget-config/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        const cfg = { ...defaultWidgetConfig, ...(d.config ?? {}) }
        setConfig(cfg)
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: cfg.welcomeMessage,
            timestamp: new Date(),
          },
        ])
        setConfigLoaded(true)
      })
      .catch(() => {
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: defaultWidgetConfig.welcomeMessage,
            timestamp: new Date(),
          },
        ])
        setConfigLoaded(true)
      })
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages
        .filter((m) => m.role !== 'assistant' || !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: text,
          history,
          widgetConfig: config,
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.answer || config.fallbackMessage,
        sources: data.sources,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: config.fallbackMessage,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, messages, projectId, config])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleReset = () => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: config.welcomeMessage,
        timestamp: new Date(),
      },
    ])
    setInput('')
  }

  const isDark = config.theme === 'dark'

  if (!configLoaded) {
    return (
      <div
        className={cn(
          'flex h-screen items-center justify-center',
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-screen flex-col',
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm"
        style={{ background: config.primaryColor }}
      >
        <span className="text-2xl">{config.avatarEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {config.chatbotName}
          </p>
          <p className="text-xs text-white/70">
            Powered by{' '}
            <a
              href="https://www.tropicalia.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Tropicalia
            </a>
          </p>
        </div>
        <button
          onClick={handleReset}
          title="Reset conversation"
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-start gap-2 animate-fade-in',
              msg.role === 'user' ? 'flex-row-reverse' : ''
            )}
          >
            {msg.role === 'assistant' && (
              <span className="mt-1 flex-shrink-0 text-xl">
                {config.avatarEmoji}
              </span>
            )}

            <div className={cn('max-w-[80%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-tr-sm text-white'
                    : isDark
                    ? 'rounded-tl-sm bg-gray-800 text-gray-100'
                    : 'rounded-tl-sm bg-white text-gray-700 shadow-sm'
                )}
                style={
                  msg.role === 'user'
                    ? { backgroundColor: config.primaryColor }
                    : undefined
                }
              >
                <div className="prose-chat whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Sources */}
              {msg.role === 'assistant' &&
                config.showSources &&
                msg.sources &&
                msg.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80"
                        style={{
                          color: config.primaryColor,
                          backgroundColor: `${config.primaryColor}15`,
                        }}
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator emoji={config.avatarEmoji} />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={cn(
          'border-t px-4 py-3',
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2',
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          )}
        >
          <input
            ref={inputRef}
            className={cn(
              'flex-1 bg-transparent text-sm outline-none placeholder-gray-400',
              isDark ? 'text-gray-100' : 'text-gray-700'
            )}
            placeholder={config.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white transition-opacity disabled:opacity-40 hover:opacity-80"
            style={{ backgroundColor: config.primaryColor }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p
          className={cn(
            'mt-1.5 text-center text-[10px]',
            isDark ? 'text-gray-600' : 'text-gray-400'
          )}
        >
          🌴 Powered by{' '}
          <a
            href="https://www.tropicalia.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Tropicalia
          </a>
        </p>
      </div>
    </div>
  )
}
