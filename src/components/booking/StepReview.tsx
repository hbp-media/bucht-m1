import { format } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACCOMMODATION_LABEL, EXTRA_UNIT_LABEL } from "@/lib/pricing";
import type { PricingBreakdown, AccommodationType } from "@/lib/pricing";
import type { FishingSpot } from "./StepSpot";

export interface ContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
}

interface StepReviewProps {
  spot: FishingSpot;
  range: DateRange;
  persons: number;
  companions: number;
  companionsKids: number;
  accommodationType: AccommodationType;
  accommodationPersons: number;
  allInclusive: boolean;
  pricing: PricingBreakdown;
  contact: ContactData;
  onContactChange: (c: ContactData) => void;
}

const StepReview = ({
  spot,
  range,
  persons,
  companions,
  companionsKids,
  accommodationType,
  accommodationPersons,
  allInclusive,
  pricing,
  contact,
  onContactChange,
}: StepReviewProps) => {
  const set = (k: keyof ContactData, v: string) =>
    onContactChange({ ...contact, [k]: v });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 max-w-5xl mx-auto items-start">
      {/* Linke Seite: Kontaktdaten */}
      <div className="bg-card border border-border p-7">
        <h3 className="font-display text-xl text-foreground mb-1">Kontaktdaten</h3>
        <p className="font-body text-xs text-muted-foreground mb-6">
          Wir prüfen jede Anfrage persönlich. Du erhältst die Bestätigung nach Prüfung
          per E-Mail.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vorname *">
              <Input
                value={contact.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Nachname *">
              <Input
                value={contact.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                maxLength={50}
              />
            </Field>
          </div>

          <Field label="E-Mail *">
            <Input
              type="email"
              value={contact.email}
              onChange={(e) => set("email", e.target.value)}
              maxLength={120}
            />
          </Field>

          <Field label="Telefon *">
            <Input
              type="tel"
              value={contact.phone}
              onChange={(e) => set("phone", e.target.value)}
              maxLength={30}
            />
          </Field>

          <Field label="Nachricht (optional)">
            <Textarea
              rows={4}
              value={contact.message}
              onChange={(e) => set("message", e.target.value)}
              maxLength={500}
              placeholder="Besondere Wünsche oder Fragen..."
            />
          </Field>
        </div>
      </div>

      {/* Rechte Seite: Preisaufstellung */}
      <PriceCard
        spot={spot}
        range={range}
        persons={persons}
        companions={companions}
        companionsKids={companionsKids}
        accommodationType={accommodationType}
        accommodationPersons={accommodationPersons}
        allInclusive={allInclusive}
        pricing={pricing}
      />
    </div>
  );
};

interface PriceCardProps {
  spot: FishingSpot;
  range: DateRange;
  persons: number;
  companions: number;
  companionsKids?: number;
  accommodationType: AccommodationType;
  accommodationPersons: number;
  allInclusive: boolean;
  pricing: PricingBreakdown;
}

export const PriceCard = ({
  spot,
  range,
  persons,
  companions,
  companionsKids = 0,
  accommodationType,
  accommodationPersons,
  allInclusive,
  pricing,
}: PriceCardProps) => {
  const totalPersons = persons + companions + companionsKids;
  return (
    <div className="bg-card border border-border lg:sticky lg:top-32">
      <div className="p-6 border-b border-border bg-primary/5">
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Übersicht
        </p>
        <h3 className="font-display text-xl text-foreground">{spot.name}</h3>
      </div>

      <div className="p-6 space-y-3 border-b border-border">
        {range.from && range.to && (
          <>
            <Row label="Anreise" value={format(range.from, "EEE, dd. MMM", { locale: de })} />
            <Row label="Abreise" value={format(range.to, "EEE, dd. MMM", { locale: de })} />
            <Row
              label="Dauer"
              value={`${pricing.nights} ${pricing.nights === 1 ? "Nacht" : "Nächte"}`}
            />
          </>
        )}
        <Row label="Angler" value={String(persons)} />
        {companions > 0 && (
          <Row label="Begleitung (>10 J.)" value={String(companions)} />
        )}
        {companionsKids > 0 && (
          <Row label="Kinder (bis 10 J.)" value={String(companionsKids)} />
        )}
        {accommodationType !== "none" && (
          <Row
            label="Unterkunft"
            value={`${ACCOMMODATION_LABEL[accommodationType]} · ${accommodationPersons} P.`}
          />
        )}
      </div>

      <div className="p-6 space-y-2.5">
        <PriceRow
          label={
            pricing.extra24hBlocks > 0
              ? `Fischerlizenz (72h + ${pricing.extra24hBlocks}× 24h)`
              : "Fischerlizenz (Wochenende)"
          }
          value={pricing.licensePrice}
        />

        {pricing.accommodationPrice > 0 && (
          <PriceRow
            label={`${ACCOMMODATION_LABEL[accommodationType]} · ${pricing.nights} N`}
            value={pricing.accommodationPrice}
          />
        )}

        {pricing.cleaningPrice > 0 && (
          <PriceRow label="Endreinigung" value={pricing.cleaningPrice} />
        )}

        {pricing.companionsPrice > 0 && (
          <PriceRow
            label={`Begleitung (${companions} P × ${pricing.nights} × 24h)`}
            value={pricing.companionsPrice}
          />
        )}

        {pricing.allInclusivePrice > 0 && (
          <PriceRow
            label={`All Inclusive (${totalPersons} P × ${pricing.nights} N)`}
            value={pricing.allInclusivePrice}
          />
        )}

        {pricing.extras.length > 0 && (
          <>
            <div className="pt-2 mt-2 border-t border-border/60">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Extras
              </p>
              {pricing.extras.map((e) => (
                <PriceRow
                  key={e.id}
                  label={
                    e.quantity > 1
                      ? `${e.name} (${e.quantity} ${EXTRA_UNIT_LABEL[e.unit]})`
                      : e.name
                  }
                  value={e.total}
                  small
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-6 flex items-baseline justify-between bg-primary/5 border-t border-border">
        <span className="font-body text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          Gesamt
        </span>
        <span className="font-display text-3xl text-primary">
          €{pricing.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
      {label}
    </label>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline gap-3">
    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
      {label}
    </span>
    <span className="font-body text-xs text-foreground text-right">{value}</span>
  </div>
);

const PriceRow = ({
  label,
  value,
  small,
}: {
  label: string;
  value: number;
  small?: boolean;
}) => (
  <div className="flex justify-between items-baseline gap-3">
    <span className={`font-body ${small ? "text-xs" : "text-sm"} text-foreground`}>
      {label}
    </span>
    <span className={`font-body ${small ? "text-xs" : "text-sm"} text-foreground`}>
      €{value.toFixed(2)}
    </span>
  </div>
);

export default StepReview;
