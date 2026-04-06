import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Registrierung erfolgreich",
      description: "Dein Konto wurde erstellt. Dein Zugang muss noch freigeschaltet werden.",
    });

    navigate("/pending");
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
                Registrierung
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Konto <span className="italic text-primary">erstellen</span>
            </h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                  Vorname
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="border-border bg-background font-body"
                  placeholder="Max"
                />
              </div>
              <div>
                <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                  Nachname
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="border-border bg-background font-body"
                  placeholder="Mustermann"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Telefonnummer
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border-border bg-background font-body"
                placeholder="+43 664 ..."
              />
            </div>

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

            <div>
              <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                Passwort
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Wird geladen..." : "Registrieren"}
            </button>
          </form>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Bereits ein Konto?{" "}
            <Link to="/login" className="text-primary hover:text-accent transition-colors">
              Anmelden
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default Register;
