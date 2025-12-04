import * as XLSX from 'xlsx'

export interface ParsedTemplateItem {
  item_code: string
  item_description: string | null
  min_qty: number
  max_qty: number
  unit_of_measure: string | null
  bin_location: string | null
}

export interface ParsedOnHandItem {
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

type ExcelRow = Record<string, unknown>

export async function parseTemplateFile(file: File): Promise<ParsedTemplateItem[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

  return jsonData.map((row) => ({
    item_code: String(row['ITEM CODE'] || '').trim(),
    item_description: row['ITEM DESCRIPTION'] ? String(row['ITEM DESCRIPTION']).trim() : null,
    min_qty: Number(row['MIN']) || 0,
    max_qty: Number(row['MAX']) || 0,
    unit_of_measure: row['UNIT OF MEASURE'] ? String(row['UNIT OF MEASURE']).trim() : null,
    bin_location: row['BIN LOCATION'] ? String(row['BIN LOCATION']).trim() : null,
  })).filter(item => item.item_code)
}

export async function parseOnHandFile(file: File): Promise<ParsedOnHandItem[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

  return jsonData.map((row) => ({
    item_name: String(row['Item Name'] || '').trim(),
    inventory_tags: String(row['Inventory Tags'] || '').trim(),
    item_code: String(row['Item Code'] || '').trim(),
    item_description: String(row['Item Description'] || '').trim(),
    available: Number(row['Available']) || 0,
    on_order: Number(row['On Order']) || 0,
    on_hold: Number(row['On Hold']) || 0,
    on_hand: Number(row['On Hand']) || 0,
    total_quantity: Number(row['Total Quantity']) || 0,
    bin_location: row['Bin Location'] ? String(row['Bin Location']).trim() : null,
  })).filter(item => item.item_code)
}
