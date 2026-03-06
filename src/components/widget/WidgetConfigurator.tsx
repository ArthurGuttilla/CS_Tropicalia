'use client'

import { useState, useEffect } from 'react'
import type { WidgetConfig } from '@/lib/types'
import { defaultWidgetConfig } from '@/lib/types'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import WidgetPreview from './WidgetPreview'
import { useToast } from '@/components/ui/Toast'
import { Save, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WidgetConfiguratorProps {
  projectId: string
}

type ConfigTab = 'identity' | 'behavior' | 'appearance' | 'restrictions'

const TABS: { id: ConfigTab; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'restrictions', label: 'Restrictions' },
]

const TONE_OPTIONS = [
  { value: 'friendly', label: '😊 Friendly' },
  { value: 'formal', label: '🎩 Formal' },
  { value: 'casual', label: '✌️ Casual' },
  { value: 'technical', label: '🔧 Technical' },
]

const RESPONSE_LENGTH_OPTIONS = [
  { value: 'concise', label: 'Concise (1–2 sentences)' },
  { value: 'moderate', label: 'Moderate (paragraph)' },
  { value: 'detailed', label: 'Detailed (thorough)' },
]

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
]

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Chinese', label: 'Chinese (Simplified)' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Arabic', label: 'Arabic' },
]

const EMOJI_OPTIONS = [
  '🤖', '💬', '🌴', '🌟', '💡', '🎯', '🦾', '🔮', '⚡', '🌊', '🎙️', '🤝',
]

export default function WidgetConfigurator({ projectId }: WidgetConfiguratorProps) {
  const [config, setConfig] = useState<WidgetConfig>(defaultWidgetConfig)
  const [activeTab, setActiveTab] = useState<ConfigTab>('identity')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetch(`/api/widget-config/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setConfig({ ...defaultWidgetConfig, ...d.config })
      })
      .finally(() => setLoading(false))
  }, [projectId])

  const update = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/widget-config/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Failed to save')
      success('Widget configuration saved!')
    } catch {
      error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Reset to default configuration?')) {
      setConfig(defaultWidgetConfig)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Config panel */}
      <div className="flex w-[420px] flex-shrink-0 flex-col border-r border-gray-100 bg-white overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-thin">
          {activeTab === 'identity' && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Avatar Emoji</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => update('avatarEmoji', emoji)}
                      className={cn(
                        'h-10 w-10 rounded-xl text-xl transition-all hover:scale-110',
                        config.avatarEmoji === emoji
                          ? 'ring-2 ring-brand-500 ring-offset-1'
                          : 'bg-gray-100 hover:bg-gray-200'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Chatbot Name"
                value={config.chatbotName}
                onChange={(e) => update('chatbotName', e.target.value)}
                placeholder="AI Assistant"
              />
              <Textarea
                label="Welcome Message"
                value={config.welcomeMessage}
                onChange={(e) => update('welcomeMessage', e.target.value)}
                placeholder="Hello! How can I help you today?"
                rows={2}
                hint="First message shown when the chat opens."
              />
              <Input
                label="Input Placeholder"
                value={config.placeholder}
                onChange={(e) => update('placeholder', e.target.value)}
                placeholder="Type your message..."
              />
            </>
          )}

          {activeTab === 'behavior' && (
            <>
              <Textarea
                label="System Instructions"
                value={config.systemPrompt}
                onChange={(e) => update('systemPrompt', e.target.value)}
                placeholder="You are a helpful customer support assistant..."
                rows={5}
                hint="These instructions guide how the AI responds. Be specific about your brand voice and support policies."
              />
              <Select
                label="Response Tone"
                value={config.tone}
                onChange={(e) =>
                  update('tone', e.target.value as WidgetConfig['tone'])
                }
                options={TONE_OPTIONS}
              />
              <Select
                label="Response Language"
                value={config.language}
                onChange={(e) => update('language', e.target.value)}
                options={LANGUAGE_OPTIONS}
              />
              <Select
                label="Response Length"
                value={config.maxResponseLength}
                onChange={(e) =>
                  update(
                    'maxResponseLength',
                    e.target.value as WidgetConfig['maxResponseLength']
                  )
                }
                options={RESPONSE_LENGTH_OPTIONS}
              />
              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Show Sources
                  </p>
                  <p className="text-xs text-gray-400">
                    Display the knowledge base documents used to answer
                  </p>
                </div>
                <button
                  onClick={() => update('showSources', !config.showSources)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    config.showSources ? 'bg-brand-600' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      config.showSources ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700">
                  Primary Color
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => {
                      update('primaryColor', e.target.value)
                      update('bubbleColor', e.target.value)
                    }}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 p-1"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => {
                      update('primaryColor', e.target.value)
                      update('bubbleColor', e.target.value)
                    }}
                    className="font-mono"
                    placeholder="#22c55e"
                  />
                </div>
                {/* Color presets */}
                <div className="mt-2 flex gap-2">
                  {[
                    '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b',
                    '#ef4444', '#06b6d4', '#ec4899', '#1e293b',
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        update('primaryColor', color)
                        update('bubbleColor', color)
                      }}
                      className={cn(
                        'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                        config.primaryColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Select
                label="Widget Position"
                value={config.position}
                onChange={(e) =>
                  update('position', e.target.value as WidgetConfig['position'])
                }
                options={POSITION_OPTIONS}
              />
              <Select
                label="Color Theme"
                value={config.theme}
                onChange={(e) =>
                  update('theme', e.target.value as WidgetConfig['theme'])
                }
                options={THEME_OPTIONS}
              />
            </>
          )}

          {activeTab === 'restrictions' && (
            <>
              <Textarea
                label="Allowed Topics"
                value={config.allowedTopics}
                onChange={(e) => update('allowedTopics', e.target.value)}
                placeholder="e.g. product support, billing, account management"
                rows={3}
                hint="Limit the chatbot to only answer questions about these topics."
              />
              <Textarea
                label="Denied Topics"
                value={config.deniedTopics}
                onChange={(e) => update('deniedTopics', e.target.value)}
                placeholder="e.g. competitor comparisons, legal advice"
                rows={3}
                hint="The chatbot will decline questions about these topics."
              />
              <Textarea
                label="Fallback Message"
                value={config.fallbackMessage}
                onChange={(e) => update('fallbackMessage', e.target.value)}
                placeholder="I'm sorry, I don't have information about that..."
                rows={3}
                hint="Shown when the AI cannot answer from the knowledge base."
              />
            </>
          )}
        </div>

        {/* Save bar */}
        <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            className="ml-auto"
            loading={saving}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-gray-100 bg-white px-5 py-3">
          <p className="text-sm font-medium text-gray-700">Live Preview</p>
          <p className="text-xs text-gray-400">
            Changes are reflected instantly in the preview below.
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <WidgetPreview config={config} />
        </div>
      </div>
    </div>
  )
}
