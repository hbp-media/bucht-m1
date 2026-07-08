import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Minus, Plus, Users, UserPlus, Baby, UtensilsCrossed } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import { de } from "date-fns/locale";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type FishingSpot } from "@/components/booking/StepSpot";
import StepDates from "@/components/booking/StepDates";
import AvailableSpotsForRange from "@/components/booking/AvailableSpotsForRange";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


import {
  buildPricing,
  EXTRA_UNIT_LABEL,
  type Extra,
  type ExtraUnit,
} from "@/lib/pricing";

interface ContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
}

const BookingSystem = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [spot, setSpot] = useState<FishingSpot | null>(null);

  const [range, setRange] = useState<DateRange | undefined>();
  const [persons, setPersons] = useState(1);
  const [companions, setCompanions] = useState(0);
  const [companionsKids, setCompanionsKids] = useState(0);
  const [allInclusive, setAllInclusive] = useState(false);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});
  const [allExtras, setAllExtras] = useState<Extra[]>([]);
  const [contact, setContact] = useState<ContactData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Auth + Profile prefill
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    const init = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, account_status")
        .eq("user_id", user.id)
        .single();

      if (profile?.account_status === "pending") {
        toast({
          title: "Zugang ausstehend",
          description: "Dein Konto muss erst freigeschaltet werden.",
          variant: "destructive",
        });
        navigate("/pending");
        return;
      }

      setContact((c) => ({
        ...c,
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
      }));
    };
    init();
  }, [user, loading]);

  // Extras laden (Müll und Begleitperson rausgefiltert — sind inkludiert bzw. eigene Logik)
  useEffect(() => {
    supabase
      .from("extras")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        const list: Extra[] = (data || [])
          .filter((e: any) => e.code !== "companion" && e.code !== "waste_bag")
          .map((e: any) => ({
            id: e.id,
            code: e.code ?? null,
            name: e.name,
            description: e.description,
            price: Number(e.price),
            unit: (e.unit ?? "flat") as ExtraUnit,
            allow_quantity: Boolean(e.allow_quantity),
            active: e.active,
            sort_order: e.sort_order,
          }));
        setAllExtras(list);
      });
  }, []);

  const nights =
    range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const totalPersons = persons + companions + companionsKids;

  // Hütte ist immer dabei: Unterkunftstyp = Spot, Personen = alle
  const accommodationType = spot?.accommodation_type ?? "none";
  const accommodationPersons = accommodationType !== "none" ? totalPersons : 0;

  const pricing = useMemo(
    () =>
      buildPricing({
        nights,
        accommodationType,
        accommodationPersons,
        totalPersons,
        companions,
        allInclusive,
        extras: allExtras,
        extraQuantities,
        selectedExtraIds: extraIds,
      }),
    [
      nights,
      accommodationType,
      accommodationPersons,
      totalPersons,
      companions,
      allInclusive,
      allExtras,
      extraQuantities,
      extraIds,
    ],
  );

  const canSubmit =
    !!spot &&
    !!range?.from &&
    !!range?.to &&
    nights >= 3 &&
    persons >= 1 &&
    totalPersons <= 4 &&
    !!contact.first_name.trim() &&
    !!contact.last_name.trim() &&
    !!contact.email.trim() &&
    !!contact.phone.trim();

  // Alle Plätze laden für den Platz-Picker oben
  useEffect(() => {
    supabase
      .from("fishing_spots")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        const mapped: FishingSpot[] = (data || []).map((s: any) => ({
          ...s,
          accommodation_type: (s.accommodation_type ?? "hut") as any,
        }));
        setSpots(mapped);
      });
  }, []);

  const handleSpotSelect = (s: FishingSpot) => {
    setSpot(s);
    if (persons > s.max_persons) setPersons(s.max_persons);
  };


  const toggleExtra = (id: string) => {
    if (extraIds.includes(id)) {
      const q = { ...extraQuantities };
      delete q[id];
      setExtraIds(extraIds.filter((x) => x !== id));
      setExtraQuantities(q);
    } else {
      setExtraIds([...extraIds, id]);
      setExtraQuantities({ ...extraQuantities, [id]: 1 });
    }
  };

  const handleSubmit = async () => {
    if (!user || !spot || !range?.from || !range?.to) return;
    setSubmitting(true);

    const payload = {
      spot_id: spot.id,
      booking_mode: "custom",
      start_date: range.from.toISOString().split("T")[0],
      end_date: range.to.toISOString().split("T")[0],
      nights: pricing.nights,
      extra_24h_blocks: pricing.extra24hBlocks,
      persons,
      companions: companions + companionsKids,
      accommodation_type: accommodationType,
      accommodation_persons: accommodationPersons,
      all_inclusive: allInclusive,
      license_price: pricing.licensePrice,
      accommodation_price: pricing.accommodationPrice,
      cleaning_price: pricing.cleaningPrice,
      all_inclusive_price: pricing.allInclusivePrice,
      base_price: pricing.licensePrice,
      extras: pricing.extras,
      extras_price: pricing.extrasPrice,
      total_price: pricing.total,
      first_name: contact.first_name.trim(),
      last_name: contact.last_name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      message: contact.message.trim(),
    };

    try {
      const { data, error } = await supabase.functions.invoke("create-booking-checkout", {
        body: { booking: payload },
      });
      if (error || !data?.bookingId) {
        throw new Error(error?.message || "Anfrage konnte nicht gesendet werden");
      }
      setSubmitted(true);
    } catch (e: any) {
      toast({
        title: "Fehler beim Senden",
        description: e?.message ?? "Bitte erneut versuchen.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (submitted) {
    return (
      <main className="bg-background min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 pt-32 pb-20 px-6 md:px-12">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-8">
                <Check className="w-7 h-7" />
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-accent" />
                <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                  Anfrage gesendet
                </span>
                <div className="w-12 h-px bg-accent" />
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Vielen <span className="italic text-primary">Dank</span>
              </h1>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-10">
                Du erhältst gleich eine E-Mail mit unseren Bankdaten und der Höhe der Anzahlung.
                Bitte überweise innerhalb von <strong>24 Stunden</strong> – andernfalls wird deine
                Reservierung automatisch storniert.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/account")}
                  className="px-8 py-3 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors"
                >
                  Meine Buchungen
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 font-body text-xs tracking-[0.2em] uppercase border border-border text-foreground hover:border-accent transition-colors"
                >
                  Zur Startseite
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <section className="flex-1 pt-28 pb-16 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                Buchung
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Buchung <span className="italic text-primary">abschließen</span>
            </h1>
          </div>

          {/* Kalender (volle Breite) */}
          <div className="bg-card border border-border p-4 md:p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base text-foreground">Zeitraum</h3>
              <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Min. 3 Nächte
              </span>
            </div>
            <StepDates spotId={spot?.id ?? null} range={range} onChange={setRange} mode="custom" />
            {nights > 0 && nights < 3 && (
              <div className="mt-3 p-3 border border-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-sm">
                <span className="font-body text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Mindestaufenthalt 3 Nächte.</strong> Du hast aktuell {nights}{" "}
                  {nights === 1 ? "Nacht" : "Nächte"} gewählt.
                </span>
              </div>
            )}
          </div>


          {/* Info: alle Plätze mit Verfügbarkeit im gewählten Zeitraum */}
          {range?.from && range?.to && nights >= 3 && (
            <div className="mb-5">
              <AvailableSpotsForRange
                range={range}
                currentSpotId={spot?.id ?? null}
                onSelectSpot={handleSpotSelect}
              />
            </div>
          )}

          {spot ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
              {/* Linke Seite: Personen + Extras */}
              <div className="space-y-5">





                    {/* Personen */}
                    <div className="bg-card border border-border p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-base text-foreground">Personen</h3>
                        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                          {totalPersons} / 4
                        </span>
                      </div>
                      <div className="space-y-3">
                        <PersonRow
                          icon={<Users className="w-4 h-4 text-accent" strokeWidth={1.4} />}
                          label="Angler"
                          hint={`max. ${spot.max_persons}`}
                          value={persons}
                          onMinus={() => setPersons(Math.max(1, persons - 1))}
                          onPlus={() => setPersons(Math.min(spot.max_persons, persons + 1))}
                          disableMinus={persons <= 1}
                          disablePlus={persons >= spot.max_persons || totalPersons >= 4}
                        />
                        <PersonRow
                          icon={<UserPlus className="w-4 h-4 text-accent" strokeWidth={1.4} />}
                          label="Begleitung > 10 J."
                          hint="€10 / 24h"
                          value={companions}
                          onMinus={() => setCompanions(Math.max(0, companions - 1))}
                          onPlus={() => setCompanions(companions + 1)}
                          disableMinus={companions <= 0}
                          disablePlus={totalPersons >= 4}
                        />
                        <PersonRow
                          icon={<Baby className="w-4 h-4 text-accent" strokeWidth={1.4} />}
                          label="Kinder bis 10 J."
                          hint="kostenlos"
                          value={companionsKids}
                          onMinus={() => setCompanionsKids(Math.max(0, companionsKids - 1))}
                          onPlus={() => setCompanionsKids(companionsKids + 1)}
                          disableMinus={companionsKids <= 0}
                          disablePlus={totalPersons >= 4}
                        />
                      </div>
                    </div>

                    {/* Extras */}
                    <div className="bg-card border border-border p-5">
                      <h3 className="font-display text-base text-foreground mb-4">Extras</h3>

                      {/* All Inclusive */}
                      <button
                        type="button"
                        onClick={() => setAllInclusive(!allInclusive)}
                        className={`w-full text-left flex items-start gap-3 p-3 border transition-colors mb-3 ${
                          allInclusive ? "border-primary bg-primary/5" : "border-border hover:border-accent/50"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-4 h-4 mt-0.5 border flex items-center justify-center ${
                            allInclusive ? "bg-primary border-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {allInclusive && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <UtensilsCrossed className="w-3.5 h-3.5 text-accent" strokeWidth={1.6} />
                              <span className="font-body text-sm text-foreground font-medium">All Inclusive</span>
                            </div>
                            <span className="font-body text-xs text-accent">€15 / P / 24h</span>
                          </div>
                          <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                            Frühstück, Abendessen & Groundstick für alle.
                          </p>
                        </div>
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allExtras.map((extra) => {
                          const isSel = extraIds.includes(extra.id);
                          const qty = extraQuantities[extra.id] ?? 1;
                          return (
                            <div
                              key={extra.id}
                              className={`p-3 border transition-colors ${
                                isSel ? "border-primary bg-primary/5" : "border-border hover:border-accent/50"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleExtra(extra.id)}
                                className="w-full text-left flex items-start gap-2.5"
                              >
                                <span
                                  className={`flex-shrink-0 w-4 h-4 mt-0.5 border flex items-center justify-center ${
                                    isSel
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-border"
                                  }`}
                                >
                                  {isSel && <Check className="w-2.5 h-2.5" />}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <span className="font-body text-sm text-foreground font-medium">
                                      {extra.name}
                                    </span>
                                    <span className="font-body text-xs text-accent whitespace-nowrap">
                                      €{extra.price.toFixed(0)}{" "}
                                      <span className="text-[9px] text-muted-foreground">
                                        {EXTRA_UNIT_LABEL[extra.unit]}
                                      </span>
                                    </span>
                                  </div>
                                  <p className="font-body text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                                    {extra.description}
                                  </p>
                                </div>
                              </button>
                              {isSel && extra.allow_quantity && (
                                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border/60">
                                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mr-1">
                                    Menge
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExtraQuantities({
                                        ...extraQuantities,
                                        [extra.id]: Math.max(1, qty - 1),
                                      })
                                    }
                                    disabled={qty <= 1}
                                    className="w-6 h-6 border border-border flex items-center justify-center disabled:opacity-30"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-body text-xs w-6 text-center">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExtraQuantities({ ...extraQuantities, [extra.id]: qty + 1 })
                                    }
                                    className="w-6 h-6 border border-border flex items-center justify-center"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rechte Sidebar: Übersicht + Kontakt + CTA */}
                  <div className="lg:sticky lg:top-28 space-y-4">
                    {/* Übersicht */}
                    <div className="bg-card border border-border">
                      <div className="px-5 py-4 border-b border-border bg-primary/5">
                        <p className="font-body text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-0.5">
                          Übersicht
                        </p>
                        <h3 className="font-display text-lg text-foreground">{spot.name}</h3>
                        <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                          Fischerhütte inkl. · Müllentsorgung inkl.
                        </p>
                      </div>

                      <div className="px-5 py-3 text-xs space-y-1.5 border-b border-border">
                        {range?.from && range?.to ? (
                          <>
                            <SumRow
                              label="Zeitraum"
                              value={`${format(range.from, "dd.MM.", { locale: de })}–${format(range.to, "dd.MM.yyyy", { locale: de })}`}
                            />
                            <SumRow label="Dauer" value={`${nights} N`} />
                          </>
                        ) : (
                          <p className="font-body text-[11px] text-muted-foreground italic">
                            Bitte Zeitraum wählen
                          </p>
                        )}
                        <SumRow label="Belegung" value={`${totalPersons} P`} />
                      </div>

                      <div className="px-5 py-3 space-y-1.5 text-xs border-b border-border">
                        <PriceRow
                          label={
                            pricing.extra24hBlocks > 0
                              ? `Lizenz (72h + ${pricing.extra24hBlocks}×24h)`
                              : "Lizenz (72h)"
                          }
                          value={pricing.licensePrice}
                        />
                        {pricing.accommodationPrice > 0 && (
                          <PriceRow
                            label={`Hütte · ${nights} N`}
                            value={pricing.accommodationPrice}
                          />
                        )}
                        {pricing.cleaningPrice > 0 && (
                          <PriceRow label="Endreinigung" value={pricing.cleaningPrice} />
                        )}
                        {pricing.companionsPrice > 0 && (
                          <PriceRow
                            label={`Begleitung × ${companions}`}
                            value={pricing.companionsPrice}
                          />
                        )}
                        {pricing.allInclusivePrice > 0 && (
                          <PriceRow label="All Inclusive" value={pricing.allInclusivePrice} />
                        )}
                        {pricing.extras.map((e) => (
                          <PriceRow
                            key={e.id}
                            label={e.quantity > 1 ? `${e.name} (${e.quantity})` : e.name}
                            value={e.total}
                          />
                        ))}
                      </div>

                      <div className="px-5 py-4 flex items-baseline justify-between bg-primary/5">
                        <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                          Gesamt
                        </span>
                        <span className="font-display text-2xl text-primary">
                          €{pricing.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Kontakt */}
                    <div className="bg-card border border-border p-4 space-y-3">
                      <h4 className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                        Kontakt
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Vorname"
                          value={contact.first_name}
                          onChange={(e) => setContact({ ...contact, first_name: e.target.value })}
                        />
                        <Input
                          placeholder="Nachname"
                          value={contact.last_name}
                          onChange={(e) => setContact({ ...contact, last_name: e.target.value })}
                        />
                      </div>
                      <Input
                        type="email"
                        placeholder="E-Mail"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      />
                      <Input
                        type="tel"
                        placeholder="Telefon"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      />
                      <Textarea
                        rows={2}
                        placeholder="Nachricht (optional)"
                        value={contact.message}
                        onChange={(e) => setContact({ ...contact, message: e.target.value })}
                      />
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit || submitting}
                      className="w-full flex items-center justify-center gap-2 px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting
                        ? "Wird gesendet..."
                        : `Anfrage senden · €${pricing.total.toFixed(2)}`}
                      {!submitting && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <p className="font-body text-[10px] text-muted-foreground text-center leading-relaxed">
                      Nach dem Abschicken erhältst du eine E-Mail mit unseren Bankdaten. Anzahlung
                      innerhalb von 24h, sonst wird die Reservierung automatisch storniert.
                    </p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border p-6 text-center">
              <p className="font-body text-xs text-muted-foreground">
                Bitte wähle einen Platz, um Personen, Extras und Kontaktdaten festzulegen.
              </p>
            </div>
          )}



        </div>
      </section>

      <Footer />
    </main>
  );
};

const PersonRow = ({
  icon,
  label,
  hint,
  value,
  onMinus,
  onPlus,
  disableMinus,
  disablePlus,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  disableMinus: boolean;
  disablePlus: boolean;
}) => (
  <div className="flex items-center gap-3">
    {icon}
    <div className="flex-1 min-w-0">
      <p className="font-body text-sm text-foreground">{label}</p>
      <p className="font-body text-[10px] text-muted-foreground">{hint}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMinus}
        disabled={disableMinus}
        className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent disabled:opacity-30"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="font-display text-lg w-7 text-center text-primary">{value}</span>
      <button
        type="button"
        onClick={onPlus}
        disabled={disablePlus}
        className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent disabled:opacity-30"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const SumRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline gap-2">
    <span className="font-body text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
      {label}
    </span>
    <span className="font-body text-xs text-foreground">{value}</span>
  </div>
);

const PriceRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between items-baseline gap-2">
    <span className="font-body text-xs text-foreground">{label}</span>
    <span className="font-body text-xs text-foreground">€{value.toFixed(2)}</span>
  </div>
);

export default BookingSystem;
