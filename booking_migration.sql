-- =====================================================
-- MULTI-LOCATION BOOKING EXPANSION
-- =====================================================
-- Execute this script in the Supabase SQL Editor to support
-- independent booking for multiple locations and services.

-- 1. Extend bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES business_locations(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES location_services(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dog_id UUID REFERENCES dogs(id);

-- 2. Update RLS for and cleanup policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers can view bookings for their locations" ON bookings;
CREATE POLICY "Providers can view bookings for their locations" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_locations bl
      JOIN business_profiles bp ON bl.business_id = bp.id
      WHERE bl.id = bookings.location_id AND bp.user_id = auth.uid()
    )
  );

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings(location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dog ON bookings(dog_id);
