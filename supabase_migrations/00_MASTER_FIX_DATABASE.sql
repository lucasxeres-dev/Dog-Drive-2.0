-- MASTER DATABASE MIGRATION - Complete Schema Fix
-- Execute this ONCE in Supabase Dashboard → SQL Editor
-- This consolidates ALL necessary schema changes

-- ============================================
-- PART 1: FIX PROFILES TABLE
-- ============================================

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS provider_services TEXT[],
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS has_shop BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'PT',
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- ============================================
-- PART 2: CREATE BUSINESS_PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nif VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255),
    business_phone VARCHAR(50),
    business_address TEXT,
    vat_registered BOOLEAN DEFAULT false,
    documents_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own business profile" ON business_profiles;
CREATE POLICY "Users can view own business profile" ON business_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own business profile" ON business_profiles;
CREATE POLICY "Users can insert own business profile" ON business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own business profile" ON business_profiles;
CREATE POLICY "Users can update own business profile" ON business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PART 3: ENSURE STORAGE BUCKETS EXIST
-- ============================================

-- Create pet-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 4: STORAGE POLICIES (pet-photos)
-- ============================================

DROP POLICY IF EXISTS "Users can upload to their own pet photos folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can view pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pet photos" ON storage.objects;

CREATE POLICY "Users can upload to their own pet photos folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'pet-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view pet photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can delete their own pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'pet-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- PART 5: STORAGE POLICIES (documents)
-- ============================================

DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- PART 6: STORAGE POLICIES (avatars)
-- ============================================

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- PART 7: VERIFY SCHEMA
-- ============================================

-- Check profiles columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check business_profiles exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'business_profiles'
) AS business_profiles_exists;

-- Check storage buckets
SELECT id, name, public FROM storage.buckets
WHERE id IN ('pet-photos', 'documents', 'avatars');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema fixed successfully!';
    RAISE NOTICE 'Profiles table updated with all columns';
    RAISE NOTICE 'Business profiles table created';
    RAISE NOTICE 'Storage buckets configured';
    RAISE NOTICE 'RLS policies applied';
END $$;
