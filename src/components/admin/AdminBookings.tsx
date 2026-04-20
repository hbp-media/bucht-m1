import { useEffect, useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Mail, Phone, MessageSquare, Home, Caravan, UtensilsCrossed } from "lucide-react";

interface AdminBooking {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  nights: number;
  persons: number;
  companions: number;
  booking_mode: string;
  accommodation_type: string;
  accommodation_persons: number;
  all_inclusive: boolean;
  extras: any;
  license_price: number;
  accommodation_price: number;
  cleaning_price: number;
  all_inclusive_price: number;
  extras_price: number;
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

const ACC_LABEL: Record<string, string> = {
  none: "Ohne Unterkunft",
  hut: "Fischerhütte",
  caravan: "Wohnwagen",
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      setBookings((data as any as AdminBooking[]) || []);
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

    try {
      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: status === "approved" ? "approved" : "rejected",
          booking_id: b.id,
        },
      });
    } catch (e) {
      console.error("email send failed", e);
    }

    toast({
      title: status === "approved" ? "Bestätigt" : "Abgelehnt",
      description: `Buchung von ${b.first_name} ${b.last_name} aktualisiert. Kunde wurde benachrichtigt.`,
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
          {bookings.map((b) => {
            const isOpen = expanded === b.id;
            const AccIcon = b.accommodation_type === "caravan" ? Caravan : Home;
            return (
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
                    <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                      {b.booking_mode === "weekend" ? "Wochenende" : "Frei"}
                    </p>
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
                    <p className="font-body text-foreground">{b.persons}{b.companions ? ` + ${b.companions}` : ""}</p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Unterkunft</p>
                    <p className="font-body text-foreground flex items-center gap-1.5">
                      {b.accommodation_type !== "none" && <AccIcon className="w-3 h-3" />}
                      {ACC_LABEL[b.accommodation_type] || "—"}
                    </p>
                  </div>
                </div>

                {(b.all_inclusive || (Array.isArray(b.extras) && b.extras.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {b.all_inclusive && (
                      <span className="inline-flex items-center gap-1 font-body text-[10px] tracking-[0.1em] uppercase px-2 py-1 bg-primary/10 text-primary">
                        <UtensilsCrossed className="w-3 h-3" /> All Inclusive
                      </span>
                    )}
                    {Array.isArray(b.extras) &&
                      b.extras.map((e: any, i: number) => (
                        <span
                          key={i}
                          className="font-body text-[10px] tracking-[0.1em] uppercase px-2 py-1 bg-muted text-muted-foreground"
                        >
                          {e.name}{e.quantity > 1 ? ` ×${e.quantity}` : ""}
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="font-body text-xs">{b.email}</span>
                  </a>
                  <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-body text-xs">{b.phone}</span>
                  </a>
                  <button
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                    className="font-body text-[11px] tracking-[0.15em] uppercase text-accent hover:underline ml-auto"
                  >
                    {isOpen ? "Weniger" : "Preisaufstellung"}
                  </button>
                </div>

                {isOpen && (
                  <div className="border border-border/60 bg-muted/30 p-4 mb-4 space-y-1.5">
                    <PriceLine label="Fischerlizenz" value={b.license_price} />
                    {b.accommodation_price > 0 && (
                      <PriceLine label={ACC_LABEL[b.accommodation_type]} value={b.accommodation_price} />
                    )}
                    {b.cleaning_price > 0 && (
                      <PriceLine label="Endreinigung" value={b.cleaning_price} />
                    )}
                    {b.all_inclusive_price > 0 && (
                      <PriceLine label="All Inclusive" value={b.all_inclusive_price} />
                    )}
                    {Array.isArray(b.extras) &&
                      b.extras.map((e: any, i: number) => (
                        <PriceLine
                          key={i}
                          label={e.quantity > 1 ? `${e.name} (×${e.quantity})` : e.name}
                          value={Number(e.total ?? 0)}
                        />
                      ))}
                    <div className="flex justify-between pt-2 mt-2 border-t border-border">
                      <span className="font-body text-sm font-semibold">Gesamt</span>
                      <span className="font-display text-base text-primary">
                        €{Number(b.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

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
            );
          })}
        </div>
      )}
    </div>
  );
};

const PriceLine = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between text-sm">
    <span className="font-body text-foreground">{label}</span>
    <span className="font-body text-foreground">€{value.toFixed(2)}</span>
  </div>
);

export default AdminBookings;
