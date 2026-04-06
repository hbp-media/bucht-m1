import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // After login, redirect to verification
    navigate("/verify");
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
                Anmeldung
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Willkommen <span className="italic text-primary">zurück</span>
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Wird geladen..." : "Anmelden"}
            </button>
          </form>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link to="/register" className="text-primary hover:text-accent transition-colors">
              Jetzt registrieren
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default Login;
