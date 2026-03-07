'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Project } from '@/lib/types'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreated: (project: Project) => void
}

export default function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { error, success } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create project')
      }

      const data = await res.json()
      success('Project created successfully!')
      onCreated(data.project)
      setName('')
      setDescription('')
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
      title="Create New Project"
      description="A project contains a knowledge base and a configured chat widget."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. Acme Support Bot"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Textarea
          label="Description"
          placeholder="Briefly describe what this project is for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          hint="Optional — helps you identify this project later."
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
