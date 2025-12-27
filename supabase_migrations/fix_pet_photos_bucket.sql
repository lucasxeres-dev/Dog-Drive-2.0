-- Ensure pet-photos bucket exists with correct RLS policies
-- Execute this in Supabase Dashboard → SQL Editor

-- Create bucket if it doesn't exist (Supabase auto-creates, but let's be explicit)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can upload pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pet photos" ON storage.objects;

-- Policy 1: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload to their own pet photos folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'pet-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Public read access
CREATE POLICY "Public can view pet photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-photos');

-- Policy 3: Users can delete their own photos
CREATE POLICY "Users can delete their own pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'pet-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify setup
SELECT * FROM storage.buckets WHERE id = 'pet-photos';
