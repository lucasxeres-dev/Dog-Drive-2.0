-- =====================================================
-- Dog Drive 2.0 - GPS Tracking Migration
-- =====================================================
-- This script creates the location_updates table for real-time GPS tracking
-- Execute this in your Supabase SQL Editor

-- 1. Create the location_updates table
CREATE TABLE IF NOT EXISTS location_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  accuracy DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_location_updates_booking 
  ON location_updates(booking_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_location_updates_provider 
  ON location_updates(provider_id, timestamp DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Allow providers to insert their own location updates
CREATE POLICY "Providers can insert own location updates"
  ON location_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = provider_id);

-- Allow clients to view location updates for their bookings
CREATE POLICY "Clients can view location updates for their bookings"
  ON location_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = location_updates.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

-- Allow providers to view their own location updates
CREATE POLICY "Providers can view own location updates"
  ON location_updates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id);

-- 5. Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE location_updates;

-- 6. (Optional) Add columns to business_profiles for static location
-- Uncomment if your business_profiles table doesn't have these columns yet:

-- ALTER TABLE business_profiles 
-- ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
-- ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
-- ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- =====================================================
-- Testing: Insert sample data
-- =====================================================
-- Uncomment to test with sample GPS points (Lisbon area)

/*
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy) VALUES
  ('YOUR_BOOKING_ID', 'YOUR_PROVIDER_ID', 38.7223, -9.1393, 5.0),
  ('YOUR_BOOKING_ID', 'YOUR_PROVIDER_ID', 38.7225, -9.1395, 5.0),
  ('YOUR_BOOKING_ID', 'YOUR_PROVIDER_ID', 38.7227, -9.1397, 5.0);
*/

-- =====================================================
-- Verification
-- =====================================================
-- Check if table was created successfully
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'location_updates';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'location_updates';
