// Schritt 3: Erzeugt Paddle-Transaktion für eine vom Admin freigegebene Buchung.
// Prüft Owner, Status, Deadline. Berechnet Preis aus DB-Zustand neu.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';
import { recalculatePrice } from '../_shared/booking-pricing.ts';

const BodySchema = z.object({
  environment: z.enum(['sandbox', 'live']).default('sandbox'),
  bookingId: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { environment, bookingId } = parsed.data;
    const env = environment as PaddleEnv;

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: b, error: bErr } = await admin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (bErr || !b) {
      return new Response(JSON.stringify({ error: 'Buchung nicht gefunden' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (b.user_id !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (b.status !== 'approved' || b.payment_status !== 'unpaid') {
      return new Response(JSON.stringify({ error: 'Buchung ist nicht zur Zahlung freigegeben' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (b.payment_deadline && new Date(b.payment_deadline) < new Date()) {
      return new Response(JSON.stringify({ error: 'Zahlungsfrist abgelaufen' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preis nochmal aus DB rechnen (verhindert Manipulation gespeicherter Werte)
    const pricing = await recalculatePrice(admin, {
      spot_id: b.spot_id,
      booking_mode: b.booking_mode,
      nights: b.nights,
      extra_24h_blocks: b.extra_24h_blocks,
      persons: b.persons,
      companions: b.companions,
      accommodation_type: b.accommodation_type,
      accommodation_persons: b.accommodation_persons,
      all_inclusive: b.all_inclusive,
      extras: Array.isArray(b.extras) ? b.extras : [],
    });

    const totalCents = Math.round(pricing.total_price * 100);
    const description = `Bucht M1 · ${b.nights} Nächte · ${b.start_date} → ${b.end_date}`;

    const txnRes = await gatewayFetch(env, '/transactions', {
      method: 'POST',
      body: JSON.stringify({
        items: [{
          quantity: 1,
          price: {
            description,
            name: 'Angelplatz-Buchung',
            tax_mode: 'account_setting',
            unit_price: { amount: String(totalCents), currency_code: 'EUR' },
            quantity: { minimum: 1, maximum: 1 },
          },
        }],
        customer: { email: b.email },
        custom_data: { bookingId: b.id, userId },
        collection_mode: 'automatic',
      }),
    });

    const txnData = await txnRes.json();
    if (!txnRes.ok) {
      console.error('Paddle txn failed', txnData);
      return new Response(JSON.stringify({ error: 'Zahlungsanbieter-Fehler', details: txnData }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await admin.from('bookings')
      .update({
        paddle_transaction_id: txnData.data.id,
        total_price: pricing.total_price,
      })
      .eq('id', b.id);

    return new Response(
      JSON.stringify({ transactionId: txnData.data.id, total_price: pricing.total_price }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('create-payment-checkout error', e);
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
