// Kunde storniert eigene Buchung. Erlaubt wenn:
//  - status = 'pending' (jederzeit), oder
//  - payment_status in ('deposit_paid','paid') UND noch >= cancellation_days_before Tage bis start_date.
// Bei pending: einfach abgelehnt. Bei deposit_paid innerhalb Frist: refunded markieren.

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

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { bookingId } = parsed.data;

    const admin = createClient(supabaseUrl, serviceKey);
    const [{ data: bk }, { data: settings }] = await Promise.all([
      admin.from('bookings').select('*').eq('id', bookingId).maybeSingle(),
      admin.from('payment_settings').select('cancellation_days_before').limit(1).maybeSingle(),
    ]);

    if (!bk || bk.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: 'Buchung nicht gefunden' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cancelDays = settings?.cancellation_days_before ?? 14;
    const isPending = bk.status === 'pending';
    const isPaidStage = ['deposit_paid', 'paid'].includes(bk.payment_status);

    if (!isPending && !isPaidStage) {
      return new Response(JSON.stringify({ error: 'Stornierung in diesem Status nicht möglich.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (isPaidStage) {
      const start = new Date(bk.start_date).getTime();
      const cutoff = start - cancelDays * 86400_000;
      if (Date.now() > cutoff) {
        return new Response(
          JSON.stringify({ error: `Kostenlose Stornierung nur bis ${cancelDays} Tage vor Anreise möglich.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    const updates: Record<string, unknown> = {
      status: 'rejected',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (isPaidStage) updates.payment_status = 'refunded';

    const { error: updErr } = await admin.from('bookings').update(updates).eq('id', bookingId);
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mail + Admin-Notification
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({ type: 'user_cancelled', booking_id: bookingId }),
      });
    } catch (e) {
      console.error('mail dispatch failed', e);
    }

    try {
      const { data: admins } = await admin
        .from('user_roles').select('user_id').eq('role', 'admin');
      if (admins?.length) {
        const rows = admins.map((a) => ({
          user_id: a.user_id,
          type: 'booking_cancelled',
          title: 'Buchung vom Kunden storniert',
          message: `${bk.first_name} ${bk.last_name} hat die Buchung storniert.`,
          link: `/admin?booking=${bookingId}`,
          booking_id: bookingId,
        }));
        await admin.from('notifications').insert(rows);
      }
    } catch (e) {
      console.error('admin notify failed', e);
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
