# 🐕 Dog Drive 2.0

**A plataforma premium all-in-one para donos de cães em Portugal.**

Marketplace, serviços de passeio/hospedagem, GPS tracking em tempo real, carteira digital e muito mais.

---

## ✨ Features Principais

### 🛒 **E-commerce Completo**
- Marketplace com busca, filtros e categorias
- Carrinho inteligente persistente
- Checkout com múltiplos métodos de pagamento
- Sistema de reviews e avaliações

### 📅 **Gestão de Reservas**
- Agendar passeios, grooming e hospedagem
- "Minhas Atividades" com histórico completo
- Tabs separadas: Agendados / Histórico
- Cancelamento e chat com prestador

### ⭐ **Sistema de Avaliações**
- Avaliação de serviços (1-5 estrelas + comentários)
- Indicador visual de serviços já avaliados
- Modal premium com animações

### 🗺️ **GPS Tracking em Tempo Real**
- Mapa interativo com Leaflet + OpenStreetMap
- Rastreamento ao vivo durante passeios
- Visualização de rota percorrida (polyline)
- Supabase Realtime para updates instantâneos

### 💰 **Carteira Digital**
- Depósitos via Stripe (Cartão/MB Way)
- Saques para conta bancária (IBAN)
- Histórico de transações filtrado
- Sistema de cashback automático

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Conta Supabase
- (Opcional) Conta Stripe para pagamentos

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie `.env.local`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Executar SQL Migrations
No Supabase SQL Editor, execute NA ORDEM:
1. `supabase_gps_migration.sql`
2. `supabase_wallet_migration.sql`
3. `supabase_sample_data.sql`

### 4. Rodar localmente
```bash
npm run dev
# Abra http://localhost:3000
```

---

## 📦 Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Clean Green theme)
- **Backend**: Supabase (PostgreSQL + Realtime + Edge Functions)
- **Maps**: React Leaflet + OpenStreetMap
- **Payments**: Stripe
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 📁 Estrutura do Projeto

```
dog-drive/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── BookingCard.tsx
│   │   ├── DepositModal.tsx
│   │   ├── LiveTrackingMap.tsx
│   │   └── ...
│   ├── views/            # Páginas principais
│   │   ├── MarketplaceView.tsx
│   │   ├── MyBookingsView.tsx
│   │   ├── WalletView.tsx
│   │   └── ...
│   ├── contexts/         # React Context (Auth, Language, Notifications)
│   ├── hooks/            # Custom Hooks (useAuth, useSupabase)
│   ├── services/         # API Services
│   ├── types/            # TypeScript Types
│   └── index.css         # Global Styles + Theme
├── supabase_gps_migration.sql          # GPS tables & RLS
├── supabase_wallet_migration.sql       # Wallet tables & functions
├── supabase_sample_data.sql            # Demo data
├── GPS_TESTING_GUIDE.md                # Como testar GPS ao vivo
├── WALLET_EDGE_FUNCTIONS_GUIDE.md      # Deploy Stripe backend
└── DEPLOYMENT_GUIDE.md                 # Deploy completo (Vercel/Netlify)
```

---

## 🎨 Design System

**Tema**: Clean Green  
- **Primary**: `#22eb7e` (Green)
- **Dark**: `#102217` (Deep Green)
- **Fonts**: Outfit, Plus Jakarta Sans

**Componentes Premium**:
- `.btn-primary-premium` - Botão principal com hover/active states
- `.glass-card` - Cards com efeito glassmorphism
- rounded corners: `2rem`, `2.5rem`, `3rem`

---

## 🔐 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Políticas de acesso granulares
- ✅ Validação de input no frontend e backend
- ✅ Stripe para pagamentos seguros (PCI compliant)
- ✅ JWT authentication via Supabase Auth

---

## 📚 Guias de Setup

- **GPS Tracking**: `GPS_TESTING_GUIDE.md`
- **Wallet/Payments**: `WALLET_EDGE_FUNCTIONS_GUIDE.md`
- **Deploy**: `DEPLOYMENT_GUIDE.md`

---

## 🐛 Troubleshooting

### Erro: "relation X does not exist"
→ Execute os scripts SQL no Supabase

### Mapa não carrega
→ Verifique se `latitude` e `longitude` existem em `business_profiles`

### Pagamentos não funcionam
→ Edge Functions precisam ser deployadas (veja guia)

---

## 🚢 Deploy

### Vercel (Recomendado):
```bash
vercel
```

### Netlify:
```bash
npm run build
# Arraste pasta `dist` para netlify.com/drop
```

Veja `DEPLOYMENT_GUIDE.md` para instruções completas.

---

## 📝 License

MIT

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para revolucionar o cuidado com pets em Portugal 🇵🇹

---

## 🙏 Agradecimentos

- Supabase pela infraestrutura
- Leaflet/OpenStreetMap pelos mapas
- Stripe pela integração de pagamentos
- Lucide pela biblioteca de ícones
