import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = ".xlsx,.xls",
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
      {fileName ? (
        <p className="text-sm text-foreground font-medium">{fileName}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">Excel files (.xlsx, .xls)</p>
        </>
      )}
    </div>
  )
}
