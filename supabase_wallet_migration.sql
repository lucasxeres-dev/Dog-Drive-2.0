-- =====================================================
-- Dog Drive 2.0 - Wallet System Migration
-- =====================================================
-- This script creates the wallet_transactions table and adds wallet_balance to profiles
-- Execute this in your Supabase SQL Editor

-- 1. Add wallet_balance to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;

-- 2. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'cashback')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user 
  ON wallet_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type 
  ON wallet_transactions(type, status);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe 
  ON wallet_transactions(stripe_payment_id);

-- 4. Enable Row Level Security
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only backend (service role) can insert transactions
CREATE POLICY "Service role can insert transactions"
  ON wallet_transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only backend can update transaction status
CREATE POLICY "Service role can update transactions"
  ON wallet_transactions
  FOR UPDATE
  TO service_role
  USING (true);

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION update_wallet_transaction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_transaction_updated_at
  BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_transaction_timestamp();

-- 7. Function to update wallet balance (called by Edge Functions)
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_operation VARCHAR -- 'add' or 'subtract'
)
RETURNS DECIMAL AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  IF p_operation = 'add' THEN
    UPDATE profiles 
    SET wallet_balance = wallet_balance + p_amount 
    WHERE id = p_user_id
    RETURNING wallet_balance INTO new_balance;
  ELSIF p_operation = 'subtract' THEN
    UPDATE profiles 
    SET wallet_balance = wallet_balance - p_amount 
    WHERE id = p_user_id AND wallet_balance >= p_amount
    RETURNING wallet_balance INTO new_balance;
    
    IF new_balance IS NULL THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid operation';
  END IF;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Testing: Insert sample transactions
-- =====================================================
-- Uncomment to test with sample data

/*
-- Get your user ID first
SELECT id FROM auth.users LIMIT 1;

-- Give yourself some initial balance
UPDATE profiles SET wallet_balance = 100.00 WHERE id = 'YOUR_USER_ID';

-- Insert sample transactions
INSERT INTO wallet_transactions (user_id, type, amount, status, description) VALUES
  ('YOUR_USER_ID', 'deposit', 50.00, 'completed', 'Depósito inicial'),
  ('YOUR_USER_ID', 'payment', 15.00, 'completed', 'Passeio com Thor'),
  ('YOUR_USER_ID', 'cashback', 2.50, 'completed', 'Bônus de serviço');
*/

-- =====================================================
-- Verification
-- =====================================================
-- Check if table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'wallet_transactions';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'wallet_transactions';

-- Check wallet balance column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'wallet_balance';
