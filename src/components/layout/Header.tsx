import { Truck } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Truck Stock Analyzer</h1>
            <p className="text-sm text-muted-foreground">Inventory comparison & analysis tool</p>
          </div>
        </div>
      </div>
    </header>
  )
}
