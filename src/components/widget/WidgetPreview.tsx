'use client'

import { useState } from 'react'
import type { WidgetConfig } from '@/lib/types'
import { Send, X, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WidgetPreviewProps {
  config: WidgetConfig
}

const DEMO_MESSAGES = [
  {
    role: 'assistant' as const,
    content: 'Hello! I\'m here to help. What can I assist you with today?',
  },
  {
    role: 'user' as const,
    content: 'How do I reset my password?',
  },
  {
    role: 'assistant' as const,
    content:
      'To reset your password, click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox. The link expires in 24 hours.',
  },
]

export default function WidgetPreview({ config }: WidgetPreviewProps) {
  const [open, setOpen] = useState(true)
  const [inputVal, setInputVal] = useState('')

  const isDark = config.theme === 'dark'

  return (
    <div className="relative flex h-full min-h-[520px] items-end justify-end p-6">
      {/* Phone/browser frame hint */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <p className="text-xs text-slate-400 font-medium select-none">
          Your website
        </p>
      </div>

      {/* Widget panel */}
      {open && (
        <div
          className={cn(
            'relative z-10 mb-16 flex flex-col rounded-2xl shadow-2xl overflow-hidden',
            'w-[340px] h-[480px]',
            isDark ? 'bg-gray-900' : 'bg-white'
          )}
          style={{ border: `1px solid ${config.primaryColor}20` }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2.5 px-4 py-3"
            style={{ background: config.primaryColor }}
          >
            <span className="text-xl">{config.avatarEmoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {config.chatbotName || 'AI Assistant'}
              </p>
              <p className="text-xs text-white/70">Powered by Tropicalia</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/70 hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className={cn(
              'flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin',
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            )}
          >
            {/* Welcome message */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-lg">{config.avatarEmoji}</span>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl rounded-tl-sm px-3 py-2 text-sm',
                  isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700 shadow-sm'
                )}
              >
                {config.welcomeMessage || 'Hello! How can I help you today?'}
              </div>
            </div>

            {/* Demo conversation */}
            {DEMO_MESSAGES.slice(1).map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2',
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                {msg.role === 'assistant' && (
                  <span className="mt-0.5 text-lg">{config.avatarEmoji}</span>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
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
                  {msg.content}
                  {/* Source badge */}
                  {msg.role === 'assistant' && config.showSources && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          color: config.primaryColor,
                          backgroundColor: `${config.primaryColor}15`,
                        }}
                      >
                        Source: Help Center
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className={cn(
              'border-t px-3 py-2.5',
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
                className={cn(
                  'flex-1 bg-transparent text-sm outline-none placeholder-gray-400',
                  isDark ? 'text-gray-100' : 'text-gray-700'
                )}
                placeholder={config.placeholder || 'Type your message…'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                readOnly
              />
              <button
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className={cn('mt-1 text-center text-[10px]', isDark ? 'text-gray-600' : 'text-gray-400')}>
              🌴 Tropicalia
            </p>
          </div>
        </div>
      )}

      {/* Chat bubble button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105 text-2xl',
          config.position === 'bottom-left' ? 'self-start mr-auto ml-6' : ''
        )}
        style={{ backgroundColor: config.bubbleColor }}
        title={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <span>{config.avatarEmoji}</span>
        )}
      </button>
    </div>
  )
}
