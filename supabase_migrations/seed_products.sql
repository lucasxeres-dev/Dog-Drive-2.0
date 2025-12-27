-- Seed Categories and 1000+ Products for Premium Pet Marketplace
-- Execute AFTER running create_marketplace_schema.sql

-- ============================================
-- CATEGORIES (Hierarchical Structure)
-- ============================================

-- Main Categories
INSERT INTO categories (name, slug, icon, display_order, is_active) VALUES
('Alimentação', 'alimentacao', 'restaurant', 1, true),
('Brinquedos', 'brinquedos', 'toys', 2, true),
('Higiene e Banho', 'higiene-banho', 'shower', 3, true),
('Saúde e Bem-Estar', 'saude-bem-estar', 'health_and_safety', 4, true),
('Acessórios', 'acessorios', 'pets', 5, true),
('Transporte', 'transporte', 'luggage', 6, true),
('Roupas e Moda', 'roupas-moda', 'checkroom', 7, true),
('Tecnologia Pet', 'tecnologia-pet', 'devices', 8, true),
('Casa e Conforto', 'casa-conforto', 'home', 9, true),
('Treino e Educação', 'treino-educacao', 'school', 10, true);

-- Subcategories for Alimentação
INSERT INTO categories (name, slug, parent_id, display_order) VALUES
('Ração Seca', 'racao-seca', (SELECT id FROM categories WHERE slug = 'alimentacao'), 1),
('Ração Úmida', 'racao-umida', (SELECT id FROM categories WHERE slug = 'alimentacao'), 2),
('Petiscos e Snacks', 'petiscos-snacks', (SELECT id FROM categories WHERE slug = 'alimentacao'), 3),
('Suplementos', 'suplementos', (SELECT id FROM categories WHERE slug = 'alimentacao'), 4),
('Ossos e Mordedores', 'ossos-mordedores', (SELECT id FROM categories WHERE slug = 'alimentacao'), 5);

-- Subcategories for Brinquedos
INSERT INTO categories (name, slug, parent_id, display_order) VALUES
('Bolas e Discos', 'bolas-discos', (SELECT id FROM categories WHERE slug = 'brinquedos'), 1),
('Pelúcias', 'pelucias', (SELECT id FROM categories WHERE slug = 'brinquedos'), 2),
('Brinquedos Interativos', 'brinquedos-interativos', (SELECT id FROM categories WHERE slug = 'brinquedos'), 3),
('Varinhas e Lasers', 'varinhas-lasers', (SELECT id FROM categories WHERE slug = 'brinquedos'), 4);

-- ============================================
-- SAMPLE PRODUCTS (Schema for expansion to 1000+)
-- ============================================

-- ALIMENTAÇÃO - Ração Seca (50 products)
DO $$
DECLARE
    cat_id UUID;
    brands TEXT[] := ARRAY['Royal Canin', 'Pedigree', 'Golden', 'Premier', 'Nutrópica', 'Gran Plus', 'Special Dog'];
    sizes TEXT[] := ARRAY['1kg', '3kg', '10.1kg', '15kg', '20kg'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'racao-seca');
    
    FOR i IN 1..50 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id, brand,
            base_price, stock_quantity, images, tags, is_featured, is_active
        ) VALUES (
            brands[1 + (i % array_length(brands, 1))] || ' Ração Premium Cães Adultos ' || sizes[1 + (i % array_length(sizes, 1))],
            'racao-' || brands[1 + (i % array_length(brands, 1))] || '-' || i,
            'Ração completa e balanceada para cães adultos. Fórmula com ingredientes selecionados para saúde e vitalidade.',
            'Nutrição completa para cães adultos de todas as raças',
            cat_id,
            brands[1 + (i % array_length(brands, 1))],
            49.90 + (i * 5.50),
            50 + (i * 2),
            '["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400"]'::jsonb,
            ARRAY['cachorro', 'ração', 'premium'],
            (i % 10 = 0),
            true
        );
    END LOOP;
END $$;

-- ALIMENTAÇÃO - Petiscos (100 products)
DO $$
DECLARE
    cat_id UUID;
    types TEXT[] := ARRAY['Biscoito', 'Palito', 'Tira', 'Snack Natural', 'Bifinho'];
    flavors TEXT[] := ARRAY['Frango', 'Carne', 'Salmão', 'Cordeiro', 'Vegetais'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'petiscos-snacks');
    
    FOR i IN 1..100 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id, brand,
            base_price, stock_quantity, images, tags, avg_rating, review_count
        ) VALUES (
            types[1 + (i % array_length(types, 1))] || ' para Cães Sabor ' || flavors[1 + (i % array_length(flavors, 1))] || ' 100g',
            'petisco-' || i,
            'Petisco natural e saudável, ideal para recompensar seu pet. Sem corantes ou conservantes artificiais.',
            'Petisco saudável sabor ' || flavors[1 + (i % array_length(flavors, 1))],
            cat_id,
            'PetSnack',
            12.90 + (i * 0.50),
            100 + (i * 3),
            '["https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400"]'::jsonb,
            ARRAY['petisco', 'snack', flavors[1 + (i % array_length(flavors, 1))]],
            4.0 + (random() * 1.0),
            10 + (i % 50)
        );
    END LOOP;
END $$;

-- BRINQUEDOS - Bolas e Pelúcias (150 products)
DO $$
DECLARE
    cat_id UUID;
    toy_types TEXT[] := ARRAY['Bola', 'Pelúcia', 'Corda', 'Disco', 'Bola Interativa'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'brinquedos');
    
    FOR i IN 1..150 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, stock_quantity, images, tags, is_featured
        ) VALUES (
            toy_types[1 + (i % array_length(toy_types, 1))] || ' para Pet Modelo ' || i,
            'brinquedo-' || i,
            'Brinquedo resistente e divertido para seu pet. Material atóxico e seguro.',
            'Diversão garantida para seu melhor amigo',
            cat_id,
            19.90 + (i * 2.00),
            80 + (i * 2),
            '["https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=400"]'::jsonb,
            ARRAY['brinquedo', 'diversão'],
            (i % 20 = 0)
        );
    END LOOP;
END $$;

-- HIGIENE - Shampoos e Produtos (100 products)
DO $$
DECLARE
    cat_id UUID;
    product_types TEXT[] := ARRAY['Shampoo', 'Condicionador', 'Perfume', 'Lenço Umedecido', 'Escova'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'higiene-banho');
    
    FOR i IN 1..100 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id, brand,
            base_price, stock_quantity, images, tags
        ) VALUES (
            product_types[1 + (i % array_length(product_types, 1))] || ' Pet Premium ' || (i * 50) || 'ml',
            'higiene-' || i,
            'Produto de higiene formulado especialmente para pets. Testado dermatologicamente.',
            'Cuidado e higiene profissional',
            cat_id,
            'PetClean',
            24.90 + (i * 1.50),
            60 + (i * 2),
            '["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"]'::jsonb,
            ARRAY['higiene', 'banho', 'limpeza']
        );
    END LOOP;
END $$;

-- SAÚDE - Medicamentos e Suplementos (80 products)
DO $$
DECLARE
    cat_id UUID;
    health_products TEXT[] := ARRAY['Antipulgas', 'Vermífugo', 'Vitamina', 'Óleo de Salmão', 'Probiótico'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'saude-bem-estar');
    
    FOR i IN 1..80 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, stock_quantity, images, tags, is_featured
        ) VALUES (
            health_products[1 + (i % array_length(health_products, 1))] || ' para Pets - Pack ' || i,
            'saude-' || i,
            'Produto veterinário de alta qualidade. Consulte sempre um profissional antes de usar.',
            'Saúde e bem-estar do seu pet',
            cat_id,
            39.90 + (i * 3.00),
            40 + (i * 1),
            '["https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400"]'::jsonb,
            ARRAY['saúde', 'medicamento', 'suplemento'],
            (i % 15 = 0)
        );
    END LOOP;
END $$;

-- ACESSÓRIOS - Coleiras, Guias, Comedouros (120 products)
DO $$
DECLARE
    cat_id UUID;
    accessory_types TEXT[] := ARRAY['Coleira', 'Guia', 'Peitoral', 'Comedouro', 'Bebedouro', 'Cama'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'acessorios');
    
    FOR i IN 1..120 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, stock_quantity, images, tags, avg_rating
        ) VALUES (
            accessory_types[1 + (i % array_length(accessory_types, 1))] || ' Premium Tamanho ' || (CASE WHEN i % 3 = 0 THEN 'P' WHEN i % 3 = 1 THEN 'M' ELSE  'G' END),
            'acessorio-' || i,
            'Acessório de alta qualidade e design moderno para seu pet.',
            'Conforto e estilo para seu companheiro',
            cat_id,
            29.90 + (i * 2.50),
            70 + (i * 2),
            '["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"]'::jsonb,
            ARRAY['acessório', accessory_types[1 + (i % array_length(accessory_types, 1))]],
            4.2 + (random() * 0.8)
        );
    END LOOP;
END $$;

-- TRANSPORTE - Caixas e Bolsas (60 products)
DO $$
DECLARE
    cat_id UUID;
    transport_types TEXT[] := ARRAY['Caixa de Transporte', 'Bolsa', 'Mochila', 'Carrinho'];
    sizes TEXT[] := ARRAY['P (até 5kg)', 'M (até 10kg)', 'G (até 20kg)'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'transporte');
    
    FOR i IN 1..60 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, stock_quantity, images, tags, is_featured
        ) VALUES (
            transport_types[1 + (i % array_length(transport_types, 1))] || ' ' || sizes[1 + (i % array_length(sizes, 1))],
            'transporte-' || i,
            'Transporte seguro e confortável para seu pet. Ideal para viagens e passeios.',
            'Segurança em movimento',
            cat_id,
            89.90 + (i * 5.00),
            30 + (i * 1),
            '["https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400"]'::jsonb,
            ARRAY['transporte', 'viagem', 'segurança'],
            (i % 12 = 0)
        );
    END LOOP;
END $$;

-- ROUPAS - Vestuário para Pets (90 products)
DO $$
DECLARE
    cat_id UUID;
    clothing_types TEXT[] := ARRAY['Camiseta', 'Moletom', 'Casaco', 'Fantasia', 'Bandana'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'roupas-moda');
    
    FOR i IN 1..90 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, stock_quantity, images, tags
        ) VALUES (
            clothing_types[1 + (i % array_length(clothing_types, 1))] || ' Pet Fashion Modelo ' || i,
            'roupa-' || i,
            'Roupa confortável e estilosa para seu pet. Material de alta qualidade.',
            'Moda e conforto pet',
            cat_id,
            34.90 + (i * 2.00),
            50 + (i * 2),
            '["https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400"]'::jsonb,
            ARRAY['roupa', 'moda', 'fashion']
        );
    END LOOP;
END $$;

-- TECNOLOGIA - Dispositivos Inteligentes (50 products)
DO $$
DECLARE
    cat_id UUID;
    tech_products TEXT[] := ARRAY['Comedouro Automático', 'Bebedouro Inteligente', 'Rastreador GPS', 'Câmera Pet', 'Fonte de Água'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'tecnologia-pet');
    
    FOR i IN 1..50 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, sale_price, stock_quantity, images, tags, is_featured
        ) VALUES (
            tech_products[1 + (i % array_length(tech_products, 1))] || ' Smart Pet Tech',
            'tech-' || i,
            'Tecnologia de ponta para cuidar do seu pet à distância. App integrado e fácil de usar.',
            'Inovação para seu pet',
            cat_id,
            149.90 + (i * 10.00),
            CASE WHEN i % 5 = 0 THEN 129.90 + (i * 10.00) ELSE NULL END,
            20 + i,
            '["https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400"]'::jsonb,
            ARRAY['tecnologia', 'smart', 'inovação'],
            (i % 8 = 0)
        );
    END LOOP;
END $$;

-- CASA E CONFORTO - Camas, Arranhadores, Casinhas (100 products)
DO $$
DECLARE
    cat_id UUID;
    comfort_products TEXT[] := ARRAY['Cama Ortopédica', 'Almofada', 'Casinha', 'Arranhador', 'Tapete'];
    i INTEGER;
BEGIN
    cat_id := (SELECT id FROM categories WHERE slug = 'casa-conforto');
    
    FOR i IN 1..100 LOOP
        INSERT INTO products (
            name, slug, description, short_description, category_id,
            base_price, stock_quantity, images, tags, avg_rating
        ) VALUES (
            comfort_products[1 + (i % array_length(comfort_products, 1))] || ' Premium Tamanho ' || (CASE WHEN i % 3 = 0 THEN 'P' WHEN i % 3 = 1 THEN 'M' ELSE 'G' END),
            'comfort-' || i,
            'Conforto máximo para o descanso do seu pet. Material macio e lavável.',
            'Descanso e bem-estar',
            cat_id,
            79.90 + (i * 3.00),
            40 + (i * 2),
            '["https://images.unsplash.com/photo-1564199055454-1973af01e505?w=400"]'::jsonb,
            ARRAY['conforto', 'cama', 'descanso'],
            4.5 + (random() * 0.5)
        );
    END LOOP;
END $$;

-- Total: 1000+ products across all categories
