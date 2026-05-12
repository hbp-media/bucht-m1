// Creates a pending booking and a Paddle transaction with custom dynamic price.
// Returns the Paddle transaction ID so the frontend can open the checkout overlay.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const BodySchema = z.object({
  environment: z.enum(['sandbox', 'live']).default('sandbox'),
  booking: z.object({
    spot_id: z.string().uuid(),
    booking_mode: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    nights: z.number().int().nonnegative(),
    extra_24h_blocks: z.number().int().nonnegative(),
    persons: z.number().int().positive(),
    companions: z.number().int().nonnegative(),
    accommodation_type: z.string(),
    accommodation_persons: z.number().int().nonnegative(),
    all_inclusive: z.boolean(),
    license_price: z.number().nonnegative(),
    accommodation_price: z.number().nonnegative(),
    cleaning_price: z.number().nonnegative(),
    all_inclusive_price: z.number().nonnegative(),
    base_price: z.number().nonnegative(),
    extras: z.array(z.any()),
    extras_price: z.number().nonnegative(),
    total_price: z.number().positive(),
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email().max(200),
    phone: z.string().min(3).max(40),
    message: z.string().max(1000).optional().default(''),
  }),
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
    const { environment, booking } = parsed.data;
    const env = environment as PaddleEnv;

    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Insert booking as pending/unpaid
    const { data: inserted, error: insertErr } = await admin
      .from('bookings')
      .insert({ ...booking, user_id: userId, status: 'pending', payment_status: 'unpaid' })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      return new Response(JSON.stringify({ error: insertErr?.message ?? 'Booking insert failed' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Create Paddle transaction with custom price (non-catalog item)
    const totalCents = Math.round(booking.total_price * 100);
    const description = `Bucht M1 · ${booking.nights} Nächte · ${booking.start_date} → ${booking.end_date}`;

    const txnRes = await gatewayFetch(env, '/transactions', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            quantity: 1,
            price: {
              description,
              name: 'Angelplatz-Buchung',
              tax_mode: 'account_setting',
              unit_price: { amount: String(totalCents), currency_code: 'EUR' },
              quantity: { minimum: 1, maximum: 1 },
            },
          },
        ],
        customer: { email: booking.email },
        custom_data: { bookingId: inserted.id, userId },
        collection_mode: 'automatic',
      }),
    });

    const txnData = await txnRes.json();
    if (!txnRes.ok) {
      console.error('Paddle transaction creation failed', txnData);
      // Roll back booking
      await admin.from('bookings').delete().eq('id', inserted.id);
      return new Response(JSON.stringify({ error: 'Zahlungsanbieter-Fehler', details: txnData }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Persist Paddle transaction id on booking
    await admin
      .from('bookings')
      .update({ paddle_transaction_id: txnData.data.id })
      .eq('id', inserted.id);

    return new Response(
      JSON.stringify({ transactionId: txnData.data.id, bookingId: inserted.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('create-booking-checkout error', e);
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
