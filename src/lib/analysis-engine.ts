import type { TemplateItem, AnalysisResult, AnalyzedItem } from '@/types'
import type { ParsedOnHandItem } from './excel-parser'

export function runAnalysis(
  templateItems: TemplateItem[],
  onHandItems: ParsedOnHandItem[]
): AnalysisResult {
  const result: AnalysisResult = {
    overstocked: [],
    understocked: [],
    not_in_template: [],
    negative: [],
    missing: [],
    correct: [],
  }

  // Create a map of template items by item code for quick lookup
  const templateMap = new Map<string, TemplateItem>()
  templateItems.forEach(item => {
    templateMap.set(item.item_code.toUpperCase(), item)
  })

  // Create a map of on-hand items by item code
  const onHandMap = new Map<string, ParsedOnHandItem>()
  onHandItems.forEach(item => {
    onHandMap.set(item.item_code.toUpperCase(), item)
  })

  // Check each on-hand item against template
  onHandItems.forEach(onHandItem => {
    const itemCodeUpper = onHandItem.item_code.toUpperCase()
    const templateItem = templateMap.get(itemCodeUpper)

    // Check for negative quantities first
    if (onHandItem.on_hand < 0) {
      result.negative.push({
        item_name: onHandItem.item_name,
        inventory_tags: onHandItem.inventory_tags,
        item_code: onHandItem.item_code,
        item_description: onHandItem.item_description,
        available: onHandItem.available,
        on_order: onHandItem.on_order,
        on_hold: onHandItem.on_hold,
        on_hand: onHandItem.on_hand,
        total_quantity: onHandItem.total_quantity,
        bin_location: onHandItem.bin_location,
      })
      return // Don't categorize further if negative
    }

    // Check if item is not in template
    if (!templateItem) {
      result.not_in_template.push({
        item_name: onHandItem.item_name,
        inventory_tags: onHandItem.inventory_tags,
        item_code: onHandItem.item_code,
        item_description: onHandItem.item_description,
        available: onHandItem.available,
        on_order: onHandItem.on_order,
        on_hold: onHandItem.on_hold,
        on_hand: onHandItem.on_hand,
        total_quantity: onHandItem.total_quantity,
        bin_location: onHandItem.bin_location,
      })
      return
    }

    // Item is in template, check stock levels
    const analyzedItem: AnalyzedItem = {
      item_code: onHandItem.item_code,
      item_description: onHandItem.item_description || templateItem.item_description || '',
      on_hand: onHandItem.on_hand,
      min_qty: templateItem.min_qty,
      max_qty: templateItem.max_qty,
      difference: 0,
      unit_of_measure: templateItem.unit_of_measure,
      bin_location: onHandItem.bin_location || templateItem.bin_location,
    }

    if (onHandItem.on_hand > templateItem.max_qty) {
      // Overstocked
      analyzedItem.difference = onHandItem.on_hand - templateItem.max_qty
      result.overstocked.push(analyzedItem)
    } else if (onHandItem.on_hand < templateItem.min_qty) {
      // Understocked
      analyzedItem.difference = onHandItem.on_hand - templateItem.min_qty
      result.understocked.push(analyzedItem)
    } else {
      // Correctly stocked
      result.correct.push(analyzedItem)
    }
  })

  // Check for missing items (in template but not on truck or quantity is 0)
  templateItems.forEach(templateItem => {
    const itemCodeUpper = templateItem.item_code.toUpperCase()
    const onHandItem = onHandMap.get(itemCodeUpper)

    // Item is missing if not found in on-hand or has 0 quantity
    if (!onHandItem || onHandItem.on_hand === 0) {
      // Make sure we haven't already counted this as understocked
      const isUnderstocked = result.understocked.some(
        item => item.item_code.toUpperCase() === itemCodeUpper
      )

      if (!isUnderstocked) {
        result.missing.push(templateItem)
      }
    }
  })

  // Sort results
  result.overstocked.sort((a, b) => b.difference - a.difference)
  result.understocked.sort((a, b) => a.difference - b.difference)
  result.not_in_template.sort((a, b) => a.item_code.localeCompare(b.item_code))
  result.negative.sort((a, b) => a.on_hand - b.on_hand)
  result.missing.sort((a, b) => a.item_code.localeCompare(b.item_code))
  result.correct.sort((a, b) => a.item_code.localeCompare(b.item_code))

  return result
}

export function getAnalysisSummary(result: AnalysisResult) {
  return {
    overstocked: result.overstocked.length,
    understocked: result.understocked.length,
    not_in_template: result.not_in_template.length,
    negative: result.negative.length,
    missing: result.missing.length,
    correct: result.correct.length,
    total:
      result.overstocked.length +
      result.understocked.length +
      result.not_in_template.length +
      result.negative.length +
      result.missing.length +
      result.correct.length,
  }
}
