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
        console.error(`Webhook signature verification failed: ${err.message}`)
        return new Response(JSON.stringify({ error: err.message }), { status: 400 })
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

        console.log(`Payment confirmed for user ${userId}: €${amount}`)

        // 1. Create transaction record
        const { error: txError } = await supabaseAdmin.from('wallet_transactions').insert({
            user_id: userId,
            type: 'deposit',
            amount: amount,
            status: 'completed',
            stripe_payment_id: paymentIntent.id,
            description: 'Depósito via Stripe (Webhook)'
        })

        if (txError) {
            console.error(`Error creating transaction: ${txError.message}`)
            return new Response(JSON.stringify({ error: txError.message }), { status: 500 })
        }

        // 2. Update wallet balance via RPC
        const { error: rpcError } = await supabaseAdmin.rpc('update_wallet_balance', {
            p_user_id: userId,
            p_amount: amount,
            p_operation: 'add'
        })

        if (rpcError) {
            console.error(`Error updating balance: ${rpcError.message}`)
            return new Response(JSON.stringify({ error: rpcError.message }), { status: 500 })
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
})
