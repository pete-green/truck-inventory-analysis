import { Layout } from '@/components/layout/Layout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TemplateUpload } from '@/components/templates/TemplateUpload'
import { TemplateList } from '@/components/templates/TemplateList'
import { AnalysisWizard } from '@/components/analysis/AnalysisWizard'
import { useTemplates } from '@/hooks/useTemplates'
import { AlertCircle } from 'lucide-react'

function App() {
  const {
    templates,
    loading,
    error,
    createTemplate,
    deleteTemplate,
    getTemplateItems,
  } = useTemplates()

  return (
    <Layout>
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">Run Analysis</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <AnalysisWizard
            templates={templates}
            getTemplateItems={getTemplateItems}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateUpload onUpload={createTemplate} />
          <div>
            <h2 className="text-lg font-semibold mb-4">Saved Templates</h2>
            <TemplateList
              templates={templates}
              loading={loading}
              onDelete={deleteTemplate}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  )
}

export default App
