import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { SummaryCards } from './SummaryCards'
import { IssueTable } from './IssueTable'
import { PrintableReport } from './PrintableReport'
import { PrintDialog } from './PrintDialog'
import { parseOnHandFile } from '@/lib/excel-parser'
import { runAnalysis, getAnalysisSummary } from '@/lib/analysis-engine'
import { Loader2, AlertCircle, RotateCcw, Printer } from 'lucide-react'
import type { Template, TemplateItem, AnalysisResult, AnalysisCategory } from '@/types'

interface AnalysisWizardProps {
  templates: Template[]
  getTemplateItems: (templateId: string) => Promise<TemplateItem[]>
}

export function AnalysisWizard({ templates, getTemplateItems }: AnalysisWizardProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeCategory, setActiveCategory] = useState<AnalysisCategory | null>(null)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [reportName, setReportName] = useState('')

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.trade} - ${t.truck_type})`,
  }))

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setResult(null)
    setActiveCategory(null)
  }

  const handleAnalyze = async () => {
    if (!selectedTemplateId) {
      setError('Please select a template')
      return
    }

    if (!file) {
      setError('Please upload an on-hand inventory file')
      return
    }

    setError(null)
    setIsAnalyzing(true)

    try {
      // Get template items
      const templateItems = await getTemplateItems(selectedTemplateId)

      if (templateItems.length === 0) {
        throw new Error('Selected template has no items')
      }

      // Parse on-hand file
      const onHandItems = await parseOnHandFile(file)

      if (onHandItems.length === 0) {
        throw new Error('On-hand file has no items')
      }

      // Run analysis
      const analysisResult = runAnalysis(templateItems, onHandItems)
      setResult(analysisResult)

      // Set default active category to first non-empty category
      const categories: AnalysisCategory[] = ['negative', 'not_in_template', 'overstocked', 'understocked', 'missing', 'correct']
      for (const cat of categories) {
        if (analysisResult[cat].length > 0) {
          setActiveCategory(cat)
          break
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedTemplateId('')
    setFile(null)
    setResult(null)
    setActiveCategory(null)
    setError(null)
  }

  const handlePrintClick = () => {
    setShowPrintDialog(true)
  }

  const handlePrintConfirm = (name: string) => {
    setReportName(name)
    setShowPrintDialog(false)
    // Use setTimeout to ensure state is updated before printing
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const summary = result ? getAnalysisSummary(result) : null
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  return (
    <div className="space-y-6">
      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Run Inventory Analysis</CardTitle>
            <CardDescription>
              Compare your truck's on-hand inventory against a stock template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No templates available. Please upload a template first.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    1. Select Template to Compare Against
                  </label>
                  <Select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    options={templateOptions}
                    placeholder="Select a template..."
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    2. Upload On-Hand Inventory File
                  </label>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    disabled={isAnalyzing}
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedTemplateId || !file}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    '3. Run Analysis'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
            <div>
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate?.name} vs {file?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintClick}>
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </div>

          {/* Print Dialog */}
          <PrintDialog
            isOpen={showPrintDialog}
            onClose={() => setShowPrintDialog(false)}
            onPrint={handlePrintConfirm}
            templateName={selectedTemplate?.name || 'Unknown Template'}
            fileName={file?.name || 'Unknown File'}
          />

          {/* Printable Report - only visible when printing */}
          <PrintableReport
            result={result}
            templateName={selectedTemplate?.name || 'Unknown Template'}
            fileName={file?.name || 'Unknown File'}
            reportName={reportName || `${selectedTemplate?.name || 'Inventory'} Analysis`}
          />

          {summary && (
            <div className="no-print">
              <SummaryCards
                summary={summary}
                activeCategory={activeCategory}
                onCategoryClick={setActiveCategory}
              />
            </div>
          )}

          {activeCategory && (
            <div className="no-print">
              <IssueTable category={activeCategory} result={result} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
