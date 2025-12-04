import { useState } from 'react'
import { TemplateCard } from './TemplateCard'
import { Loader2, FileX } from 'lucide-react'
import type { Template } from '@/types'

interface TemplateListProps {
  templates: Template[]
  loading: boolean
  onDelete: (id: string) => Promise<void>
}

export function TemplateList({ templates, loading, onDelete }: TemplateListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">No templates yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your first truck stock template to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onDelete={handleDelete}
          isDeleting={deletingId === template.id}
        />
      ))}
    </div>
  )
}
