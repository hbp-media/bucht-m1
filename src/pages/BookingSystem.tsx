import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const BookingSystem = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    // Check account status
    const checkStatus = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("user_id", user.id)
        .single();

      if (profile?.account_status === "pending") {
        toast({
          title: "Zugang ausstehend",
          description: "Dein Konto muss erst freigeschaltet werden.",
          variant: "destructive",
        });
        navigate("/pending");
      }
    };

    checkStatus();
  }, [user, loading]);

  if (loading) return null;

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                Buchungssystem
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Platz <span className="italic text-primary">reservieren</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-16">
              Wähle deinen gewünschten Angelplatz und Zeitraum.
            </p>

            <div className="p-16 border border-border text-center">
              <p className="font-body text-muted-foreground">
                Das Buchungssystem wird hier integriert.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default BookingSystem;
