import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { parseTemplateFile, type ParsedTemplateItem } from '@/lib/excel-parser'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface TemplateUploadProps {
  onUpload: (
    templateData: {
      name: string
      trade: string
      department: string
      truck_type: string
    },
    items: ParsedTemplateItem[]
  ) => Promise<void>
}

const TRADE_OPTIONS = [
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'General', label: 'General' },
]

const TRUCK_TYPE_OPTIONS = [
  { value: 'Service', label: 'Service' },
  { value: 'Install', label: 'Install' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Commercial', label: 'Commercial' },
]

export function TemplateUpload({ onUpload }: TemplateUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedItems, setParsedItems] = useState<ParsedTemplateItem[]>([])
  const [name, setName] = useState('')
  const [trade, setTrade] = useState('')
  const [department, setDepartment] = useState('')
  const [truckType, setTruckType] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setSuccess(false)
    setParsedItems([])

    try {
      setIsParsing(true)
      const items = await parseTemplateFile(selectedFile)
      setParsedItems(items)

      // Auto-fill name from filename
      const fileName = selectedFile.name.replace(/\.(xlsx|xls)$/i, '')
      setName(fileName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setIsParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || parsedItems.length === 0) {
      setError('Please select a valid template file')
      return
    }

    if (!name || !trade || !truckType) {
      setError('Please fill in all required fields')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      await onUpload(
        {
          name,
          trade,
          department,
          truck_type: truckType,
        },
        parsedItems
      )

      // Reset form on success
      setFile(null)
      setParsedItems([])
      setName('')
      setTrade('')
      setDepartment('')
      setTruckType('')
      setSuccess(true)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload template')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Template</CardTitle>
        <CardDescription>
          Upload a truck stock template Excel file from Service Titan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            disabled={isUploading}
          />

          {isParsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing file...
            </div>
          )}

          {parsedItems.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Found {parsedItems.length} items in template
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Template Name *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HVAC Service Truck"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="trade" className="text-sm font-medium">
                Trade *
              </label>
              <Select
                id="trade"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                options={TRADE_OPTIONS}
                placeholder="Select trade..."
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="truck_type" className="text-sm font-medium">
                Truck Type *
              </label>
              <Select
                id="truck_type"
                value={truckType}
                onChange={(e) => setTruckType(e.target.value)}
                options={TRUCK_TYPE_OPTIONS}
                placeholder="Select truck type..."
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department (optional)
              </label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Residential"
                disabled={isUploading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Template uploaded successfully!
            </div>
          )}

          <Button
            type="submit"
            disabled={isUploading || parsedItems.length === 0}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Template'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
