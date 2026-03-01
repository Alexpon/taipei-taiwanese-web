-- 002_rls_policies.sql
-- Row Level Security policies for all tables

-- Enable RLS on all tables
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- News: public can read published only, authenticated has full access
CREATE POLICY "Public can read published news"
  ON news FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users have full access to news"
  ON news FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Events: public can read published only, authenticated has full access
CREATE POLICY "Public can read published events"
  ON events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users have full access to events"
  ON events FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Pages: public can read all, authenticated has full access
CREATE POLICY "Public can read all pages"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users have full access to pages"
  ON pages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Site settings: public can read all, authenticated has full access
CREATE POLICY "Public can read all site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users have full access to site_settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
