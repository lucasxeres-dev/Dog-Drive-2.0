-- Store registration
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  rating FLOAT DEFAULT 5.0,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT CHECK (category IN ('food', 'toys', 'other')),
  image_url TEXT,
  is_promo BOOLEAN DEFAULT false,
  promo_discount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Cart
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Favorites
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  PRIMARY KEY (user_id, product_id)
);

-- Wallet & Financials
CREATE TABLE IF NOT EXISTS wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  balance DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  encrypted_data TEXT NOT NULL, 
  bank_name TEXT,
  account_type TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dogs / Feed
CREATE TABLE IF NOT EXISTS dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  breed TEXT,
  age TEXT,
  image_url TEXT,
  description TEXT,
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  match_percentage INTEGER DEFAULT 0, -- Simulated match % for now
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chats
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES auth.users(id),
  user_id_2 UUID REFERENCES auth.users(id),
  last_message TEXT,
  last_message_time TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES auth.users(id), -- The walker or sitter
  service_type TEXT NOT NULL, -- 'walk', 'sitting', etc.
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now()
);
