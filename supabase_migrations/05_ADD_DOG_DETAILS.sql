-- FIX DOGS TABLE SCHEMA
-- Adds columns required by the Onboarding flow

ALTER TABLE dogs 
ADD COLUMN IF NOT EXISTS breed VARCHAR(255),
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_castrated BOOLEAN DEFAULT false;

-- Add indexes for common filters
CREATE INDEX IF NOT EXISTS idx_dogs_breed ON dogs(breed);
CREATE INDEX IF NOT EXISTS idx_dogs_size ON dogs(size);
CREATE INDEX IF NOT EXISTS idx_dogs_gender ON dogs(gender);
