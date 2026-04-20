import { format, differenceInCalendarDays } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { FishingSpot } from "./StepSpot";
import { Extra } from "./StepExtras";

interface StepSummaryProps {
  spot: FishingSpot;
  range: DateRange;
  persons: number;
  extras: Extra[];
}

const StepSummary = ({ spot, range, persons, extras }: StepSummaryProps) => {
  const nights = differenceInCalendarDays(range.to!, range.from!);
  const days = nights;
  const basePrice = spot.price_per_day * days;
  const extrasPrice = extras.reduce((sum, e) => sum + Number(e.price), 0);
  const total = basePrice + extrasPrice;

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border">
      <div className="p-8 border-b border-border">
        <h3 className="font-display text-2xl text-foreground mb-1">{spot.name}</h3>
        <p className="font-body text-sm text-muted-foreground">{spot.description}</p>
      </div>

      <div className="p-8 space-y-5 border-b border-border">
        <Row label="Anreise" value={format(range.from!, "EEEE, dd. MMM yyyy", { locale: de })} />
        <Row label="Abreise" value={format(range.to!, "EEEE, dd. MMM yyyy", { locale: de })} />
        <Row label="Dauer" value={`${nights} ${nights === 1 ? "Nacht" : "Nächte"}`} />
        <Row label="Personen" value={`${persons} ${persons === 1 ? "Angler" : "Angler"}`} />
      </div>

      <div className="p-8 space-y-3 border-b border-border">
        <h4 className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Preisaufstellung
        </h4>

        <PriceRow
          label={`Platzgebühr · €${spot.price_per_day} × ${days} ${days === 1 ? "Tag" : "Tage"}`}
          value={basePrice}
        />

        {extras.length > 0 && (
          <>
            <div className="pt-3 border-t border-border/60">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Extras
              </p>
              {extras.map((e) => (
                <PriceRow key={e.id} label={e.name} value={Number(e.price)} small />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-8 flex items-baseline justify-between bg-primary/5">
        <span className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground">
          Gesamtpreis
        </span>
        <span className="font-display text-3xl text-primary">€{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline gap-4">
    <span className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
      {label}
    </span>
    <span className="font-body text-sm text-foreground text-right">{value}</span>
  </div>
);

const PriceRow = ({ label, value, small }: { label: string; value: number; small?: boolean }) => (
  <div className="flex justify-between items-baseline gap-4">
    <span className={`font-body ${small ? "text-xs" : "text-sm"} text-foreground`}>{label}</span>
    <span className={`font-body ${small ? "text-xs" : "text-sm"} text-foreground`}>
      €{value.toFixed(2)}
    </span>
  </div>
);

export default StepSummary;
