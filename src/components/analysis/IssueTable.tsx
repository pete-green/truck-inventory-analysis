import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AnalysisResult, AnalysisCategory, AnalyzedItem, OnHandItem, TemplateItem } from '@/types'

interface IssueTableProps {
  category: AnalysisCategory
  result: AnalysisResult
}

type SortField = 'item_code' | 'on_hand' | 'difference' | 'min_qty' | 'max_qty'
type SortDirection = 'asc' | 'desc'

const CATEGORY_TITLES: Record<AnalysisCategory, string> = {
  overstocked: 'Overstocked Items',
  understocked: 'Understocked Items',
  not_in_template: 'Items Not in Template',
  negative: 'Negative Quantity Items',
  missing: 'Missing Items',
  correct: 'Correctly Stocked Items',
  consumable: 'Consumable Items (Need Adjustment)',
}

export function IssueTable({ category, result }: IssueTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('item_code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const items = result[category]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const searchLower = searchTerm.toLowerCase()
      const itemCode = 'item_code' in item ? item.item_code : ''
      const description = 'item_description' in item
        ? item.item_description
        : 'item_name' in item
        ? (item as OnHandItem).item_name
        : ''

      return (
        itemCode.toLowerCase().includes(searchLower) ||
        (description?.toLowerCase().includes(searchLower) ?? false)
      )
    })

    return filtered.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      if (sortField === 'item_code') {
        aVal = 'item_code' in a ? a.item_code : ''
        bVal = 'item_code' in b ? b.item_code : ''
      } else if (sortField === 'on_hand') {
        aVal = 'on_hand' in a ? (a as AnalyzedItem | OnHandItem).on_hand : 0
        bVal = 'on_hand' in b ? (b as AnalyzedItem | OnHandItem).on_hand : 0
      } else if (sortField === 'difference') {
        aVal = 'difference' in a ? (a as AnalyzedItem).difference : 0
        bVal = 'difference' in b ? (b as AnalyzedItem).difference : 0
      } else if (sortField === 'min_qty') {
        aVal = 'min_qty' in a ? (a as AnalyzedItem | TemplateItem).min_qty : 0
        bVal = 'min_qty' in b ? (b as AnalyzedItem | TemplateItem).min_qty : 0
      } else if (sortField === 'max_qty') {
        aVal = 'max_qty' in a ? (a as AnalyzedItem | TemplateItem).max_qty : 0
        bVal = 'max_qty' in b ? (b as AnalyzedItem | TemplateItem).max_qty : 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [items, searchTerm, sortField, sortDirection])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )

  const renderTable = () => {
    if (category === 'not_in_template' || category === 'negative' || category === 'consumable') {
      // On-hand items format
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="item_code">Item Code</SortButton>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">
                <SortButton field="on_hand">On Hand</SortButton>
              </TableHead>
              <TableHead>Bin Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.map((item, index) => {
              const onHandItem = item as OnHandItem
              return (
                <TableRow key={`${onHandItem.item_code}-${index}`}>
                  <TableCell className="font-mono">{onHandItem.item_code}</TableCell>
                  <TableCell>{onHandItem.item_description || onHandItem.item_name}</TableCell>
                  <TableCell className={`text-right font-medium ${onHandItem.on_hand < 0 ? 'text-red-600' : ''}`}>
                    {onHandItem.on_hand}
                  </TableCell>
                  <TableCell>{onHandItem.bin_location || '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
    }

    if (category === 'missing') {
      // Template items format (missing from truck)
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="item_code">Item Code</SortButton>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">
                <SortButton field="min_qty">Min</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="max_qty">Max</SortButton>
              </TableHead>
              <TableHead>Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.map((item, index) => {
              const templateItem = item as TemplateItem
              return (
                <TableRow key={`${templateItem.item_code}-${index}`}>
                  <TableCell className="font-mono">{templateItem.item_code}</TableCell>
                  <TableCell>{templateItem.item_description || '-'}</TableCell>
                  <TableCell className="text-right">{templateItem.min_qty}</TableCell>
                  <TableCell className="text-right">{templateItem.max_qty}</TableCell>
                  <TableCell>{templateItem.unit_of_measure || '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
    }

    // Analyzed items format (overstocked, understocked, correct)
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="item_code">Item Code</SortButton>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">
              <SortButton field="on_hand">On Hand</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="min_qty">Min</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="max_qty">Max</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="difference">Diff</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedItems.map((item, index) => {
            const analyzedItem = item as AnalyzedItem
            return (
              <TableRow key={`${analyzedItem.item_code}-${index}`}>
                <TableCell className="font-mono">{analyzedItem.item_code}</TableCell>
                <TableCell>{analyzedItem.item_description || '-'}</TableCell>
                <TableCell className="text-right font-medium">{analyzedItem.on_hand}</TableCell>
                <TableCell className="text-right text-muted-foreground">{analyzedItem.min_qty}</TableCell>
                <TableCell className="text-right text-muted-foreground">{analyzedItem.max_qty}</TableCell>
                <TableCell className={`text-right font-medium ${
                  analyzedItem.difference > 0 ? 'text-orange-600' :
                  analyzedItem.difference < 0 ? 'text-yellow-600' : ''
                }`}>
                  {analyzedItem.difference > 0 ? '+' : ''}{analyzedItem.difference}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg">
            {CATEGORY_TITLES[category]} ({filteredAndSortedItems.length})
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedItems.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No items match your search.' : 'No items in this category.'}
          </p>
        ) : (
          <div className="rounded-md border">
            {renderTable()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
