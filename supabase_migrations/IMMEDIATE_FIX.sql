-- SOLUÇÃO IMEDIATA: Execute ISTO AGORA no Supabase
-- Supabase Dashboard → SQL Editor → Copie TUDO → Cole → RUN

-- Adiciona colunas que faltam em profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS provider_services TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_shop BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'PT';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- FORÇAR REFRESH DO SCHEMA CACHE (CRÍTICO!)
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

-- Verificar se funcionou
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'address';
-- Deve retornar 1 linha com "address"
