import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email;
  const password = location.state?.password;
  const firstName = location.state?.firstName;
  const lastName = location.state?.lastName;
  const phone = location.state?.phone;
  const isLogin = location.state?.isLogin;

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
    if (!sent) {
      sendOtp();
    }
  }, [email]);

  const sendOtp = async () => {
    if (!email) return;

    const { error } = await supabase.functions.invoke("send-otp", {
      body: { email },
    });

    if (error) {
      toast({
        title: "Fehler",
        description: "Verifikationscode konnte nicht gesendet werden.",
        variant: "destructive",
      });
      return;
    }

    setSent(true);
    toast({
      title: "Code gesendet",
      description: `Ein Verifikationscode wurde an ${email} gesendet.`,
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    // Verify the OTP code
    const { data, error } = await supabase.functions.invoke("verify-otp", {
      body: { email, code: otp },
    });

    if (error || !data?.success) {
      toast({
        title: "Fehler",
        description: "Ungültiger Code. Bitte versuche es erneut.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (isLogin) {
      navigate("/account");
    } else {
      // For registration: now create the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, phone },
        },
      });

      if (signUpError) {
        toast({
          title: "Fehler",
          description: signUpError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Sign in immediately (auto-confirm is enabled)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast({
          title: "Fehler",
          description: signInError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from("profiles").upsert(
          {
            user_id: user.id,
            first_name: firstName || "",
            last_name: lastName || "",
            phone: phone || "",
            account_status: "approved",
          },
          { onConflict: "user_id" }
        );
      }

      navigate("/account");
    }

    setLoading(false);
  };

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12 flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-accent" />
            <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
              Verifizierung
            </span>
            <div className="w-12 h-px bg-accent" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Code <span className="italic text-primary">eingeben</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-10">
            Wir haben dir einen Verifikationscode per E-Mail gesendet.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="border-border bg-background font-body text-center text-2xl tracking-[0.5em]"
              placeholder="000000"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Wird überprüft..." : "Bestätigen"}
            </button>
          </form>

          <button
            onClick={sendOtp}
            className="mt-6 font-body text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Code erneut senden
          </button>
        </motion.div>
      </section>
    </main>
  );
};

export default Verify;
