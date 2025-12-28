# Supabase Edge Functions Setup Guide

Este guia explica como criar as Edge Functions necessárias para o sistema de Wallet.

## Pré-requisitos

1. **Supabase CLI instalado**:
   ```bash
   npm install -g supabase
   ```

2. **Chaves Stripe** (Test Mode):
   - Acesse [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys)
   - Copie `Secret Key` (começa com `sk_test_`)

---

## Edge Function 1: `create-payment-intent`

**Função**: Cria um Stripe PaymentIntent para depósitos.

### Criar função:
```bash
supabase functions new create-payment-intent
```

### Código (`supabase/functions/create-payment-intent/index.ts`):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  const { amount, method } = await req.json()

  // Validate
  if (!amount || amount < 5 || amount > 500) {
    return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 })
  }

  try {
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      payment_method_types: method === 'mbway' ? ['card'] : ['card'], // MB Way via card for now
      metadata: {
        user_id: req.headers.get('authorization')?.split('Bearer ')[1] || '',
        type: 'deposit'
      }
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

### Deploy:
```bash
supabase functions deploy create-payment-intent --no-verify-jwt
```

---

## Edge Function 2: `stripe-webhook`

**Função**: Recebe eventos do Stripe (payment.succeeded, etc.) e atualiza o banco.

### Criar função:
```bash
supabase functions new stripe-webhook
```

### Código (`supabase/functions/stripe-webhook/index.ts`):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Handle event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const userId = paymentIntent.metadata.user_id
    const amount = paymentIntent.amount / 100 // Convert from cents

    // Create transaction record
    await supabaseAdmin.from('wallet_transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount: amount,
      status: 'completed',
      stripe_payment_id: paymentIntent.id,
      description: 'Depósito via Stripe'
    })

    // Update wallet balance
    await supabaseAdmin.rpc('update_wallet_balance', {
      p_user_id: userId,
      p_amount: amount,
      p_operation: 'add'
    })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```

### Deploy:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## Edge Function 3: `create-payout`

**Função**: Cria um saque (payout) para conta bancária.

### Criar função:
```bash
supabase functions new create-payout
```

### Código (`supabase/functions/create-payout/index.ts`):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { amount, iban } = await req.json()
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  // Get user from token
  const { data: { user } } = await supabaseClient.auth.getUser(token)
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Validate
  if (!amount || amount < 10) {
    return new Response(JSON.stringify({ error: 'Minimum withdrawal is €10' }), { status: 400 })
  }

  // Check balance
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.wallet_balance < amount) {
    return new Response(JSON.stringify({ error: 'Insufficient balance' }), { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Create transaction
  await supabaseAdmin.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'withdrawal',
    amount: amount,
    status: 'pending',
    description: `Saque para ${iban.slice(-4)}`
  })

  // Deduct from balance
  await supabaseAdmin.rpc('update_wallet_balance', {
    p_user_id: user.id,
    p_amount: amount,
    p_operation: 'subtract'
  })

  // TODO: Integrate real Stripe Payout API here

  return new Response(
    JSON.stringify({ success: true, message: 'Withdrawal processed' }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### Deploy:
```bash
supabase functions deploy create-payout
```

---

## Configuração de Variáveis de Ambiente

No **Supabase Dashboard** → **Edge Functions** → **Settings**, adicione:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Configurar Webhook do Stripe

1. Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **Add endpoint**
3. URL: `https://SEU_PROJETO.supabase.co/functions/v1/stripe-webhook`
4. Eventos: `payment_intent.succeeded`
5. Copie o **Signing secret** e adicione como `STRIPE_WEBHOOK_SECRET`

---

## Testar

### Depósito:
```typescript
const { data } = await supabase.functions.invoke('create-payment-intent', {
  body: { amount: 50, method: 'card' }
});
// Use data.clientSecret com Stripe Elements
```

### Saque:
```typescript
const { data } = await supabase.functions.invoke('create-payout', {
  body: { amount: 20, iban: 'PT50000000000000000000000' }
});
```

---

## Próximos Passos

- Integrar Stripe Elements no frontend para capturar pagamentos
- Adicionar MB Way nativo (requer aprovação Stripe)
- Implementar refunds (reembolsos)
- Adicionar limits diários/mensais
