import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MinusCircle,
  PackageX,
  CheckCircle2,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalysisCategory } from '@/types'

interface SummaryCardsProps {
  summary: {
    overstocked: number
    understocked: number
    not_in_template: number
    negative: number
    missing: number
    correct: number
    consumable: number
  }
  activeCategory: AnalysisCategory | null
  onCategoryClick: (category: AnalysisCategory) => void
}

const CATEGORIES: {
  key: AnalysisCategory
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  description: string
}[] = [
  {
    key: 'overstocked',
    label: 'Overstocked',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    description: 'Above max quantity',
  },
  {
    key: 'understocked',
    label: 'Understocked',
    icon: TrendingDown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    description: 'Below min quantity',
  },
  {
    key: 'not_in_template',
    label: 'Not in Template',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    description: 'Should not be on truck',
  },
  {
    key: 'negative',
    label: 'Negative Qty',
    icon: MinusCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    description: 'Negative inventory',
  },
  {
    key: 'consumable',
    label: 'Consumables',
    icon: Flame,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100',
    description: 'Needs adjustment to zero',
  },
  {
    key: 'missing',
    label: 'Missing',
    icon: PackageX,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    description: 'In template, not on truck',
  },
  {
    key: 'correct',
    label: 'Correct',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    description: 'Within min/max range',
  },
]

export function SummaryCards({ summary, activeCategory, onCategoryClick }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {CATEGORIES.map(({ key, label, icon: Icon, color, bgColor, description }) => (
        <Card
          key={key}
          className={cn(
            'cursor-pointer transition-all',
            bgColor,
            activeCategory === key && 'ring-2 ring-primary ring-offset-2'
          )}
          onClick={() => onCategoryClick(key)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Icon className={cn('h-5 w-5', color)} />
              <span className={cn('text-2xl font-bold', color)}>
                {summary[key]}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
