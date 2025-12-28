-- =====================================================
-- RESET COMPLETO + SETUP
-- =====================================================
-- Este script LIMPA tudo e recria do zero
-- Execute no Supabase SQL Editor

-- 1. LIMPAR tabelas antigas (se existirem)
DROP TABLE IF EXISTS location_updates CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 2. CRIAR tabela GPS
CREATE TABLE location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  provider_id UUID,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  accuracy DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_location_updates_booking ON location_updates(booking_id);

-- 2.1 SEGURANÇA GPS (RLS)
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own booking locations" ON location_updates
  FOR SELECT USING (
    auth.uid() = provider_id OR 
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND user_id = auth.uid())
  );

CREATE POLICY "Providers can insert their own locations" ON location_updates
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- 3. CRIAR coluna wallet_balance (ignora se já existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;

-- 4. CRIAR tabela wallet_transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type VARCHAR(20) CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'cashback')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);

-- 4.1 SEGURANÇA WALLET (RLS)
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 5. CRIAR tabela products (se não existir)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('food', 'toys', 'accessories', 'treats', 'grooming', 'other')),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.1 SEGURANÇA PRODUTOS (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- 6. INSERIR produtos (ignora duplicados)
INSERT INTO products (name, description, price, category, image_url, stock_quantity, rating)
VALUES
  ('Ração Premium High Pro 15kg', 'Nutrição completa para cães adultos', 85.90, 'food', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500', 50, 4.8),
  ('Bola Interativa Kong', 'Brinquedo resistente', 24.90, 'toys', 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=500', 100, 4.9),
  ('Coleira Premium com GPS', 'Rastreamento em tempo real', 129.90, 'accessories', 'https://images.unsplash.com/photo-1605466218597-c8e98267f14d?w=500', 30, 4.7),
  ('Cama Ortopédica Confort', 'Máximo conforto', 149.90, 'accessories', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500', 25, 4.6),
  ('Snacks Naturais 500g', 'Petiscos saudáveis', 19.90, 'treats', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500', 80, 4.9),
  ('Shampoo Hipoalergênico', 'Limpeza suave', 32.50, 'grooming', 'https://images.unsplash.com/photo-1629198726080-60ad5bf868a8?w=500', 60, 4.5)
ON CONFLICT (name) DO NOTHING;

-- 7. DAR saldo inicial ao usuário logado
UPDATE profiles 
SET wallet_balance = 100.00 
WHERE id = auth.uid();

-- 8. INSERIR transações de exemplo
DELETE FROM wallet_transactions WHERE user_id = auth.uid();

INSERT INTO wallet_transactions (user_id, type, amount, status, description)
VALUES
  (auth.uid(), 'deposit', 100.00, 'completed', 'Depósito inicial de boas-vindas'),
  (auth.uid(), 'cashback', 5.00, 'completed', 'Bônus de primeira compra');

-- 9. VERIFICAÇÃO
SELECT 
  'Setup completo! ✅' as status,
  (SELECT COUNT(*) FROM products) as total_produtos,
  (SELECT COUNT(*) FROM wallet_transactions WHERE user_id = auth.uid()) as suas_transacoes,
  (SELECT wallet_balance FROM profiles WHERE id = auth.uid()) as seu_saldo;
