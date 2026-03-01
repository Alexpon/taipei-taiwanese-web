-- 003_storage_bucket.sql
-- Create Supabase Storage bucket for media uploads

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for media bucket
CREATE POLICY "Public read access for media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Authenticated users can update files
CREATE POLICY "Authenticated users can update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Authenticated users can delete files
CREATE POLICY "Authenticated users can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');
