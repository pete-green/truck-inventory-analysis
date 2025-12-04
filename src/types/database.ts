export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string
          name: string
          trade: string
          department: string | null
          truck_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          trade: string
          department?: string | null
          truck_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          trade?: string
          department?: string | null
          truck_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_items: {
        Row: {
          id: string
          template_id: string
          item_code: string
          item_description: string | null
          min_qty: number
          max_qty: number
          unit_of_measure: string | null
          bin_location: string | null
        }
        Insert: {
          id?: string
          template_id: string
          item_code: string
          item_description?: string | null
          min_qty?: number
          max_qty?: number
          unit_of_measure?: string | null
          bin_location?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          item_code?: string
          item_description?: string | null
          min_qty?: number
          max_qty?: number
          unit_of_measure?: string | null
          bin_location?: string | null
        }
      }
    }
  }
}
