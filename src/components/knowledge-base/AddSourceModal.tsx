'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { FileText, Link2, AlignLeft, Upload, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type SourceType = 'document' | 'url' | 'text'

interface AddSourceModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  onAdded: (source: { id: string; name: string; type: SourceType; status: string }) => void
}

const SOURCE_TYPES: { type: SourceType; label: string; icon: React.ElementType; desc: string }[] = [
  {
    type: 'document',
    label: 'Document',
    icon: FileText,
    desc: 'PDF, DOCX, TXT, MD, CSV',
  },
  {
    type: 'url',
    label: 'URL / Website',
    icon: Link2,
    desc: 'Webpage or sitemap',
  },
  {
    type: 'text',
    label: 'Plain Text',
    icon: AlignLeft,
    desc: 'Paste any text content',
  },
]

export default function AddSourceModal({
  open,
  onClose,
  projectId,
  onAdded,
}: AddSourceModalProps) {
  const [sourceType, setSourceType] = useState<SourceType>('document')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, success } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      if (!name) setName(f.name.replace(/\.[^.]+$/, ''))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('projectId', projectId)
      formData.append('type', sourceType)
      formData.append('name', name.trim())

      if (sourceType === 'document' && file) {
        formData.append('file', file)
      } else if (sourceType === 'url') {
        formData.append('url', url.trim())
      } else if (sourceType === 'text') {
        formData.append('content', text.trim())
      }

      const res = await fetch('/api/knowledge-bases', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to add source')
      }

      const data = await res.json()
      success('Source added! Processing may take a moment.')
      onAdded(data.knowledgeBase)
      handleClose()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setUrl('')
    setText('')
    setFile(null)
    onClose()
  }

  const isValid =
    name.trim() &&
    ((sourceType === 'document' && file) ||
      (sourceType === 'url' && url.trim()) ||
      (sourceType === 'text' && text.trim()))

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Knowledge Source"
      description="Add content that the AI will use to answer customer questions."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Source type selector */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Source Type</p>
          <div className="grid grid-cols-3 gap-2">
            {SOURCE_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setSourceType(t.type)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all',
                  sourceType === t.type
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-xs font-semibold">{t.label}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Source Name"
          placeholder="e.g. Product FAQ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Type-specific inputs */}
        {sourceType === 'document' && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">File</p>
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5">
                <FileText className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span className="flex-1 truncate text-sm text-brand-700">{file.name}</span>
                <button type="button" onClick={() => setFile(null)}>
                  <X className="h-4 w-4 text-brand-400 hover:text-brand-600" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 transition-colors hover:border-brand-300 hover:bg-brand-50">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Click to upload
                </span>
                <span className="text-xs text-gray-400">
                  PDF, DOCX, TXT, MD, CSV — max 25 MB
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        )}

        {sourceType === 'url' && (
          <Input
            label="URL"
            type="url"
            placeholder="https://example.com/docs"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            hint="Tropicalia will crawl and index the page content."
            required
          />
        )}

        {sourceType === 'text' && (
          <Textarea
            label="Content"
            placeholder="Paste your text content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            required
          />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!isValid}>
            <Upload className="h-4 w-4" />
            Add Source
          </Button>
        </div>
      </form>
    </Modal>
  )
}
