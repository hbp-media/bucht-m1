// Cronjob-Endpoint: storniert Buchungen, deren Anzahlungsfrist abgelaufen ist.
// Aufruf via pg_cron (alle 15 min). Sendet automatisch Storno-Mail an Kunde.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const nowIso = new Date().toISOString();

    // Kandidaten: pending/approved + deposit_pending/unpaid + Frist abgelaufen
    const { data: expired, error } = await admin
      .from('bookings')
      .select('id, email, first_name')
      .in('status', ['pending', 'approved'])
      .in('payment_status', ['unpaid', 'deposit_pending'])
      .not('payment_deadline', 'is', null)
      .lt('payment_deadline', nowIso);

    if (error) throw error;
    if (!expired || expired.length === 0) {
      return new Response(JSON.stringify({ cancelled: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ids = expired.map((b) => b.id);

    const { error: updErr } = await admin
      .from('bookings')
      .update({
        status: 'rejected',
        payment_status: 'expired',
        cancelled_at: nowIso,
      })
      .in('id', ids);

    if (updErr) throw updErr;

    // Storno-Mails (best effort, parallel)
    await Promise.all(
      ids.map((id) =>
        fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ type: 'payment_expired', booking_id: id }),
        }).catch((e) => console.error('mail failed', id, e)),
      ),
    );

    return new Response(JSON.stringify({ cancelled: ids.length, ids }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('auto-cancel-unpaid-bookings error', e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
