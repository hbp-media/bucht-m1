import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Filter, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookingDetail from "./BookingDetail";

interface Spot {
  id: string;
  name: string;
  sort_order: number;
}

interface CalBooking {
  id: string;
  spot_id: string;
  start_date: string;
  end_date: string;
  status: string;
  first_name: string;
  last_name: string;
  total_price: number;
}

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  approved: "bg-emerald-500",
  paid: "bg-primary",
  rejected: "bg-red-400",
  cancelled: "bg-muted-foreground/40",
};

// Distinct color per spot index
const SPOT_COLORS = [
  "bg-rose-200 text-rose-900 border-rose-300",
  "bg-amber-200 text-amber-900 border-amber-300",
  "bg-emerald-200 text-emerald-900 border-emerald-300",
  "bg-sky-200 text-sky-900 border-sky-300",
  "bg-violet-200 text-violet-900 border-violet-300",
  "bg-orange-200 text-orange-900 border-orange-300",
  "bg-teal-200 text-teal-900 border-teal-300",
  "bg-pink-200 text-pink-900 border-pink-300",
  "bg-indigo-200 text-indigo-900 border-indigo-300",
  "bg-lime-200 text-lime-900 border-lime-300",
];

const AdminCalendar = () => {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [spots, setSpots] = useState<Spot[]>([]);
  const [bookings, setBookings] = useState<CalBooking[]>([]);
  const [activeSpots, setActiveSpots] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["pending", "approved", "paid"]),
  );
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("fishing_spots")
        .select("id, name, sort_order")
        .order("sort_order");
      const list = data || [];
      setSpots(list);
      setActiveSpots(new Set(list.map((s) => s.id)));
    })();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const start = format(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const end = format(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const { data } = await supabase
        .from("bookings")
        .select("id, spot_id, start_date, end_date, status, first_name, last_name, total_price")
        .lte("start_date", end)
        .gte("end_date", start);
      setBookings((data as CalBooking[]) || []);
      setLoading(false);
    };
    load();
  }, [month]);

  const spotColor = (spotId: string) => {
    const idx = spots.findIndex((s) => s.id === spotId);
    return SPOT_COLORS[idx % SPOT_COLORS.length];
  };

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
    });
  }, [month]);

  const visibleBookings = useMemo(
    () =>
      bookings.filter(
        (b) => activeSpots.has(b.spot_id) && statusFilter.has(b.status),
      ),
    [bookings, activeSpots, statusFilter],
  );

  const bookingsForDay = (day: Date) =>
    visibleBookings.filter((b) =>
      isWithinInterval(day, {
        start: parseISO(b.start_date),
        end: parseISO(b.end_date),
      }),
    );

  const toggleSpot = (id: string) => {
    setActiveSpots((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleStatus = (s: string) => {
    setStatusFilter((p) => {
      const n = new Set(p);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  };

  return (
    <div>
      {/* Header: Monat-Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-display text-2xl text-foreground capitalize">
          {format(month, "MMMM yyyy", { locale: de })}
        </h3>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filter */}
      <div className="border border-border bg-card p-4 mb-6 space-y-4">
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Plätze filtern
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveSpots(new Set(spots.map((s) => s.id)))}
              className="px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              Alle
            </button>
            <button
              onClick={() => setActiveSpots(new Set())}
              className="px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              Keine
            </button>
            {spots.map((s) => {
              const active = activeSpots.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSpot(s.id)}
                  className={`px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border transition-colors ${
                    active
                      ? `${spotColor(s.id)} border-current`
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <Filter className="w-3 h-3" /> Status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "pending", label: "Vorreserviert" },
              { key: "approved", label: "Bestätigt" },
              { key: "paid", label: "Bezahlt" },
              { key: "rejected", label: "Abgelehnt" },
              { key: "cancelled", label: "Storniert" },
            ].map((f) => {
              const active = statusFilter.has(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => toggleStatus(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1 font-body text-[10px] tracking-[0.15em] uppercase border transition-colors ${
                    active
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[f.key]}`} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kalender */}
      {loading ? (
        <p className="text-center text-muted-foreground font-body py-12">Lade Kalender...</p>
      ) : (
        <div className="border border-border bg-card">
          {/* Wochentag-Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Tage */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date());
              const dayBookings = bookingsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[110px] border-r border-b border-border p-1.5 last:border-r-0 ${
                    inMonth ? "bg-background" : "bg-muted/30"
                  }`}
                >
                  <div
                    className={`font-body text-xs mb-1 ${
                      isToday
                        ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground"
                        : inMonth
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className={`w-full text-left truncate px-1.5 py-0.5 font-body text-[10px] border ${spotColor(b.spot_id)} hover:opacity-80 transition-opacity flex items-center gap-1`}
                        title={`${b.first_name} ${b.last_name} · ${spots.find((s) => s.id === b.spot_id)?.name}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[b.status]}`} />
                        <span className="truncate">{b.last_name}</span>
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <p className="font-body text-[9px] text-muted-foreground px-1">
                        +{dayBookings.length - 3} weitere
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!selectedBookingId} onOpenChange={(o) => !o && setSelectedBookingId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Buchungsdetails</DialogTitle>
          </DialogHeader>
          {selectedBookingId && (
            <BookingDetail
              bookingId={selectedBookingId}
              onClose={() => setSelectedBookingId(null)}
              onChanged={() => {
                // Reload bookings for current month
                setMonth(new Date(month));
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendar;
