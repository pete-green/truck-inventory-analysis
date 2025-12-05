import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { X, Download, Loader2 } from 'lucide-react'
import type { Truck } from '@/types'

interface AdjustmentExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (truck: Truck, date: Date) => void
  trucks: Truck[]
  loadingTrucks: boolean
  consumableCount: number
}

export function AdjustmentExportDialog({
  isOpen,
  onClose,
  onExport,
  trucks,
  loadingTrucks,
  consumableCount,
}: AdjustmentExportDialogProps) {
  const [selectedTruckId, setSelectedTruckId] = useState('')
  const [adjustmentDate, setAdjustmentDate] = useState('')

  // Set default date to today when dialog opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD format for input
      setAdjustmentDate(dateStr)
      setSelectedTruckId('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const truckOptions = trucks.map((truck) => ({
    value: truck.id,
    label: `${truck.truck_number} - ${truck.description}${truck.current_tech ? ` (${truck.current_tech})` : ''}`,
  }))

  const selectedTruck = trucks.find((t) => t.id === selectedTruckId)

  const handleExport = () => {
    if (!selectedTruck || !adjustmentDate) return

    const date = new Date(adjustmentDate + 'T00:00:00') // Parse as local date
    onExport(selectedTruck, date)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Create Adjustment File</h2>
          <p className="text-sm text-muted-foreground">
            Generate an Excel file to zero out consumable items in Service Titan.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="truck" className="block text-sm font-medium mb-1.5">
              Select Truck
            </label>
            {loadingTrucks ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading trucks...
              </div>
            ) : (
              <Select
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
                options={truckOptions}
                placeholder="Select a truck..."
              />
            )}
          </div>

          <div>
            <label htmlFor="adjustmentDate" className="block text-sm font-medium mb-1.5">
              Adjustment Date
            </label>
            <Input
              id="adjustmentDate"
              type="date"
              value={adjustmentDate}
              onChange={(e) => setAdjustmentDate(e.target.value)}
            />
          </div>

          {selectedTruck && (
            <div className="bg-gray-50 rounded-md p-3 text-sm">
              <p className="font-medium text-gray-700 mb-2">Export Preview:</p>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Business Unit:</span> {selectedTruck.description}</p>
                <p><span className="font-medium">Inventory Location:</span> {selectedTruck.truck_number} Truck Inventory</p>
                <p><span className="font-medium">Items to adjust:</span> {consumableCount}</p>
                <p><span className="font-medium">Set Quantity To:</span> 0</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedTruckId || !adjustmentDate || loadingTrucks}
          >
            <Download className="h-4 w-4" />
            Create File
          </Button>
        </div>
      </div>
    </div>
  )
}
