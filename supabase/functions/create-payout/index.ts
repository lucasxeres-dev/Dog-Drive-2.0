import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, iban } = await req.json()
        const authHeader = req.headers.get('Authorization')!

        // Create client to verify identity
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Get user from token
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: corsHeaders })
        }

        // Validate
        if (!amount || amount < 10) {
            return new Response(JSON.stringify({ error: 'Saque mínimo é €10' }), { status: 400, headers: corsHeaders })
        }

        if (!iban || iban.length < 15) {
            return new Response(JSON.stringify({ error: 'IBAN inválido' }), { status: 400, headers: corsHeaders })
        }

        // Check balance
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single()

        if (profileError || !profile || profile.wallet_balance < amount) {
            return new Response(JSON.stringify({ error: 'Saldo insuficiente' }), { status: 400, headers: corsHeaders })
        }

        // Use admin client for DB updates
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Create transaction record (pending)
        const { error: txError } = await supabaseAdmin.from('wallet_transactions').insert({
            user_id: user.id,
            type: 'withdrawal',
            amount: amount,
            status: 'pending',
            description: `Saque solicitado para IBAN: ...${iban.slice(-4)}`
        })

        if (txError) throw txError

        // 2. Deduct from balance via RPC
        const { error: rpcError } = await supabaseAdmin.rpc('update_wallet_balance', {
            p_user_id: user.id,
            p_amount: amount,
            p_operation: 'subtract'
        })

        if (rpcError) throw rpcError

        // TODO: Connect to real Stripe Payouts API if using Connect
        // For now, we record it as pending for manual/future processing

        return new Response(
            JSON.stringify({ success: true, message: 'Pedido de saque processado com sucesso' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }
})
