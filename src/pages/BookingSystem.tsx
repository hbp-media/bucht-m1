import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays } from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StepIndicator from "@/components/booking/StepIndicator";
import StepMode from "@/components/booking/StepMode";
import StepSpot, { FishingSpot } from "@/components/booking/StepSpot";
import StepDates from "@/components/booking/StepDates";
import StepPersons from "@/components/booking/StepPersons";
import StepAccommodation from "@/components/booking/StepAccommodation";
import StepExtras from "@/components/booking/StepExtras";
import StepReview, { ContactData } from "@/components/booking/StepReview";

import {
  buildPricing,
  type AccommodationType,
  type BookingMode,
  type Extra,
  type ExtraUnit,
} from "@/lib/pricing";
import { buildWeekendRange, nextFriday } from "@/lib/weekend";

const STEPS = [
  "Platz",
  "Modus",
  "Zeitraum",
  "Personen",
  "Unterkunft",
  "Extras",
  "Übersicht",
];

const BookingSystem = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [mode, setMode] = useState<BookingMode | null>(null);
  const [spot, setSpot] = useState<FishingSpot | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [persons, setPersons] = useState(1);
  const [companions, setCompanions] = useState(0);
  const [companionsKids, setCompanionsKids] = useState(0);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>("none");
  const [accommodationPersons, setAccommodationPersons] = useState(0);
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

  // Auth + Profile prefill + Status check
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

  // Alle Extras vorladen
  useEffect(() => {
    supabase
      .from("extras")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        const list: Extra[] = (data || []).map((e) => ({
          id: e.id,
          code: (e as any).code ?? null,
          name: e.name,
          description: e.description,
          price: Number(e.price),
          unit: ((e as any).unit ?? "flat") as ExtraUnit,
          allow_quantity: Boolean((e as any).allow_quantity),
          active: e.active,
          sort_order: e.sort_order,
        }));
        setAllExtras(list);
      });
  }, []);

  // Modus-Wechsel → Auswahl zurücksetzen (nichts vorbelegen)
  useEffect(() => {
    setRange(undefined);
  }, [mode]);

  // Im Wochenend-Modus markiert der Kalender Fr → So (2 Kalendertage),
  // das Paket entspricht aber 3×24h (Fr 11:00 → So 20:00 ≈ 72h-Karte).
  const calendarNights =
    range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const nights = mode === "weekend" && calendarNights > 0 ? 3 : calendarNights;

  const totalPersons = persons + companions + companionsKids;

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

  // Validation pro Schritt
  const canNext = (() => {
    switch (step) {
      case 0:
        return !!spot;
      case 1:
        return !!mode;
      case 2:
        return !!range?.from && !!range?.to && nights >= 3;
      case 3:
        return persons >= 1 && (spot ? persons <= spot.max_persons : true);
      case 4:
        return (
          accommodationType === "none" ||
          (accommodationPersons >= 1 && accommodationPersons <= totalPersons)
        );
      case 5:
        return true;
      case 6:
        return !!(
          contact.first_name.trim() &&
          contact.last_name.trim() &&
          contact.email.trim() &&
          contact.phone.trim()
        );
      default:
        return false;
    }
  })();

  // Verfügbare Unterkunft je Spot
  const availableAccommodation: AccommodationType =
    spot?.accommodation_type === "caravan"
      ? "caravan"
      : spot?.accommodation_type === "hut"
        ? "hut"
        : "none";

  const handleSpotSelect = (s: FishingSpot) => {
    setSpot(s);
    if (persons > s.max_persons) setPersons(s.max_persons);
    setAccommodationType("none");
    setAccommodationPersons(0);
  };

  const handleSubmit = async () => {
    if (!user || !spot || !range?.from || !range?.to || !mode) return;
    setSubmitting(true);

    const payload: any = {
      user_id: user.id,
      spot_id: spot.id,
      booking_mode: mode,
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

    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      toast({
        title: "Fehler beim Senden",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Admin-Mail (kein Kunden-Mail bei Anfrage!)
    try {
      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: "admin_new",
          booking_id: inserted?.id,
        },
      });
    } catch (e) {
      console.error("admin notification failed", e);
    }

    setSubmitted(true);
    setSubmitting(false);
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
                Deine Anfrage wurde übermittelt. Wir prüfen die Verfügbarkeit und melden
                uns mit der Bestätigung per E-Mail. Erst nach unserer Freigabe ist die
                Buchung verbindlich.
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

      <section className="flex-1 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                Buchungssystem
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Platz <span className="italic text-primary">reservieren</span>
            </h1>
          </div>

          {/* Progress */}
          <div className="mb-12">
            <StepIndicator steps={STEPS} current={step} />
          </div>

          {/* Live Total (sticky bei Mobile bevor Review) */}
          {step > 0 && step < 6 && pricing.total > 0 && (
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-3 bg-card border border-border px-5 py-2.5">
                <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  Aktuelle Summe
                </span>
                <span className="font-display text-lg text-primary">
                  €{pricing.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {step === 0 && (
                <StepSpot
                  selectedSpotId={spot?.id ?? null}
                  onSelect={handleSpotSelect}
                />
              )}

              {step === 1 && <StepMode mode={mode} onChange={setMode} />}

              {step === 2 && spot && (
                <StepDates spotId={spot.id} range={range} onChange={setRange} mode={mode} />
              )}

              {step === 3 && spot && (
                <StepPersons
                  persons={persons}
                  companions={companions}
                  companionsKids={companionsKids}
                  maxPersons={spot.max_persons}
                  onChange={(p, c, k) => {
                    setPersons(p);
                    setCompanions(c);
                    setCompanionsKids(k);
                  }}
                />
              )}

              {step === 4 && spot && (
                <StepAccommodation
                  available={availableAccommodation}
                  selected={accommodationType}
                  accommodationPersons={accommodationPersons}
                  totalPersons={totalPersons}
                  onChange={(t, p) => {
                    setAccommodationType(t);
                    setAccommodationPersons(p);
                  }}
                />
              )}

              {step === 5 && (
                <StepExtras
                  selected={extraIds}
                  quantities={extraQuantities}
                  allInclusive={allInclusive}
                  onChange={(s, q, ai) => {
                    setExtraIds(s);
                    setExtraQuantities(q);
                    setAllInclusive(ai);
                  }}
                />
              )}

              {step === 6 && spot && range?.from && range?.to && (
                <StepReview
                  spot={spot}
                  range={range}
                  persons={persons}
                  companions={companions}
                  companionsKids={companionsKids}
                  accommodationType={accommodationType}
                  accommodationPersons={accommodationPersons}
                  allInclusive={allInclusive}
                  pricing={pricing}
                  contact={contact}
                  onContactChange={setContact}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 font-body text-xs tracking-[0.2em] uppercase border border-border text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Zurück
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="flex items-center gap-2 px-8 py-3 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Weiter <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canNext || submitting}
                className="flex items-center gap-2 px-8 py-3 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Wird gesendet..." : "Anfrage senden"}
                {!submitting && <Check className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BookingSystem;
