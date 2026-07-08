import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Check, MapPin, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { FishingSpot } from "./StepSpot";
import type { AccommodationType } from "@/lib/pricing";

interface Props {
  range: DateRange | undefined;
  currentSpotId: string | null;
  onSelectSpot: (spot: FishingSpot) => void;
}

interface SpotAvailability extends FishingSpot {
  available: boolean;
}

const AvailableSpotsForRange = ({ range, currentSpotId, onSelectSpot }: Props) => {
  const [spots, setSpots] = useState<SpotAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!range?.from || !range?.to) {
      setSpots([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      const start = format(range.from!, "yyyy-MM-dd");
      const end = format(range.to!, "yyyy-MM-dd");

      const [spotsRes, bookingsRes, blockedRes] = await Promise.all([
        supabase.from("fishing_spots").select("*").eq("active", true).order("sort_order"),
        supabase
          .from("bookings")
          .select("spot_id, start_date, end_date, status")
          .in("status", ["pending", "approved", "paid"])
          .lte("start_date", end)
          .gte("end_date", start),
        supabase
          .from("blocked_dates")
          .select("spot_id, date")
          .gte("date", start)
          .lte("date", end),
      ]);

      const blockedSpotIds = new Set<string>();
      bookingsRes.data?.forEach((b: any) => blockedSpotIds.add(b.spot_id));
      blockedRes.data?.forEach((b: any) => blockedSpotIds.add(b.spot_id));

      const mapped: SpotAvailability[] = (spotsRes.data || []).map((s: any) => ({
        ...s,
        accommodation_type: (s.accommodation_type ?? "hut") as AccommodationType,
        available: !blockedSpotIds.has(s.id),
      }));
      setSpots(mapped);
      setLoading(false);
    };
    load();
  }, [range?.from?.getTime(), range?.to?.getTime()]);

  if (!range?.from || !range?.to) return null;

  const availableCount = spots.filter((s) => s.available).length;

  return (
    <div className="bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base text-foreground">
          Verfügbare Plätze in diesem Zeitraum
        </h3>
        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {loading ? "..." : `${availableCount} / ${spots.length} frei`}
        </span>
      </div>
      <p className="font-body text-[11px] text-muted-foreground mb-4">
        Klicke auf einen freien Platz, um zu wechseln.
      </p>

      {loading ? (
        <p className="font-body text-xs text-muted-foreground py-4">Prüfe Verfügbarkeit...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {spots.map((s) => {
            const isCurrent = s.id === currentSpotId;
            const clickable = s.available && !isCurrent;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!s.available}
                onClick={() => clickable && onSelectSpot(s)}
                className={`text-left p-2.5 border transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary/10"
                    : s.available
                      ? "border-border hover:border-accent/60 cursor-pointer"
                      : "border-border bg-muted/40 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="flex items-center gap-1 font-body text-xs font-medium text-foreground truncate">
                    <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                    {s.name}
                  </span>
                  {isCurrent ? (
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  ) : s.available ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  ) : (
                    <X className="w-3 h-3 text-destructive flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="font-body text-[10px]">max. {s.max_persons}</span>
                </div>
                <div className="font-body text-[10px] mt-1">
                  {isCurrent ? (
                    <span className="text-primary tracking-[0.15em] uppercase">Aktuell</span>
                  ) : s.available ? (
                    <span className="text-emerald-700 dark:text-emerald-400 tracking-[0.15em] uppercase">
                      Frei
                    </span>
                  ) : (
                    <span className="text-destructive tracking-[0.15em] uppercase">Belegt</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableSpotsForRange;
