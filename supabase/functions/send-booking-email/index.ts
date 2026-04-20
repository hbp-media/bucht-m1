const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  type: "received" | "approved" | "rejected";
  email: string;
  first_name: string;
  spot_name: string;
  start_date: string;
  end_date: string;
  total_price: number;
}

const formatDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" });
};

const buildEmail = (b: BookingEmailRequest) => {
  const greeting = `Hallo ${b.first_name},`;
  const dateRange = `${formatDate(b.start_date)} – ${formatDate(b.end_date)}`;
  const priceLine = `€${b.total_price.toFixed(2)}`;

  if (b.type === "received") {
    return {
      subject: "Wir haben deine Buchungsanfrage erhalten",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 22px; color: #4a5a3a; margin: 0 0 20px;">Vielen Dank für deine Anfrage!</h1>
          <p style="font-size: 14px; line-height: 1.6;">${greeting}</p>
          <p style="font-size: 14px; line-height: 1.6;">Wir haben deine Buchungsanfrage für <strong>${b.spot_name}</strong> erhalten und prüfen sie schnellstmöglich.</p>
          <div style="background: #f5f5f0; padding: 20px; margin: 24px 0; border-left: 3px solid #8a7530;">
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Platz:</strong> ${b.spot_name}</p>
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Zeitraum:</strong> ${dateRange}</p>
            <p style="margin: 0; font-size: 13px;"><strong>Gesamtpreis:</strong> ${priceLine}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6;">Du erhältst in Kürze eine Bestätigung per E-Mail.</p>
          <p style="font-size: 13px; color: #666; margin-top: 30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
        </div>`,
      text: `${greeting}\n\nWir haben deine Anfrage für ${b.spot_name} (${dateRange}, ${priceLine}) erhalten und prüfen sie. Bucht M1`,
    };
  }

  if (b.type === "approved") {
    return {
      subject: "Deine Buchung wurde bestätigt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 22px; color: #4a5a3a; margin: 0 0 20px;">Buchung bestätigt ✓</h1>
          <p style="font-size: 14px; line-height: 1.6;">${greeting}</p>
          <p style="font-size: 14px; line-height: 1.6;">Wir freuen uns, dir mitteilen zu können, dass deine Buchung bestätigt wurde.</p>
          <div style="background: #f5f5f0; padding: 20px; margin: 24px 0; border-left: 3px solid #4a5a3a;">
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Platz:</strong> ${b.spot_name}</p>
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Zeitraum:</strong> ${dateRange}</p>
            <p style="margin: 0; font-size: 13px;"><strong>Gesamtpreis:</strong> ${priceLine}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6;">Wir melden uns in Kürze mit weiteren Informationen zur Zahlung.</p>
          <p style="font-size: 13px; color: #666; margin-top: 30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
        </div>`,
      text: `${greeting}\n\nDeine Buchung für ${b.spot_name} (${dateRange}, ${priceLine}) wurde bestätigt. Bucht M1`,
    };
  }

  // rejected
  return {
    subject: "Update zu deiner Buchungsanfrage",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <h1 style="font-size: 22px; color: #1a1a1a; margin: 0 0 20px;">Anfrage konnte leider nicht bestätigt werden</h1>
        <p style="font-size: 14px; line-height: 1.6;">${greeting}</p>
        <p style="font-size: 14px; line-height: 1.6;">leider können wir deine Buchungsanfrage für <strong>${b.spot_name}</strong> im Zeitraum <strong>${dateRange}</strong> aktuell nicht bestätigen.</p>
        <p style="font-size: 14px; line-height: 1.6;">Falls du andere Termine in Erwägung ziehst, melde dich gerne direkt bei uns – wir helfen dir gerne weiter.</p>
        <p style="font-size: 13px; color: #666; margin-top: 30px;">Bucht M1 · info@buchtm1.at · +43 699 130 35 163</p>
      </div>`,
    text: `${greeting}\n\nLeider können wir deine Anfrage für ${b.spot_name} (${dateRange}) nicht bestätigen. Bucht M1`,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as BookingEmailRequest;

    if (!body.email || !body.type || !["received", "approved", "rejected"].includes(body.type)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtp2goKey = Deno.env.get("SMTP2GO_API_KEY");
    if (!smtp2goKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, text } = buildEmail(body);

    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: smtp2goKey,
        to: [`<${body.email}>`],
        sender: "Bucht M1 <noreply@purtuc.com>",
        subject,
        html_body: html,
        text_body: text,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("SMTP2GO error:", result);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-booking-email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
