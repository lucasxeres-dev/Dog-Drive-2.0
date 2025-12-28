# 🗺️ Guia de Teste: GPS Tracking em Tempo Real

Este guia mostra como testar o sistema de rastreamento GPS ao vivo do Dog Drive.

---

## 📋 Pré-requisitos

1. ✅ Execute o script `supabase_gps_migration.sql` no Supabase SQL Editor
2. ✅ O app deve estar rodando localmente (`npm run dev`)
3. ✅ Você deve estar autenticado no app

---

## 🎯 Passo 1: Criar um Booking de Teste

Primeiro, você precisa de um agendamento ativo. Abra o **Supabase SQL Editor** e execute:

```sql
-- Substitua com seus IDs reais (você consegue pegando da tabela profiles)
INSERT INTO bookings (
  id,
  service_type,
  status,
  date,
  time,
  duration,
  price,
  provider_id,
  client_id,
  location
) VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', -- ID fixo para teste
  'walk',
  'confirmed', -- IMPORTANTE: Precisa ser "confirmed" para ativar o mapa ao vivo
  'Hoje',
  '14:00',
  60,
  15.00,
  'SEU_PROVIDER_ID_AQUI', -- Substitua com um ID real da tabela profiles
  'SEU_CLIENT_ID_AQUI',   -- Seu ID de usuário (auth.uid())
  'Parque Eduardo VII, Lisboa'
);
```

> **Como pegar seus IDs:**
> ```sql
> -- Pegar seu client_id (usuário logado)
> SELECT id, email FROM auth.users LIMIT 1;
> 
> -- Pegar um provider_id qualquer
> SELECT id, full_name, role FROM profiles WHERE role IN ('walker', 'boarding') LIMIT 1;
> ```

---

## 🎯 Passo 2: Navegar para o Booking

1. No app, vá para **Definições → Minhas Atividades**
2. Clique no agendamento "Hoje às 14:00"
3. Você verá o mapa **ao vivo** (porque o status é "confirmed")

---

## 🎯 Passo 3: Simular Movimento GPS

Agora vamos simular o passeador se movendo. Abra uma **nova aba** no Supabase SQL Editor e execute este script:

```sql
-- Simula uma caminhada pelo Parque Eduardo VII
-- Execute LINHA POR LINHA com intervalos de 5-10 segundos para ver o movimento ao vivo

-- Ponto 1: Entrada do Parque
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7223, -9.1393, 5.0);

-- ⏰ Aguarde 5-10 segundos...

-- Ponto 2: Caminhando para o norte
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7228, -9.1395, 5.0);

-- ⏰ Aguarde 5-10 segundos...

-- Ponto 3: Continuando
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7233, -9.1398, 5.0);

-- ⏰ Aguarde 5-10 segundos...

-- Ponto 4: Virando à direita
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7235, -9.1385, 5.0);

-- ⏰ Aguarde 5-10 segundos...

-- Ponto 5: Voltando
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7230, -9.1390, 5.0);

-- ⏰ Aguarde 5-10 segundos...

-- Ponto 6: De volta ao início
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7223, -9.1393, 5.0);
```

---

## ✨ O que você deve ver:

1. **Marcador Verde** se movendo no mapa em tempo real
2. **Linha Verde** (polyline) desenhando o trajeto percorrido
3. **Badge "AO VIVO"** no canto superior direito do mapa
4. **Mapa se centralizando** automaticamente no marcador

---

## 🔧 Script Automático (Opcional)

Se quiser inserir todos os pontos de uma vez (sem ver o movimento gradual):

```sql
-- INSERE TUDO DE UMA VEZ
INSERT INTO location_updates (booking_id, provider_id, latitude, longitude, accuracy, timestamp)
VALUES 
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7223, -9.1393, 5.0, NOW() - INTERVAL '5 minutes'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7228, -9.1395, 5.0, NOW() - INTERVAL '4 minutes'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7233, -9.1398, 5.0, NOW() - INTERVAL '3 minutes'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7235, -9.1385, 5.0, NOW() - INTERVAL '2 minutes'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7230, -9.1390, 5.0, NOW() - INTERVAL '1 minute'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SEU_PROVIDER_ID_AQUI', 38.7223, -9.1393, 5.0, NOW());

-- Depois, recarregue a página para ver o trajeto completo
```

---

## 🧹 Limpar Dados de Teste

Quando terminar:

```sql
-- Deletar o booking de teste
DELETE FROM bookings WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- Os location_updates serão deletados automaticamente (CASCADE)
```

---

## 🐛 Troubleshooting

### O mapa não aparece?
- ✅ Verifique se o status do booking é **"confirmed"**
- ✅ Abra o Console do Navegador (F12) e veja se há erros

### O marcador não se move?
- ✅ Confirme que o `booking_id` nos inserts é exatamente o mesmo
- ✅ Verifique se a conexão Realtime está ativa no Supabase (Settings → Realtime)

### Erro de permissão?
- ✅ Revise as RLS policies criadas no script de migração
- ✅ Confirme que você está logado no app

---

## 🎉 Sucesso!

Se tudo funcionou, você tem um sistema de GPS tracking **totalmente funcional** e em tempo real! 🗺️✨

**Próximos passos:**
- Integrar com um app móvel real para capturar GPS de verdade
- Adicionar notificações quando o passeio começar/terminar
- Implementar geofencing (alertar se sair de uma área)
