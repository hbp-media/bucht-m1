// Admin markiert: Anzahlung erhalten.
// → payment_status='deposit_paid', deposit_paid_at=now, payment_deadline gelöscht
// → Bestätigungs-Mail an Kunde + Hinweis auf Restzahlung-Fälligkeit

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const BodySchema = z.object({ bookingId: z.string().uuid() });

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
    const { bookingId } = parsed.data;

    const { error: updErr } = await admin
      .from('bookings')
      .update({
        payment_status: 'deposit_paid',
        deposit_paid_at: new Date().toISOString(),
        payment_deadline: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mail + Notification
    try {
      const url = `${supabaseUrl}/functions/v1/send-booking-email`;
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` };
      await fetch(url, {
        method: 'POST', headers,
        body: JSON.stringify({ type: 'deposit_received', booking_id: bookingId }),
      });
    } catch (e) {
      console.error('mail dispatch failed', e);
    }
    try {
      const { data: bk } = await admin
        .from('bookings')
        .select('user_id, final_payment_due_date')
        .eq('id', bookingId)
        .maybeSingle();
      if (bk?.user_id) {
        await admin.from('notifications').insert({
          user_id: bk.user_id,
          type: 'deposit_received',
          title: 'Anzahlung erhalten',
          message: bk.final_payment_due_date
            ? `Restzahlung fällig bis ${bk.final_payment_due_date}.`
            : 'Deine Anzahlung wurde verbucht.',
          link: `/account`,
          booking_id: bookingId,
        });
      }
    } catch (e) {
      console.error('notification insert failed', e);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
