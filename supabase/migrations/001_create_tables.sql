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
