import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Check, Home, Caravan, MapPin, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { FishingSpot } from "./StepSpot";
import type { AccommodationType } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import lakeMap from "@/assets/lageplan-mit-rand.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [detailSpot, setDetailSpot] = useState<SpotAvailability | null>(null);
  const [imageIdx, setImageIdx] = useState(0);

  const detailImages = detailSpot
    ? (Array.from(
        new Set(
          [detailSpot.image_url, ...(detailSpot.gallery_urls ?? [])].filter(
            Boolean,
          ),
        ),
      ) as string[])
    : [];

  useEffect(() => {
    setImageIdx(0);
  }, [detailSpot?.id]);

  useEffect(() => {
    const from = range?.from;
    const to = range?.to;
    const load = async () => {
      setLoading(true);
      const start = from ? format(from, "yyyy-MM-dd") : null;
      const end = to ? format(to, "yyyy-MM-dd") : null;

      const [spotsRes, bookingsRes, blockedRes] = await Promise.all([
        supabase.from("fishing_spots").select("*").eq("active", true).order("sort_order"),
        start && end ? supabase
          .from("bookings")
          .select("spot_id, start_date, end_date, status")
          .in("status", ["pending", "approved", "paid"])
          .lte("start_date", end)
          .gte("end_date", start) : Promise.resolve({ data: [] }),
        start && end ? supabase
          .from("blocked_dates")
          .select("spot_id, date")
          .gte("date", start)
          .lte("date", end) : Promise.resolve({ data: [] }),
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

  const hasRange = Boolean(range?.from && range?.to);

  const availableCount = spots.filter((s) => s.available).length;

  return (
    <div>
      <section className="mb-5" aria-label="Lageplan">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base text-foreground">Lageplan</h3>
          <span className="font-body text-xs text-muted-foreground">9 Plätze</span>
        </div>
        <div className="border border-border bg-background p-5 md:p-8">
          <div className="relative">
            <img src={lakeMap} alt="Lageplan der Bucht M1 mit den nummerierten Angelplätzen 1 bis 9" width={1584} height={672} className="w-full h-auto" />
            {[
              [1, "left-[10.4%] top-[62%]"], [2, "left-[24%] top-[51.8%]"],
              [3, "left-[33.4%] top-[68.5%]"], [4, "left-[39.6%] top-[69.3%]"],
              [5, "left-[47.8%] top-[71%]"], [6, "left-[56.6%] top-[74.8%]"],
              [7, "left-[67.2%] top-[89%]"], [8, "left-[77.3%] top-[83.5%]"],
              [9, "left-[95.3%] top-[43.8%]"],
            ].map(([number, position]) => {
              const mapSpot = spots.find((s) => s.name === `Platz ${number}`);
              return (
                <Button key={number} type="button" variant="outline" size="icon"
                  aria-label={`Platz ${number} – Informationen`} title={`Platz ${number}`}
                  disabled={!mapSpot} onClick={() => mapSpot && setDetailSpot(mapSpot)}
                  className={`absolute ${position} -translate-x-1/2 -translate-y-1/2 h-7 w-7 md:h-9 md:w-9 rounded-none border-primary bg-background font-body text-sm md:text-lg hover:bg-primary hover:text-primary-foreground focus-visible:ring-2`}>
                  {number}
                </Button>
              );
            })}
          </div>
        </div>
      </section>
      {hasRange && <div className="bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base text-foreground">
          Verfügbare Plätze in diesem Zeitraum
        </h3>
        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {loading ? "..." : `${availableCount} / ${spots.length} frei`}
        </span>
      </div>
      <p className="font-body text-[11px] text-muted-foreground mb-4">
        Klicke auf einen Platz für Details – im Fenster kannst du ihn direkt für deine Buchung wählen.
      </p>

      {loading ? (
        <p className="font-body text-xs text-muted-foreground py-4">Prüfe Verfügbarkeit...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {spots.map((s) => {
            const isCurrent = s.id === currentSpotId;
            const AccIcon = s.accommodation_type === "caravan" ? Caravan : Home;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setDetailSpot(s)}
                className={`text-left group bg-background border transition-all overflow-hidden ${
                  isCurrent
                    ? "border-primary shadow-[0_4px_20px_hsla(82,30%,38%,0.15)]"
                    : s.available
                      ? "border-border hover:border-accent/60 hover:-translate-y-0.5"
                      : "border-border opacity-70"
                }`}
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                        !s.available ? "grayscale" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <MapPin className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.2} />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-primary-foreground font-body text-[9px] tracking-[0.15em] uppercase">
                        <Check className="w-2.5 h-2.5" /> Ausgewählt
                      </span>
                    ) : s.available ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white font-body text-[9px] tracking-[0.15em] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> Frei
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-destructive text-destructive-foreground font-body text-[9px] tracking-[0.15em] uppercase">
                        <X className="w-2.5 h-2.5" /> Belegt
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-display text-sm text-foreground">{s.name}</h4>
                    <span className="font-body text-[10px] text-accent whitespace-nowrap">
                      ab €130
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                    <span className="flex items-center gap-1 text-muted-foreground font-body text-[10px]">
                      <Users className="w-3 h-3" /> max. {s.max_persons}
                    </span>
                    <span className="flex items-center gap-1 text-accent font-body text-[10px] tracking-[0.1em] uppercase">
                      <AccIcon className="w-3 h-3" strokeWidth={1.6} />
                      {s.accommodation_type === "caravan" ? "Wohnwagen" : "Hütte"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      </div>}

      {/* Detail-Dialog */}
      <Dialog open={!!detailSpot} onOpenChange={(o) => !o && setDetailSpot(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailSpot && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{detailSpot.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Details zu {detailSpot.name}
                </DialogDescription>
              </DialogHeader>

              {detailImages.length > 0 ? (
                <div>
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={detailImages[Math.min(imageIdx, detailImages.length - 1)]}
                      alt={detailSpot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {detailImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {detailImages.map((img, i) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setImageIdx(i)}
                          aria-label={`Foto ${i + 1}`}
                          className={`aspect-video bg-muted overflow-hidden border-2 transition-colors ${
                            i === imageIdx
                              ? "border-primary"
                              : "border-transparent hover:border-accent/60"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${detailSpot.name} Foto ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-muted-foreground/40" strokeWidth={1.2} />
                </div>
              )}

              <div className="space-y-4">
                {/* Status */}
                {hasRange && <div>
                  {detailSpot.id === currentSpotId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase">
                      <Check className="w-3 h-3" /> Ausgewählt
                    </span>
                  ) : detailSpot.available ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white font-body text-[10px] tracking-[0.2em] uppercase">
                      Frei in diesem Zeitraum
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive text-destructive-foreground font-body text-[10px] tracking-[0.2em] uppercase">
                      Belegt in diesem Zeitraum
                    </span>
                  )}
                </div>

                }

                {/* Beschreibung */}
                {detailSpot.description && (
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {detailSpot.description}
                  </p>
                )}

                {/* Eckdaten */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      Angler
                    </p>
                    <p className="font-display text-base text-foreground">
                      max. {detailSpot.max_persons}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      Unterkunft
                    </p>
                    <p className="font-display text-base text-foreground">
                      {detailSpot.accommodation_type === "caravan" ? "Wohnwagen" : "Hütte"} inkl.
                    </p>
                  </div>
                </div>

                {/* Features */}
                {detailSpot.features && detailSpot.features.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Ausstattung
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {detailSpot.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 font-body text-sm text-foreground"
                        >
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-1" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4 border-t border-border">
                  {!hasRange ? (
                    <p className="text-center font-body text-xs text-muted-foreground">Bitte wähle einen Zeitraum für die Buchung.</p>
                  ) : detailSpot.available && detailSpot.id !== currentSpotId ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSpot(detailSpot);
                        setDetailSpot(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Diesen Platz wählen
                    </button>
                  ) : detailSpot.id === currentSpotId ? (
                    <p className="text-center font-body text-xs text-muted-foreground">
                      Dieser Platz ist bereits ausgewählt.
                    </p>
                  ) : (
                    <p className="text-center font-body text-xs text-destructive">
                      Dieser Platz ist im gewählten Zeitraum nicht verfügbar.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableSpotsForRange;
