'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ChatMessage, WidgetConfig } from '@/lib/types'
import { cn, generateId } from '@/lib/utils'
import { Send, Loader2, RotateCcw, ExternalLink, Zap } from 'lucide-react'
import TypingDots from '@/components/ui/TypingDots'

interface ChatTesterProps {
  projectId: string
  config: WidgetConfig
}

export default function ChatTester({ projectId, config }: ChatTesterProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isDark = config.theme === 'dark'

  // Re-init conversation when welcome message changes
  useEffect(() => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: config.welcomeMessage || 'Hello! How can I help you today?',
        timestamp: new Date(),
      },
    ])
  }, [config.welcomeMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const send = useCallback(async () => {
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
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message: text, history, widgetConfig: config }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: data.answer || config.fallbackMessage,
          sources: data.sources,
          timestamp: new Date(),
        },
      ])
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
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, isLoading, messages, projectId, config])

  const reset = () => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: config.welcomeMessage || 'Hello! How can I help you today?',
        timestamp: new Date(),
      },
    ])
    setInput('')
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col',
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      )}
    >
      {/* Tester header */}
      <div
        className={cn(
          'flex items-center gap-2 border-b px-4 py-2',
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'
        )}
      >
        <Zap className="h-4 w-4 text-amber-500" />
        <span className={cn('text-sm font-medium', isDark ? 'text-gray-200' : 'text-gray-700')}>
          Live Test
        </span>
        <span className={cn('ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium', 'bg-amber-100 text-amber-700')}>
          Uses real API
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={reset}
            title="Reset conversation"
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <a
            href={`/widget/${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open full widget"
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-start gap-2 animate-fade-in',
              msg.role === 'user' ? 'flex-row-reverse' : ''
            )}
          >
            {msg.role === 'assistant' && (
              <span className="mt-1 flex-shrink-0 text-lg leading-none">
                {config.avatarEmoji}
              </span>
            )}
            <div className="max-w-[80%]">
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
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
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Sources */}
              {msg.role === 'assistant' &&
                config.showSources &&
                msg.sources &&
                msg.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-70"
                        style={{
                          color: config.primaryColor,
                          backgroundColor: `${config.primaryColor}18`,
                        }}
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {s.title}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2 animate-fade-in">
            <span className="mt-1 text-lg leading-none">{config.avatarEmoji}</span>
            <div
              className={cn(
                'rounded-2xl rounded-tl-sm',
                isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
              )}
            >
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={cn(
          'border-t px-3 py-3',
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2',
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          )}
        >
          <input
            ref={inputRef}
            className={cn(
              'flex-1 bg-transparent text-sm outline-none placeholder-gray-400',
              isDark ? 'text-gray-100' : 'text-gray-700'
            )}
            placeholder={config.placeholder || 'Type a message to test…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white disabled:opacity-40 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: config.primaryColor }}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
