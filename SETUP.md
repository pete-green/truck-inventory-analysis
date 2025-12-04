# Setup Guide

This guide covers setting up the Truck Stock Analyzer application, including Supabase database configuration and Netlify deployment.

## 1. Supabase Database Setup

### Create Tables

Run the following SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query):

```sql
-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  department TEXT,
  truck_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create template_items table
CREATE TABLE IF NOT EXISTS template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  item_description TEXT,
  min_qty INTEGER NOT NULL DEFAULT 0,
  max_qty INTEGER NOT NULL DEFAULT 0,
  unit_of_measure TEXT,
  bin_location TEXT,
  UNIQUE(template_id, item_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_item_code ON template_items(item_code);

-- Enable Row Level Security (but allow all access since no auth)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access (no auth required)
CREATE POLICY "Allow all access to templates" ON templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to template_items" ON template_items FOR ALL USING (true) WITH CHECK (true);
```

### Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

## 2. Environment Configuration

### Local Development

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Netlify Deployment

Add these environment variables in Netlify:
1. Go to Site settings > Environment variables
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

## 3. Netlify Deployment

### Option A: Deploy via Netlify Dashboard

1. Log in to [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select `truck-inventory-analysis`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables (see above)
6. Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

## 4. Verify Setup

1. Open your deployed site URL
2. Go to the "Templates" tab
3. Try uploading a template file
4. If successful, templates will appear in the list

### Troubleshooting

**"Failed to fetch templates" error:**
- Check that Supabase tables are created correctly
- Verify environment variables are set
- Check browser console for detailed error messages

**"Failed to parse file" error:**
- Ensure the Excel file has the expected column headers
- Check that the file is in .xlsx or .xls format

**Tables not showing in Supabase:**
- Make sure you ran the SQL in the correct project
- Check the Table Editor in Supabase dashboard

## Database Schema

### templates table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Template name (e.g., "HVAC Service Truck") |
| trade | TEXT | Trade type (HVAC, Plumbing, etc.) |
| department | TEXT | Department (optional) |
| truck_type | TEXT | Truck type (Service, Install, etc.) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### template_items table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| template_id | UUID | Foreign key to templates |
| item_code | TEXT | Unique item identifier |
| item_description | TEXT | Item description |
| min_qty | INTEGER | Minimum stock quantity |
| max_qty | INTEGER | Maximum stock quantity |
| unit_of_measure | TEXT | Unit (Each, Box, etc.) |
| bin_location | TEXT | Storage location on truck |
