// Schritt 1 im neuen Flow: Erstellt eine Buchungs-ANFRAGE.
// KEINE Zahlung. Server berechnet Preis aus DB (Manipulationsschutz).
// Sendet: admin_new an alle Admins, request_received an Kunde.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { recalculatePrice } from '../_shared/booking-pricing.ts';

const BodySchema = z.object({
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
    extras: z.array(
      z.object({ id: z.string().uuid(), quantity: z.number().int().positive().optional() }).passthrough(),
    ),
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
    const { booking } = parsed.data;
    const admin = createClient(supabaseUrl, serviceKey);

    // Server-seitige Preisberechnung
    const pricing = await recalculatePrice(admin, booking);

    const { data: inserted, error: insertErr } = await admin
      .from('bookings')
      .insert({
        spot_id: booking.spot_id,
        user_id: userId,
        booking_mode: booking.booking_mode,
        start_date: booking.start_date,
        end_date: booking.end_date,
        nights: booking.nights,
        extra_24h_blocks: booking.extra_24h_blocks,
        persons: booking.persons,
        companions: booking.companions,
        accommodation_type: booking.accommodation_type,
        accommodation_persons: booking.accommodation_persons,
        all_inclusive: booking.all_inclusive,
        first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email,
        phone: booking.phone,
        message: booking.message,
        license_price: pricing.license_price,
        accommodation_price: pricing.accommodation_price,
        cleaning_price: pricing.cleaning_price,
        all_inclusive_price: pricing.all_inclusive_price,
        base_price: pricing.license_price,
        extras: pricing.extras_resolved,
        extras_price: pricing.extras_price,
        total_price: pricing.total_price,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      return new Response(JSON.stringify({ error: insertErr?.message ?? 'Buchung konnte nicht angelegt werden' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // E-Mails feuern (best effort, blockiert Anfrage nicht)
    try {
      const url = `${supabaseUrl}/functions/v1/send-booking-email`;
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` };
      await Promise.all([
        fetch(url, { method: 'POST', headers, body: JSON.stringify({ type: 'admin_new', booking_id: inserted.id }) }),
        fetch(url, { method: 'POST', headers, body: JSON.stringify({ type: 'request_received', booking_id: inserted.id }) }),
      ]);
    } catch (e) {
      console.error('email dispatch failed', e);
    }

    return new Response(
      JSON.stringify({ bookingId: inserted.id, total_price: pricing.total_price }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('create-booking-checkout error', e);
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
