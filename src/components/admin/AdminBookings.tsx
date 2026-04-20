import { useEffect, useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Mail, Phone, MessageSquare } from "lucide-react";

interface AdminBooking {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  persons: number;
  extras: any;
  total_price: number;
  status: string;
  payment_status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  admin_notes: string;
  created_at: string;
  spot_id: string;
  fishing_spots: { name: string } | null;
}

const STATUS_FILTERS = [
  { key: "pending", label: "Anfragen" },
  { key: "approved", label: "Bestätigt" },
  { key: "rejected", label: "Abgelehnt" },
  { key: "all", label: "Alle" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("bookings")
      .select("*, fishing_spots(name)")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data, error } = await q;
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      setBookings((data as AdminBooking[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (b: AdminBooking, status: "approved" | "rejected") => {
    setActing(b.id);
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", b.id);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      setActing(null);
      return;
    }

    // Send email
    try {
      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: status === "approved" ? "approved" : "rejected",
          email: b.email,
          first_name: b.first_name,
          spot_name: b.fishing_spots?.name || "Platz",
          start_date: b.start_date,
          end_date: b.end_date,
          total_price: Number(b.total_price),
        },
      });
    } catch (e) {
      console.error("email send failed", e);
    }

    toast({
      title: status === "approved" ? "Bestätigt" : "Abgelehnt",
      description: `Buchung von ${b.first_name} ${b.last_name} aktualisiert.`,
    });
    setActing(null);
    load();
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-border">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 font-body text-[11px] tracking-[0.2em] uppercase border-b-2 transition-colors -mb-px ${
              filter === f.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground font-body py-8">Lade Buchungen...</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-muted-foreground font-body py-12 border border-border bg-card">
          Keine Buchungen in dieser Kategorie.
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-display text-lg text-foreground">
                      {b.first_name} {b.last_name}
                    </h4>
                    <span className={`px-2.5 py-0.5 font-body text-[10px] tracking-[0.15em] uppercase border ${STATUS_BADGE[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    {b.fishing_spots?.name || "Platz"} · gestellt {format(new Date(b.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-primary">€{Number(b.total_price).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Anreise</p>
                  <p className="font-body text-foreground">{format(new Date(b.start_date), "dd.MM.yyyy", { locale: de })}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Abreise</p>
                  <p className="font-body text-foreground">{format(new Date(b.end_date), "dd.MM.yyyy", { locale: de })}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Personen</p>
                  <p className="font-body text-foreground">{b.persons}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Extras</p>
                  <p className="font-body text-foreground">{Array.isArray(b.extras) ? b.extras.length : 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-body text-xs">{b.email}</span>
                </a>
                <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-body text-xs">{b.phone}</span>
                </a>
              </div>

              {b.message && (
                <div className="flex gap-2 p-3 bg-muted/50 mb-4">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-muted-foreground italic">{b.message}</p>
                </div>
              )}

              {b.status === "pending" && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => updateStatus(b, "approved")}
                    disabled={acting === b.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-body text-[11px] tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Bestätigen
                  </button>
                  <button
                    onClick={() => updateStatus(b, "rejected")}
                    disabled={acting === b.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-body text-[11px] tracking-[0.15em] uppercase border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Ablehnen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
