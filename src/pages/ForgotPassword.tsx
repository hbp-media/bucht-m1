import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.functions.invoke("send-password-reset", {
      body: { email },
    });

    if (error) {
      toast({
        title: "Fehler",
        description: "Anfrage konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Code gesendet",
      description: "Falls ein Konto mit dieser E-Mail existiert, wurde ein Code gesendet.",
    });

    navigate("/reset-password", { state: { email } });
    setLoading(false);
  };

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12 flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                Passwort
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Passwort <span className="italic text-primary">vergessen?</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-4">
              Gib deine E-Mail ein und wir senden dir einen Code zum Zurücksetzen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                E-Mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-background font-body"
                placeholder="deine@email.at"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Wird gesendet..." : "Code senden"}
            </button>
          </form>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:text-accent transition-colors">
              Zurück zur Anmeldung
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default ForgotPassword;
