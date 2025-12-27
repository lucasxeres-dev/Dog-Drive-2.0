-- Fix: Add missing columns to profiles table
-- Execute in Supabase Dashboard → SQL Editor

-- Add address column (for providers)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add provider_services column (walker/boarding services)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider_services TEXT[];

-- Add document_url column (business documents)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS document_url TEXT;

-- Add business fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'none';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_shop BOOLEAN DEFAULT false;

-- Add country field
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'PT';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
