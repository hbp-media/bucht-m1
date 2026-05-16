import { useEffect, useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookingDetail from "./BookingDetail";

interface AdminBooking {
  id: string;
  start_date: string;
  end_date: string;
  persons: number;
  companions: number;
  total_price: number;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  cancelled_at: string | null;
  fishing_spots: { name: string } | null;
}

const STATUS_FILTERS = [
  { key: "pending", label: "Anfragen" },
  { key: "approved", label: "Bestätigt (unbezahlt)" },
  { key: "paid", label: "Bezahlt" },
  { key: "rejected", label: "Abgelehnt" },
  { key: "all", label: "Alle" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-primary/10 text-primary border-primary/20",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Vorreserviert",
  approved: "Bestätigt (unbezahlt)",
  rejected: "Abgelehnt",
  paid: "Bezahlt",
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("bookings")
      .select("id, start_date, end_date, persons, companions, total_price, status, first_name, last_name, email, phone, created_at, fishing_spots(name)")
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
        <div className="space-y-3">
          {bookings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className="w-full text-left border border-border bg-card p-4 hover:border-foreground/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-display text-lg text-foreground">
                      {b.first_name} {b.last_name}
                    </h4>
                    <span className={`px-2 py-0.5 font-body text-[10px] tracking-[0.15em] uppercase border ${STATUS_BADGE[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mb-2">
                    {b.fishing_spots?.name || "Platz"} · {format(new Date(b.start_date), "dd.MM.", { locale: de })}–{format(new Date(b.end_date), "dd.MM.yyyy", { locale: de })} · {b.persons + (b.companions || 0)} Personen
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {b.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {b.phone}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-display text-xl text-primary">€{Number(b.total_price).toFixed(2)}</p>
                  <span className="inline-flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                    <Eye className="w-3 h-3" /> Details
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Buchungsdetails</DialogTitle>
          </DialogHeader>
          {selectedId && (
            <BookingDetail
              bookingId={selectedId}
              onClose={() => setSelectedId(null)}
              onChanged={load}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
