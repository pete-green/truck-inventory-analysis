import * as XLSX from 'xlsx'
import type { OnHandItem, Truck } from '@/types'

/**
 * Formats a date as MM/DD/YYYY for Service Titan import
 */
function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

/**
 * Formats a date as MMDDYYYY for filename
 */
function formatDateForFilename(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}-${day}-${year}`
}

/**
 * Generates a timestamp-based reference number (max 32 chars, no special characters)
 */
function generateReference(): string {
  return Date.now().toString()
}

/**
 * Generates and downloads an Excel adjustment file for consumable items
 */
export function generateAdjustmentFile(
  consumables: OnHandItem[],
  truck: Truck,
  adjustmentDate: Date
): void {
  if (consumables.length === 0) {
    console.warn('No consumable items to export')
    return
  }

  // Generate reference numbers (same for all rows to group into one transfer)
  const importRef = generateReference()
  const refNumber = importRef

  // Build inventory location from truck number
  const inventoryLocation = `${truck.truck_number} Truck Inventory`

  // Format the adjustment date
  const formattedDate = formatDate(adjustmentDate)

  // Create data rows
  const data = consumables.map(item => ({
    'Import Reference': importRef,
    'Business Unit': truck.description,
    'Reference Number': refNumber,
    'Adjustment Date': formattedDate,
    'Adjustment Type': 'Inventory Quantity Adjustment',
    'Item Code': item.item_code,
    'Inventory Location': inventoryLocation,
    'Set Quantity On Hand To': 0,
    'Unit of Measure': ''
  }))

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 18 },  // Import Reference
    { wch: 18 },  // Business Unit
    { wch: 18 },  // Reference Number
    { wch: 14 },  // Adjustment Date
    { wch: 28 },  // Adjustment Type
    { wch: 20 },  // Item Code
    { wch: 22 },  // Inventory Location
    { wch: 22 },  // Set Quantity On Hand To
    { wch: 16 },  // Unit of Measure
  ]

  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'AdjustmentItems')

  // Generate filename
  const dateStr = formatDateForFilename(adjustmentDate)
  const filename = `Consumable_Adjustments_${truck.truck_number}_${dateStr}.xlsx`

  // Trigger download
  XLSX.writeFile(workbook, filename)
}
