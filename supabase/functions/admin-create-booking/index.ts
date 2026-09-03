// Admin legt eine Buchung manuell an (Telefon/vor Ort).
// Preis wird serverseitig berechnet, kann aber vom Admin überschrieben werden.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { recalculatePrice } from '../_shared/booking-pricing.ts';

const BodySchema = z.object({
  spot_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  persons: z.number().int().positive().max(10),
  companions: z.number().int().nonnegative().max(10).default(0),
  companions_kids: z.number().int().nonnegative().max(10).default(0),
  accommodation_type: z.string().default('none'),
  accommodation_persons: z.number().int().nonnegative().default(0),
  all_inclusive: z.boolean().default(false),
  extras: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().positive().optional() })).default([]),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().min(3).max(40),
  admin_notes: z.string().max(1000).default(''),
  price_override: z.number().nonnegative().nullable().optional(),
  payment_state: z.enum(['unpaid', 'deposit_paid', 'paid']).default('unpaid'),
  send_email: z.boolean().default(false),
});

const dayDiff = (a: string, b: string) =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));

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

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const b = parsed.data;

    const nights = dayDiff(b.start_date, b.end_date);
    if (nights < 1) {
      return new Response(JSON.stringify({ error: 'Enddatum muss nach dem Startdatum liegen' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const extra_24h_blocks = Math.max(0, nights - 3);

    const pricing = await recalculatePrice(admin, {
      spot_id: b.spot_id,
      booking_mode: 'custom',
      nights,
      extra_24h_blocks,
      persons: b.persons,
      companions: b.companions,
      companions_kids: b.companions_kids,
      accommodation_type: b.accommodation_type,
      accommodation_persons: b.accommodation_persons,
      all_inclusive: b.all_inclusive,
      extras: b.extras,
    });

    const total =
      b.price_override !== null && b.price_override !== undefined
        ? Math.round(b.price_override * 100) / 100
        : pricing.total_price;

    const { data: settings } = await admin
      .from('payment_settings')
      .select('deposit_percent, deposit_deadline_hours, full_payment_days_before')
      .limit(1)
      .maybeSingle();
    const depositPercent = settings?.deposit_percent ?? 50;
    const deadlineHours = settings?.deposit_deadline_hours ?? 168;
    const fullPaymentDays = settings?.full_payment_days_before ?? 14;
    const depositAmount = Math.round((total * depositPercent) / 100 * 100) / 100;

    const finalDue = new Date(b.start_date);
    finalDue.setUTCDate(finalDue.getUTCDate() - fullPaymentDays);

    const nowIso = new Date().toISOString();
    const status = b.payment_state === 'paid' ? 'paid' : b.payment_state === 'deposit_paid' ? 'approved' : 'pending';
    const payment_status = b.payment_state === 'paid'
      ? 'paid'
      : b.payment_state === 'deposit_paid'
        ? 'deposit_paid'
        : 'deposit_pending';

    const { data: inserted, error: insErr } = await admin
      .from('bookings')
      .insert({
        user_id: userData.user.id,
        created_by_admin: true,
        spot_id: b.spot_id,
        booking_mode: 'custom',
        start_date: b.start_date,
        end_date: b.end_date,
        nights,
        extra_24h_blocks,
        persons: b.persons,
        companions: b.companions,
        companions_kids: b.companions_kids,
        accommodation_type: b.accommodation_type,
        accommodation_persons: b.accommodation_persons,
        all_inclusive: b.all_inclusive,
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.email,
        phone: b.phone,
        admin_notes: b.admin_notes,
        license_price: pricing.license_price,
        fishing_fee_price: pricing.fishing_fee_price,
        solo_surcharge_price: pricing.solo_surcharge_price,
        accommodation_price: pricing.accommodation_price,
        cleaning_price: pricing.cleaning_price,
        all_inclusive_price: pricing.all_inclusive_price,
        base_price: pricing.license_price,
        extras: pricing.extras_resolved,
        extras_price: pricing.extras_price,
        total_price: total,
        status,
        payment_status,
        deposit_amount: depositAmount,
        deposit_paid_at: b.payment_state === 'unpaid' ? null : nowIso,
        final_paid_at: b.payment_state === 'paid' ? nowIso : null,
        payment_deadline: b.payment_state === 'unpaid'
          ? new Date(Date.now() + deadlineHours * 3600_000).toISOString()
          : null,
        final_payment_due_date: finalDue.toISOString().slice(0, 10),
      })
      .select('id, booking_number')
      .single();

    if (insErr || !inserted) {
      return new Response(JSON.stringify({ error: insErr?.message ?? 'Buchung konnte nicht angelegt werden' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (b.send_email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({
            type: b.payment_state === 'unpaid' ? 'deposit_request' : 'deposit_received',
            booking_id: inserted.id,
          }),
        });
      } catch (e) {
        console.error('email dispatch failed', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, id: inserted.id, booking_number: inserted.booking_number, total_price: total, calculated_price: pricing.total_price }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
