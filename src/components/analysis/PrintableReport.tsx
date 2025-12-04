import type { AnalysisResult, AnalysisCategory, AnalyzedItem, OnHandItem, TemplateItem } from '@/types'

interface PrintableReportProps {
  result: AnalysisResult
  templateName: string
  fileName: string
  reportName: string
}

const SECTION_CONFIG: {
  key: AnalysisCategory
  title: string
  shortTitle: string
  description: string
  color: string
}[] = [
  {
    key: 'overstocked',
    title: 'OVERSTOCKED ITEMS',
    shortTitle: 'Over',
    description: 'Items exceeding maximum stock levels',
    color: '#ea580c',
  },
  {
    key: 'understocked',
    title: 'UNDERSTOCKED ITEMS',
    shortTitle: 'Under',
    description: 'Items below minimum stock levels',
    color: '#ca8a04',
  },
  {
    key: 'not_in_template',
    title: 'ITEMS NOT IN TEMPLATE',
    shortTitle: 'Not In Template',
    description: 'Items on truck that should not be there',
    color: '#dc2626',
  },
  {
    key: 'negative',
    title: 'NEGATIVE QUANTITY ITEMS',
    shortTitle: 'Negative',
    description: 'Items with negative inventory (data errors)',
    color: '#9333ea',
  },
  {
    key: 'missing',
    title: 'MISSING ITEMS',
    shortTitle: 'Missing',
    description: 'Items in template but not found on truck',
    color: '#2563eb',
  },
  {
    key: 'correct',
    title: 'CORRECTLY STOCKED ITEMS',
    shortTitle: 'Correct',
    description: 'Items within acceptable min/max range',
    color: '#16a34a',
  },
]

function AnalyzedItemTable({ items }: { items: AnalyzedItem[] }) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          <th style={{ width: '15%' }}>Item Code</th>
          <th style={{ width: '40%' }}>Description</th>
          <th style={{ width: '12%', textAlign: 'right' }}>On Hand</th>
          <th style={{ width: '10%', textAlign: 'right' }}>Min</th>
          <th style={{ width: '10%', textAlign: 'right' }}>Max</th>
          <th style={{ width: '13%', textAlign: 'right' }}>Diff</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={`${item.item_code}-${index}`}>
            <td className="font-mono">{item.item_code}</td>
            <td>{item.item_description || '-'}</td>
            <td style={{ textAlign: 'right' }}>{item.on_hand}</td>
            <td style={{ textAlign: 'right' }}>{item.min_qty}</td>
            <td style={{ textAlign: 'right' }}>{item.max_qty}</td>
            <td style={{ textAlign: 'right', fontWeight: 600 }}>
              {item.difference > 0 ? '+' : ''}{item.difference}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OnHandItemTable({ items }: { items: OnHandItem[] }) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          <th style={{ width: '18%' }}>Item Code</th>
          <th style={{ width: '47%' }}>Description</th>
          <th style={{ width: '15%', textAlign: 'right' }}>On Hand</th>
          <th style={{ width: '20%' }}>Bin Location</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={`${item.item_code}-${index}`}>
            <td className="font-mono">{item.item_code}</td>
            <td>{item.item_description || item.item_name || '-'}</td>
            <td style={{ textAlign: 'right', color: item.on_hand < 0 ? '#dc2626' : 'inherit' }}>
              {item.on_hand}
            </td>
            <td>{item.bin_location || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TemplateItemTable({ items }: { items: TemplateItem[] }) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          <th style={{ width: '18%' }}>Item Code</th>
          <th style={{ width: '42%' }}>Description</th>
          <th style={{ width: '12%', textAlign: 'right' }}>Min</th>
          <th style={{ width: '12%', textAlign: 'right' }}>Max</th>
          <th style={{ width: '16%' }}>Unit</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={`${item.item_code}-${index}`}>
            <td className="font-mono">{item.item_code}</td>
            <td>{item.item_description || '-'}</td>
            <td style={{ textAlign: 'right' }}>{item.min_qty}</td>
            <td style={{ textAlign: 'right' }}>{item.max_qty}</td>
            <td>{item.unit_of_measure || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ReportSection({
  config,
  items,
  category
}: {
  config: typeof SECTION_CONFIG[0]
  items: AnalyzedItem[] | OnHandItem[] | TemplateItem[]
  category: AnalysisCategory
}) {
  const renderTable = () => {
    if (category === 'not_in_template' || category === 'negative') {
      return <OnHandItemTable items={items as OnHandItem[]} />
    }
    if (category === 'missing') {
      return <TemplateItemTable items={items as TemplateItem[]} />
    }
    return <AnalyzedItemTable items={items as AnalyzedItem[]} />
  }

  return (
    <div className="print-section">
      <div className="section-header" style={{ borderLeftColor: config.color }}>
        <div className="section-title">
          <span className="section-indicator" style={{ backgroundColor: config.color }} />
          {config.title} ({items.length})
        </div>
        <div className="section-description">{config.description}</div>
      </div>
      {items.length > 0 ? (
        renderTable()
      ) : (
        <div className="empty-section">No items in this category</div>
      )}
    </div>
  )
}

export function PrintableReport({ result, templateName, fileName: _fileName, reportName }: PrintableReportProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="print-only printable-report">
      {/* Running Header - appears on every page */}
      <div className="running-header">
        <div className="running-header-top">
          <div className="report-name">{reportName}</div>
          <div className="report-date">{currentDate}</div>
        </div>
        <div className="running-header-bottom">
          <span className="header-info">Template: {templateName}</span>
          <span className="header-divider">|</span>
          <span className="header-stat" style={{ color: '#ea580c' }}>Over: {result.overstocked.length}</span>
          <span className="header-divider">|</span>
          <span className="header-stat" style={{ color: '#ca8a04' }}>Under: {result.understocked.length}</span>
          <span className="header-divider">|</span>
          <span className="header-stat" style={{ color: '#dc2626' }}>Not in Tmpl: {result.not_in_template.length}</span>
          <span className="header-divider">|</span>
          <span className="header-stat" style={{ color: '#9333ea' }}>Negative: {result.negative.length}</span>
          <span className="header-divider">|</span>
          <span className="header-stat" style={{ color: '#2563eb' }}>Missing: {result.missing.length}</span>
          <span className="header-divider">|</span>
          <span className="header-stat" style={{ color: '#16a34a' }}>Correct: {result.correct.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="print-content">
        {SECTION_CONFIG.map((config) => (
          <ReportSection
            key={config.key}
            config={config}
            items={result[config.key]}
            category={config.key}
          />
        ))}
      </div>

      {/* Running Footer - appears on every page */}
      <div className="running-footer">
        <span className="footer-text">Truck Stock Analyzer</span>
      </div>
    </div>
  )
}
