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
  description: string
  color: string
}[] = [
  {
    key: 'overstocked',
    title: 'OVERSTOCKED ITEMS',
    description: 'Items exceeding maximum stock levels',
    color: '#ea580c',
  },
  {
    key: 'understocked',
    title: 'UNDERSTOCKED ITEMS',
    description: 'Items below minimum stock levels',
    color: '#ca8a04',
  },
  {
    key: 'not_in_template',
    title: 'ITEMS NOT IN TEMPLATE',
    description: 'Items on truck that should not be there',
    color: '#dc2626',
  },
  {
    key: 'negative',
    title: 'NEGATIVE QUANTITY ITEMS',
    description: 'Items with negative inventory (data errors)',
    color: '#9333ea',
  },
  {
    key: 'missing',
    title: 'MISSING ITEMS',
    description: 'Items in template but not found on truck',
    color: '#2563eb',
  },
  {
    key: 'correct',
    title: 'CORRECTLY STOCKED ITEMS',
    description: 'Items within acceptable min/max range',
    color: '#16a34a',
  },
]

function AnalyzedItemsRows({ items }: { items: AnalyzedItem[] }) {
  return (
    <>
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
    </>
  )
}

function OnHandItemsRows({ items }: { items: OnHandItem[] }) {
  return (
    <>
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
    </>
  )
}

function TemplateItemsRows({ items }: { items: TemplateItem[] }) {
  return (
    <>
      {items.map((item, index) => (
        <tr key={`${item.item_code}-${index}`}>
          <td className="font-mono">{item.item_code}</td>
          <td>{item.item_description || '-'}</td>
          <td style={{ textAlign: 'right' }}>{item.min_qty}</td>
          <td style={{ textAlign: 'right' }}>{item.max_qty}</td>
          <td>{item.unit_of_measure || '-'}</td>
        </tr>
      ))}
    </>
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
      {/* Use a table structure for repeating header/footer on each page */}
      <table className="print-wrapper-table">
        <thead>
          <tr>
            <td>
              <div className="page-header">
                <div className="page-header-top">
                  <div className="report-name">{reportName}</div>
                  <div className="report-date">{currentDate}</div>
                </div>
                <div className="page-header-bottom">
                  <span>Template: {templateName}</span>
                  <span className="header-divider">|</span>
                  <span style={{ color: '#ea580c' }}>Over: {result.overstocked.length}</span>
                  <span className="header-divider">|</span>
                  <span style={{ color: '#ca8a04' }}>Under: {result.understocked.length}</span>
                  <span className="header-divider">|</span>
                  <span style={{ color: '#dc2626' }}>Not in Tmpl: {result.not_in_template.length}</span>
                  <span className="header-divider">|</span>
                  <span style={{ color: '#9333ea' }}>Neg: {result.negative.length}</span>
                  <span className="header-divider">|</span>
                  <span style={{ color: '#2563eb' }}>Missing: {result.missing.length}</span>
                  <span className="header-divider">|</span>
                  <span style={{ color: '#16a34a' }}>OK: {result.correct.length}</span>
                </div>
              </div>
            </td>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td>
              <div className="page-footer">
                Truck Stock Analyzer
              </div>
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td>
              <div className="print-content">
                {SECTION_CONFIG.map((config) => {
                  const items = result[config.key]
                  const category = config.key

                  return (
                    <div key={config.key} className="print-section">
                      <div className="section-header" style={{ borderLeftColor: config.color }}>
                        <div className="section-title">
                          <span className="section-indicator" style={{ backgroundColor: config.color }} />
                          {config.title} ({items.length})
                        </div>
                        <div className="section-description">{config.description}</div>
                      </div>

                      {items.length > 0 ? (
                        <table className="print-table">
                          <thead>
                            {(category === 'not_in_template' || category === 'negative') ? (
                              <tr>
                                <th style={{ width: '20%' }}>Item Code</th>
                                <th style={{ width: '50%' }}>Description</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>On Hand</th>
                                <th style={{ width: '15%' }}>Bin Location</th>
                              </tr>
                            ) : category === 'missing' ? (
                              <tr>
                                <th style={{ width: '20%' }}>Item Code</th>
                                <th style={{ width: '45%' }}>Description</th>
                                <th style={{ width: '12%', textAlign: 'right' }}>Min</th>
                                <th style={{ width: '12%', textAlign: 'right' }}>Max</th>
                                <th style={{ width: '11%' }}>Unit</th>
                              </tr>
                            ) : (
                              <tr>
                                <th style={{ width: '18%' }}>Item Code</th>
                                <th style={{ width: '37%' }}>Description</th>
                                <th style={{ width: '12%', textAlign: 'right' }}>On Hand</th>
                                <th style={{ width: '11%', textAlign: 'right' }}>Min</th>
                                <th style={{ width: '11%', textAlign: 'right' }}>Max</th>
                                <th style={{ width: '11%', textAlign: 'right' }}>Diff</th>
                              </tr>
                            )}
                          </thead>
                          <tbody>
                            {(category === 'not_in_template' || category === 'negative') ? (
                              <OnHandItemsRows items={items as OnHandItem[]} />
                            ) : category === 'missing' ? (
                              <TemplateItemsRows items={items as TemplateItem[]} />
                            ) : (
                              <AnalyzedItemsRows items={items as AnalyzedItem[]} />
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-section">No items in this category</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
