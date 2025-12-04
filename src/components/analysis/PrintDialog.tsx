import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Printer } from 'lucide-react'

interface PrintDialogProps {
  isOpen: boolean
  onClose: () => void
  onPrint: (reportName: string) => void
  templateName: string
  fileName: string
}

export function PrintDialog({ isOpen, onClose, onPrint, templateName, fileName }: PrintDialogProps) {
  const [reportName, setReportName] = useState('')

  if (!isOpen) return null

  const handlePrint = () => {
    onPrint(reportName || `${templateName} Analysis`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePrint()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
          <h2 className="text-xl font-semibold mb-2">Print Report</h2>
          <p className="text-sm text-muted-foreground">
            Enter a name for this report. This will appear on every page.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="reportName" className="block text-sm font-medium mb-1.5">
              Report Name
            </label>
            <Input
              id="reportName"
              type="text"
              placeholder="e.g., Truck 2231 - Jorge"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <p className="font-medium text-gray-700 mb-1">Preview:</p>
            <p className="text-gray-600">
              <span className="font-semibold">{reportName || `${templateName} Analysis`}</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Template: {templateName} | File: {fileName}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  )
}
