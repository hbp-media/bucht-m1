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

    // Deadline für Anzahlung aus Settings (Default 24h)
    const { data: settings } = await admin
      .from('payment_settings')
      .select('deposit_deadline_hours')
      .limit(1)
      .maybeSingle();
    const deadlineHours = settings?.deposit_deadline_hours ?? 24;
    const paymentDeadline = new Date(Date.now() + deadlineHours * 3600_000).toISOString();

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
        payment_status: 'deposit_pending',
        payment_deadline: paymentDeadline,
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      return new Response(JSON.stringify({ error: insertErr?.message ?? 'Buchung konnte nicht angelegt werden' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Anzahlungs-Mail mit IBAN + 24h-Frist an Kunde
    try {
      const url = `${supabaseUrl}/functions/v1/send-booking-email`;
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` };
      await fetch(url, { method: 'POST', headers, body: JSON.stringify({ type: 'deposit_request', booking_id: inserted.id }) });
    } catch (e) {
      console.error('email dispatch failed', e);
    }

    // In-App-Notification für alle Admins anlegen
    try {
      const { data: admins } = await admin
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      if (admins && admins.length > 0) {
        const rows = admins.map((a: { user_id: string }) => ({
          user_id: a.user_id,
          type: 'admin_new_booking',
          title: 'Neue Buchungsanfrage',
          message: `${booking.first_name} ${booking.last_name} – ${booking.start_date} bis ${booking.end_date}`,
          link: '/admin',
          booking_id: inserted.id,
        }));
        await admin.from('notifications').insert(rows);
      }
    } catch (e) {
      console.error('admin notification insert failed', e);
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
