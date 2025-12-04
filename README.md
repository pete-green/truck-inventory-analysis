# Truck Stock Analyzer

A web application to analyze truck inventory against stock templates, identifying discrepancies like overstocked items, items not in template, negative quantities, and understocked items.

## Features

- **Template Management**: Upload and store truck stock templates from Service Titan
- **Inventory Analysis**: Compare on-hand inventory against templates
- **Issue Detection**: Automatically identifies:
  - Overstocked items (quantity > max)
  - Understocked items (quantity < min)
  - Items not in template (shouldn't be on truck)
  - Negative quantities (inventory errors)
  - Missing items (in template but not on truck)
  - Correctly stocked items

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Excel Parsing**: SheetJS (xlsx)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account with project set up

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pete-green/truck-inventory-analysis.git
cd truck-inventory-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database (see SETUP.md for details)

5. Run the development server:
```bash
npm run dev
```

## File Formats

### Template File (from Service Titan)
Expected columns:
- `ITEM CODE` - Unique identifier
- `ITEM DESCRIPTION` - Item name/description
- `MIN` - Minimum quantity
- `MAX` - Maximum quantity
- `UNIT OF MEASURE` - Unit (Each, etc.)
- `BIN LOCATION` - Storage location

### On-Hand File (from Service Titan)
Expected columns:
- `Item Name` - Display name
- `Inventory Tags` - Tracking status
- `Item Code` - Unique identifier
- `Item Description` - Description
- `Available` - Available quantity
- `On Order` - Quantity on order
- `On Hold` - Quantity on hold
- `On Hand` - Current physical quantity (used for comparison)
- `Total Quantity` - Total quantity
- `Bin Location` - Storage location

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Layout)
│   ├── templates/       # Template management components
│   ├── analysis/        # Analysis wizard and results components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── excel-parser.ts  # Excel file parsing utilities
│   ├── analysis-engine.ts # Analysis logic
│   └── utils.ts         # Utility functions
├── hooks/
│   └── useTemplates.ts  # Template data hook
├── types/
│   ├── index.ts         # App types
│   └── database.ts      # Database types
├── App.tsx              # Main application
└── main.tsx             # Entry point
```

## License

MIT
