import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    sendOtp();
  }, [user]);

  const sendOtp = async () => {
    if (!user?.email) return;
    
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
      },
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
      description: `Ein Verifikationscode wurde an ${user.email} gesendet.`,
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token: otp,
      type: "email",
    });

    if (error) {
      toast({
        title: "Fehler",
        description: "Ungültiger Code. Bitte versuche es erneut.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create profile after successful verification
    const metadata = user.user_metadata || {};
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        first_name: metadata.first_name || "",
        last_name: metadata.last_name || "",
        phone: metadata.phone || "",
        account_status: "pending",
      }, { onConflict: "user_id" });

    if (profileError) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht erstellt werden.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    navigate("/pending");
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
