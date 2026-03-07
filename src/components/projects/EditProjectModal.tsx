'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Project } from '@/lib/types'

interface EditProjectModalProps {
  open: boolean
  onClose: () => void
  project: Project
  onUpdated: (project: Project) => void
}

export default function EditProjectModal({
  open,
  onClose,
  project,
  onUpdated,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [loading, setLoading] = useState(false)
  const { error, success } = useToast()

  useEffect(() => {
    setName(project.name)
    setDescription(project.description ?? '')
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update project')
      }

      const data = await res.json()
      success('Project updated!')
      onUpdated(data.project)
      onClose()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Project"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          hint="Optional"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
