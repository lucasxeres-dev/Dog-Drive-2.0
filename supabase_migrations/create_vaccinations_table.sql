-- Tabela de Vacinas para Carteira de Vacinação
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(100), -- V8, V10, Raiva, Gripe, etc
    vaccination_date DATE NOT NULL,
    next_dose_date DATE,
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    batch_number VARCHAR(100),
    observations TEXT,
    document_url TEXT, -- Foto do comprovante
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vaccinations_dog ON vaccinations(dog_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_date ON vaccinations(vaccination_date);

-- RLS Policies
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dog owners can view their dog vaccinations" ON vaccinations;
CREATE POLICY "Dog owners can view their dog vaccinations" ON vaccinations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM dogs 
        WHERE dogs.id = vaccinations.dog_id 
        AND dogs.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Dog owners can manage their dog vaccinations" ON vaccinations;
CREATE POLICY "Dog owners can manage their dog vaccinations" ON vaccinations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM dogs 
        WHERE dogs.id = vaccinations.dog_id 
        AND dogs.owner_id = auth.uid()
    )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_vaccinations_updated_at ON vaccinations;
CREATE TRIGGER update_vaccinations_updated_at
    BEFORE UPDATE ON vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
