import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  persons: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  spot_id: string;
  fishing_spots: { name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Anfrage prüfen", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Bestätigt", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Abgelehnt", cls: "bg-red-100 text-red-800 border-red-200" },
  paid: { label: "Bezahlt", cls: "bg-primary/10 text-primary border-primary/20" },
};

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, fishing_spots(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm("Diese Buchungsanfrage wirklich ablehnen/stornieren?")) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Abgelehnt", description: "Deine Anfrage wurde entfernt." });
      load();
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground font-body py-8">Lade Buchungen...</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 border border-border bg-card">
        <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.4} />
        <p className="font-body text-sm text-muted-foreground">
          Du hast noch keine Buchungen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b, i) => {
        const status = STATUS_LABEL[b.status] || STATUS_LABEL.pending;
        const canCancel = b.status === "pending" || b.status === "approved";
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="border border-border bg-card p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <h4 className="font-display text-lg text-foreground">
                  {b.fishing_spots?.name || "Platz"}
                </h4>
              </div>
              <span className={`px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border ${status.cls}`}>
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Anreise
                </p>
                <p className="font-body text-foreground">
                  {format(new Date(b.start_date), "dd. MMM yyyy", { locale: de })}
                </p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Abreise
                </p>
                <p className="font-body text-foreground">
                  {format(new Date(b.end_date), "dd. MMM yyyy", { locale: de })}
                </p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Personen
                </p>
                <p className="font-body text-foreground">{b.persons}</p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Preis
                </p>
                <p className="font-display text-primary text-base">€{Number(b.total_price).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="font-body text-[11px]">
                  Gestellt am {format(new Date(b.created_at), "dd.MM.yyyy", { locale: de })}
                </span>
              </div>
              {canCancel && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="flex items-center gap-1.5 font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" /> Stornieren
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MyBookings;
