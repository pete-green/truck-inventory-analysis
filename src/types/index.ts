export interface Template {
  id: string
  name: string
  trade: string
  department: string | null
  truck_type: string
  created_at: string
  updated_at: string
  item_count?: number
}

export interface TemplateItem {
  id: string
  template_id: string
  item_code: string
  item_description: string | null
  min_qty: number
  max_qty: number
  unit_of_measure: string | null
  bin_location: string | null
}

export interface OnHandItem {
  item_name: string
  inventory_tags: string
  item_code: string
  item_description: string
  available: number
  on_order: number
  on_hold: number
  on_hand: number
  total_quantity: number
  bin_location: string | null
}

export interface AnalysisResult {
  overstocked: AnalyzedItem[]
  understocked: AnalyzedItem[]
  not_in_template: OnHandItem[]
  negative: OnHandItem[]
  missing: TemplateItem[]
  correct: AnalyzedItem[]
}

export interface AnalyzedItem {
  item_code: string
  item_description: string
  on_hand: number
  min_qty: number
  max_qty: number
  difference: number
  unit_of_measure: string | null
  bin_location: string | null
}

export type AnalysisCategory =
  | 'overstocked'
  | 'understocked'
  | 'not_in_template'
  | 'negative'
  | 'missing'
  | 'correct'
