-- =====================================================
-- Dog Drive 2.0 - Sample Data Population
-- =====================================================
-- This script populates the database with realistic demo data
-- Execute AFTER running gps_migration.sql and wallet_migration.sql

-- =====================================================
-- 1. Sample Service Providers (Walkers, Groomers, etc.)
-- =====================================================

-- Get your user ID first (replace in the business_profiles inserts)
-- SELECT id FROM auth.users LIMIT 1;

-- Sample Business Profiles
INSERT INTO business_profiles (id, user_id, business_name, service_type, description, latitude, longitude, is_online)
VALUES
  (uuid_generate_v4(), (SELECT id FROM auth.users LIMIT 1), 'PawWalkers Premium', 'walker', 'Passeios profissionais com GPS tracking', 38.7223, -9.1393, true),
  (uuid_generate_v4(), (SELECT id FROM auth.users LIMIT 1), 'Grooming Stars', 'grooming', 'Cuidados estéticos para seu melhor amigo', 38.7240, -9.1410, true),
  (uuid_generate_v4(), (SELECT id FROM auth.users LIMIT 1), 'Pet Paradise Hotel', 'boarding', 'Hospedagem 5 estrelas para cães', 38.7200, -9.1370, true),
  (uuid_generate_v4(), (SELECT id FROM auth.users LIMIT 1), 'MegaPet Store', 'petshop', 'Tudo para o seu pet em um só lugar', 38.7260, -9.1420, true);

-- =====================================================
-- 2. Sample Marketplace Products
-- =====================================================

INSERT INTO products (name, description, price, category, image_url, stock_quantity, rating)
VALUES
  ('Ração Premium High Pro 15kg', 'Nutrição completa para cães adultos de grande porte', 85.90, 'food', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500', 50, 4.8),
  ('Bola Interativa Kong', 'Brinquedo resistente para distração e exercício', 24.90, 'toys', 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=500', 100, 4.9),
  ('Coleira Premium com GPS', 'Rastreamento em tempo real do seu pet', 129.90, 'accessories', 'https://images.unsplash.com/photo-1605466218597-c8e98267f14d?w=500', 30, 4.7),
  ('Cama Ortopédica Confort', 'Máximo conforto para o descanso do seu cão', 149.90, 'accessories', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500', 25, 4.6),
  ('Snacks Naturais 500g', 'Petiscos saudáveis sem conservantes', 19.90, 'treats', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500', 80, 4.9),
  ('Shampoo Hipoalergênico', 'Limpeza suave para peles sensíveis', 32.50, 'grooming', 'https://images.unsplash.com/photo-1629198726080-60ad5bf868a8?w=500', 60, 4.5);

-- =====================================================
-- 3. Sample Product Reviews
-- =====================================================

INSERT INTO product_reviews (product_id, user_id, rating, comment)
VALUES
  ((SELECT id FROM products WHERE name LIKE '%Ração Premium%' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), 5, 'Meu cão adorou! Pelagem ficou mais brilhante.'),
  ((SELECT id FROM products WHERE name LIKE '%Bola Interativa%' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), 5, 'Muito resistente, vale cada cêntimo!'),
  ((SELECT id FROM products WHERE name LIKE '%Coleira Premium%' LIMIT 1), (SELECT id FROM auth.users LIMIT 1), 4, 'GPS funciona bem, mas bateria podia durar mais.');

-- =====================================================
-- 4. Sample Booking (for testing GPS tracking)
-- =====================================================

-- Create a test booking
INSERT INTO bookings (id, service_type, status, date, time, duration, price, provider_id, client_id, location)
VALUES
  ('11111111-2222-3333-4444-555555555555',
   'walk',
   'confirmed',
   'Hoje',
   '15:00',
   60,
   15.00,
   (SELECT id FROM profiles WHERE role = 'walker' LIMIT 1),
   (SELECT id FROM auth.users LIMIT 1),
   'Parque Eduardo VII, Lisboa');

-- =====================================================
-- 5. Give yourself some initial wallet balance
-- =====================================================

UPDATE profiles 
SET wallet_balance = 100.00 
WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- Sample wallet transactions
INSERT INTO wallet_transactions (user_id, type, amount, status, description)
VALUES
  ((SELECT id FROM auth.users LIMIT 1), 'deposit', 100.00, 'completed', 'Depósito inicial de boas-vindas'),
  ((SELECT id FROM auth.users LIMIT 1), 'cashback', 5.00, 'completed', 'Bônus de primeira compra');

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check products
SELECT COUNT(*) as total_products FROM products;

-- Check business profiles
SELECT business_name, service_type, is_online FROM business_profiles;

-- Check bookings
SELECT id, service_type, status, date FROM bookings;

-- Check wallet balance
SELECT full_name, wallet_balance FROM profiles WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- Check transactions
SELECT type, amount, status, description FROM wallet_transactions ORDER BY created_at DESC LIMIT 5;

SELECT 'Sample data loaded successfully! 🎉' as status;
