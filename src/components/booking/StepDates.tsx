import { useEffect, useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { de } from "date-fns/locale";
import { addDays, differenceInCalendarDays, format, getDay, startOfDay } from "date-fns";
import "react-day-picker/dist/style.css";
import { supabase } from "@/integrations/supabase/client";
import type { BookingMode } from "@/lib/pricing";

interface StepDatesProps {
  spotId?: string | null;
  range: DateRange | undefined;
  onChange: (r: DateRange | undefined) => void;
  mode?: BookingMode | null;
}

const StepDates = ({ spotId, range, onChange, mode = "custom" }: StepDatesProps) => {
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [pendingDates, setPendingDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  const isWeekend = mode === "weekend";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      if (!spotId) {
        setBlockedDates([]);
        setPendingDates([]);
        setLoading(false);
        return;
      }

      const [blockedRes, bookingsRes] = await Promise.all([
        supabase
          .from("blocked_dates")
          .select("date")
          .eq("spot_id", spotId)
          .gte("date", today),
        supabase
          .from("bookings")
          .select("start_date, end_date, status")
          .eq("spot_id", spotId)
          .in("status", ["pending", "approved", "paid"])
          .gte("end_date", today),
      ]);

      const blocked: Date[] = [];
      const pending: Date[] = [];
      blockedRes.data?.forEach((b: any) => blocked.push(new Date(b.date)));

      bookingsRes.data?.forEach((b: any) => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        const cur = new Date(start);
        const target = b.status === "pending" ? pending : blocked;
        while (cur <= end) {
          target.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
      });

      setBlockedDates(blocked);
      setPendingDates(pending);
      setLoading(false);
    };
    load();
  }, [spotId]);

  const today = startOfDay(new Date());
  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;

  // Sets zum schnellen Lookup
  const blockedSet = useMemo(() => {
    const s = new Set<string>();
    blockedDates.forEach((d) => s.add(format(d, "yyyy-MM-dd")));
    return s;
  }, [blockedDates]);

  // Prüft ob ein Fr–So Wochenende komplett frei ist
  const isWeekendBlocked = (friday: Date) => {
    for (let i = 0; i < 3; i++) {
      const d = addDays(friday, i);
      if (blockedSet.has(format(d, "yyyy-MM-dd"))) return true;
    }
    return false;
  };

  // Disabled-Logik je nach Modus
  const disabledMatcher = isWeekend
    ? [
        { before: today },
        // Alles außer Freitage deaktivieren
        (date: Date) => getDay(date) !== 5,
        // Freitage deaktivieren, wenn Fr/Sa/So belegt ist
        (date: Date) => getDay(date) === 5 && isWeekendBlocked(date),
      ]
    : [{ before: today }, ...blockedDates];

  const handleSelect = (r: DateRange | undefined) => {
    if (isWeekend) {
      // Im Wochenend-Modus: bei Klick auf einen Freitag → fix Fr → So
      const picked = r?.from;
      if (picked && getDay(picked) === 5 && !isWeekendBlocked(picked)) {
        onChange({ from: picked, to: addDays(picked, 2) });
      }
      return;
    }
    onChange(r);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
      <div className="bg-card border border-border p-4 md:p-6 rounded-md">
        {isWeekend && (
          <div className="mb-4 p-3 border border-accent/40 bg-accent/5 rounded-sm">
            <p className="font-body text-xs text-foreground leading-relaxed">
              <span className="font-semibold">Wochenend-Karte:</span> Bitte wähle einen{" "}
              <span className="text-primary font-semibold">Freitag</span> als Anreise. Der
              Zeitraum wird automatisch auf <span className="font-semibold">Fr 11:00 – So 20:00</span>{" "}
              (3 Nächte) festgelegt.
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground font-body py-8">Lade Verfügbarkeit...</p>
        ) : isWeekend ? (
          <DayPicker
            mode="single"
            selected={range?.from}
            onDayClick={(day) => {
              if (getDay(day) === 5 && !isWeekendBlocked(day)) {
                onChange({ from: day, to: addDays(day, 2) });
              }
            }}
            locale={de}
            numberOfMonths={2}
            disabled={disabledMatcher}
            modifiers={{
              blocked: blockedDates,
              weekendRange: range?.from
                ? [range.from, addDays(range.from, 1), addDays(range.from, 2)]
                : [],
            }}
            modifiersClassNames={{
              blocked: "bg-destructive/15 text-destructive line-through",
              weekendRange: "!bg-primary !text-primary-foreground",
              selected: "!bg-primary !text-primary-foreground",
              today: "font-bold underline",
            }}
            className="pointer-events-auto"
          />
        ) : (
          <DayPicker
            mode="range"
            selected={range}
            onSelect={onChange}
            locale={de}
            numberOfMonths={2}
            disabled={disabledMatcher}
            modifiers={{ blocked: blockedDates }}
            modifiersClassNames={{
              blocked: "bg-destructive/15 text-destructive line-through",
              selected: "!bg-primary !text-primary-foreground",
              range_start: "!bg-primary !text-primary-foreground",
              range_end: "!bg-primary !text-primary-foreground",
              range_middle: "!bg-primary/20 !text-foreground",
              today: "font-bold underline",
            }}
            className="pointer-events-auto"
          />
        )}

        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary" />
            <span className="font-body text-[11px] text-muted-foreground">Ausgewählt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-destructive/30" />
            <span className="font-body text-[11px] text-muted-foreground">Belegt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-muted" />
            <span className="font-body text-[11px] text-muted-foreground">
              {isWeekend ? "Nicht wählbar" : "Vergangen"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 lg:w-72">
        <h4 className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Dein Zeitraum
        </h4>

        <div className="space-y-4">
          <div>
            <div className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
              Anreise
            </div>
            <div className="font-display text-lg text-foreground">
              {range?.from ? format(range.from, "dd. MMM yyyy", { locale: de }) : "–"}
              {isWeekend && range?.from && (
                <span className="block font-body text-[11px] text-accent mt-0.5">11:00 Uhr</span>
              )}
            </div>
          </div>

          <div>
            <div className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
              Abreise
            </div>
            <div className="font-display text-lg text-foreground">
              {range?.to ? format(range.to, "dd. MMM yyyy", { locale: de }) : "–"}
              {isWeekend && range?.to && (
                <span className="block font-body text-[11px] text-accent mt-0.5">20:00 Uhr</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
              Dauer
            </div>
            <div className="font-display text-2xl text-primary">
              {nights} {nights === 1 ? "Nacht" : "Nächte"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDates;
