# 🚀 Dog Drive - Guia Completo de Deploy

Este guia cobre **tudo** que você precisa fazer para ter o Dog Drive funcionando em produção.

---

## ✅ **Checklist Geral**

- [ ] 1. Executar SQL Migrations no Supabase
- [ ] 2. Popular banco com dados de exemplo
- [ ] 3. Configurar variáveis de ambiente
- [ ] 4. Build e Deploy do Frontend
- [ ] 5. (Opcional) Deploy de Edge Functions
- [ ] 6. Testar app em produção

---

## 📋 **Passo 1: Executar SQL Migrations (15 min)**

### 1.1 Acesse o Supabase Dashboard
1. Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### 1.2 Execute os scripts NA ORDEM:
```sql
-- 1º Execute: GPS Tracking
-- Cole o conteúdo de supabase_gps_migration.sql
-- Clique em "Run"

-- 2º Execute: Wallet System
-- Cole o conteúdo de supabase_wallet_migration.sql
-- Clique em "Run"

-- 3º Execute: Dados de Exemplo
-- Cole o conteúdo de supabase_sample_data.sql
-- Clique em "Run"
```

### 1.3 Verificar
No SQL Editor, execute:
```sql
-- Deve retornar as tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('location_updates', 'wallet_transactions', 'products', 'business_profiles');
```

---

## 🔑 **Passo 2: Configurar Variáveis de Ambiente**

### 2.1 Obter credenciais do Supabase
1. No Supabase Dashboard → **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon/public key** (começa com `eyJ...`)

### 2.2 Criar arquivo `.env.production`
Na raiz do projeto:
```bash
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua_chave_aqui...
```

---

## 🌐 **Passo 3: Deploy no Vercel (Recomendado)**

### 3.1 Instalar Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Login
```bash
vercel login
# Escolha seu método de autenticação (GitHub, GitLab, etc.)
```

### 3.3 Deploy
```bash
# No diretório do projeto
vercel

# Siga o wizard:
# - Set up and deploy? [Y]
# - Which scope? [seu usuario]
# - Link to existing project? [N]
# - Project name? [dog-drive]
# - In which directory? [./]
# - Override settings? [N]
```

### 3.4 Configurar Variáveis de Ambiente na Vercel
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **dog-drive**
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - `VITE_SUPABASE_URL` = `https://SEU_PROJETO.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`

### 3.5 Redeploy
```bash
vercel --prod
```

🎉 **Seu app estará no ar em `dog-drive.vercel.app`**

---

## 🔧 **Alternat: Deploy no Netlify**

### Via Interface Web (Mais Fácil):
1. Crie build local:
   ```bash
   npm run build
   ```
2. Acesse [netlify.com/drop](https://app.netlify.com/drop)
3. Arraste a pasta `dist` para lá
4. Configure variáveis:
   - Site Settings → Environment Variables
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
5. Re-deploy: **Deploys** → **Trigger Deploy** → **Clear cache and deploy site**

---

## 💳 **Passo 4 (Opcional): Deploy de Edge Functions para Stripe**

> ⚠️ **Apenas necessário se quiser pagamentos REAIS**

### 4.1 Instalar Supabase CLI
```bash
npm install -g supabase
```

### 4.2 Login
```bash
supabase login
```

### 4.3 Link ao projeto
```bash
supabase link --project-ref SEU_PROJECT_REF
# Encontre o project_ref no Supabase Dashboard URL
```

### 4.4 Criar Edge Functions
Siga o guia detalhado em `WALLET_EDGE_FUNCTIONS_GUIDE.md`

### 4.5 Configurar Stripe
1. Crie conta em [stripe.com](https://stripe.com)
2. Obtenha chaves de teste
3. Configure webhook apontando para Edge Function

---

## 🧪 **Passo 5: Testar App em Produção**

### Checklist de Testes:
- [ ] Login/Registro funciona?
- [ ] Marketplace carrega produtos?
- [ ] Carrinho persiste?
- [ ] Mapa mostra localizações?
- [ ] Wallet exibe saldo?
- [ ] Minhas Atividades mostra bookings?

### Reportar Bugs:
- Abra **Console do Navegador** (F12)
- Anote erros em vermelho
- Verifique se variáveis de ambiente estão corretas

---

## 📊 **Passo 6: Monitoramento (Opcional)**

### Adicionar Analytics:
```bash
npm install @vercel/analytics
```

Em `src/main.tsx`:
```typescript
import { inject } from '@vercel/analytics';
inject();
```

---

## 🎉 **Pronto!**

Seu Dog Drive está ONLINE! 🐕

**Próximos passos:**
- Compartilhe o link com amigos/clientes
- Colete feedback
- Itere e melhore

**Precisa de ajuda?**
- Logs da Vercel: `vercel logs`
- Logs do Supabase: Dashboard → Logs
- Consulte `README.md` para mais detalhes
