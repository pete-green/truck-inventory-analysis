import type { AnalysisResult, AnalysisCategory, AnalyzedItem, OnHandItem, TemplateItem } from '@/types'

interface PrintableReportProps {
  result: AnalysisResult
  templateName: string
  fileName: string
}

const SECTION_CONFIG: {
  key: AnalysisCategory
  title: string
  description: string
  color: string
}[] = [
  {
    key: 'overstocked',
    title: 'OVERSTOCKED ITEMS',
    description: 'Items exceeding maximum stock levels',
    color: '#ea580c', // orange-600
  },
  {
    key: 'understocked',
    title: 'UNDERSTOCKED ITEMS',
    description: 'Items below minimum stock levels',
    color: '#ca8a04', // yellow-600
  },
  {
    key: 'not_in_template',
    title: 'ITEMS NOT IN TEMPLATE',
    description: 'Items on truck that should not be there',
    color: '#dc2626', // red-600
  },
  {
    key: 'negative',
    title: 'NEGATIVE QUANTITY ITEMS',
    description: 'Items with negative inventory (data errors)',
    color: '#9333ea', // purple-600
  },
  {
    key: 'missing',
    title: 'MISSING ITEMS',
    description: 'Items in template but not found on truck',
    color: '#2563eb', // blue-600
  },
  {
    key: 'correct',
    title: 'CORRECTLY STOCKED ITEMS',
    description: 'Items within acceptable min/max range',
    color: '#16a34a', // green-600
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
          <th style={{ width: '13%', textAlign: 'right' }}>Difference</th>
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

export function PrintableReport({ result, templateName, fileName }: PrintableReportProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const totalItems =
    result.overstocked.length +
    result.understocked.length +
    result.not_in_template.length +
    result.negative.length +
    result.missing.length +
    result.correct.length

  return (
    <div className="print-only printable-report">
      {/* Report Header */}
      <div className="report-header">
        <h1>TRUCK INVENTORY ANALYSIS REPORT</h1>
        <div className="report-meta">
          <div className="meta-item">
            <span className="meta-label">Template:</span>
            <span className="meta-value">{templateName}</span>
          </div>
          <div className="meta-divider">|</div>
          <div className="meta-item">
            <span className="meta-label">Analyzed File:</span>
            <span className="meta-value">{fileName}</span>
          </div>
          <div className="meta-divider">|</div>
          <div className="meta-item">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{currentDate}</span>
          </div>
        </div>
        <div className="report-summary">
          Total Items Analyzed: {totalItems}
        </div>
      </div>

      {/* All Sections */}
      {SECTION_CONFIG.map((config) => (
        <ReportSection
          key={config.key}
          config={config}
          items={result[config.key]}
          category={config.key}
        />
      ))}

      {/* Report Footer */}
      <div className="report-footer">
        Generated by Truck Stock Analyzer
      </div>
    </div>
  )
}
