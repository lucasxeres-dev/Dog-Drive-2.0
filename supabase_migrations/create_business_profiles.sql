-- Migration: Create business_profiles table
-- Execute this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nif VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255),
    business_phone VARCHAR(50),
    business_address TEXT,
    vat_registered BOOLEAN DEFAULT false,
    documents_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own business profile"
    ON business_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business profile"
    ON business_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
    ON business_profiles FOR UPDATE
    USING (auth.uid() = user_id);
