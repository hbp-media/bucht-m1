import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ResetPassword = () => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.functions.invoke("reset-password", {
      body: { email, code, newPassword },
    });

    if (error || !data?.success) {
      toast({
        title: "Fehler",
        description: data?.error || "Passwort konnte nicht zurückgesetzt werden.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Erfolg",
      description: "Dein Passwort wurde erfolgreich zurückgesetzt.",
    });

    navigate("/login");
    setLoading(false);
  };

  if (!email) {
    return (
      <main className="bg-background min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 px-6 md:px-12 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="font-body text-muted-foreground mb-4">Keine E-Mail angegeben.</p>
            <Link to="/forgot-password" className="text-primary hover:text-accent transition-colors font-body">
              Zurück
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
                Zurücksetzen
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Neues <span className="italic text-primary">Passwort</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Code
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="border-border bg-background font-body text-center text-2xl tracking-[0.5em]"
                placeholder="000000"
              />
            </div>

            <div>
              <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Neues Passwort
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border-border bg-background font-body"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Passwort bestätigen
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-border bg-background font-body"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Wird gespeichert..." : "Passwort zurücksetzen"}
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

export default ResetPassword;
