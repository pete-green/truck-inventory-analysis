import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Template, TemplateItem } from '@/types'
import type { ParsedTemplateItem } from '@/lib/excel-parser'

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (templatesError) throw templatesError

      // Get item counts for each template
      const templatesWithCounts = await Promise.all(
        (templatesData || []).map(async (template) => {
          const { count } = await supabase
            .from('template_items')
            .select('*', { count: 'exact', head: true })
            .eq('template_id', template.id)

          return {
            ...template,
            item_count: count || 0,
          }
        })
      )

      setTemplates(templatesWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }, [])

  const createTemplate = useCallback(
    async (
      templateData: {
        name: string
        trade: string
        department: string
        truck_type: string
      },
      items: ParsedTemplateItem[]
    ) => {
      try {
        setError(null)

        // Create the template
        const { data: template, error: templateError } = await supabase
          .from('templates')
          .insert({
            name: templateData.name,
            trade: templateData.trade,
            department: templateData.department || null,
            truck_type: templateData.truck_type,
          })
          .select()
          .single()

        if (templateError) throw templateError

        // Insert template items
        const templateItems = items.map((item) => ({
          template_id: template.id,
          item_code: item.item_code,
          item_description: item.item_description,
          min_qty: item.min_qty,
          max_qty: item.max_qty,
          unit_of_measure: item.unit_of_measure,
          bin_location: item.bin_location,
        }))

        const { error: itemsError } = await supabase
          .from('template_items')
          .insert(templateItems)

        if (itemsError) throw itemsError

        // Refresh templates list
        await fetchTemplates()

        return template
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create template'
        setError(message)
        throw new Error(message)
      }
    },
    [fetchTemplates]
  )

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        setError(null)

        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', templateId)

        if (error) throw error

        // Refresh templates list
        await fetchTemplates()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete template'
        setError(message)
        throw new Error(message)
      }
    },
    [fetchTemplates]
  )

  const getTemplateItems = useCallback(async (templateId: string): Promise<TemplateItem[]> => {
    const { data, error } = await supabase
      .from('template_items')
      .select('*')
      .eq('template_id', templateId)

    if (error) throw error

    return data || []
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    createTemplate,
    deleteTemplate,
    getTemplateItems,
    refreshTemplates: fetchTemplates,
  }
}
