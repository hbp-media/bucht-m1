import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const smtp2goKey = Deno.env.get("SMTP2GO_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Invalidate old codes
    await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Store new code
    const { error: insertError } = await supabase
      .from("verification_codes")
      .insert({ email, code, expires_at: expiresAt.toISOString() });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via SMTP2GO
    const emailResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: smtp2goKey,
        to: [`<${email}>`],
        sender: "Bucht M1 <noreply@purtuc.com>",
        subject: "Dein Verifizierungscode",
        html_body: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 20px;">Verifizierungscode</h1>
            <p style="font-size: 14px; color: #666; margin-bottom: 30px;">Verwende den folgenden Code, um deine E-Mail-Adresse zu bestätigen:</p>
            <div style="background: #f5f5f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #4a5a3a;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #999;">Der Code ist 10 Minuten gültig. Falls du diesen Code nicht angefordert hast, ignoriere diese E-Mail.</p>
          </div>
        `,
        text_body: `Dein Verifizierungscode: ${code}. Gültig für 10 Minuten.`,
      }),
    });

    const emailResult = await emailResponse.json();
    if (!emailResponse.ok) {
      console.error("SMTP2GO error:", emailResult);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
