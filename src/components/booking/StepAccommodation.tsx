import { motion } from "framer-motion";
import { Home, Caravan, Ban, Minus, Plus } from "lucide-react";
import type { AccommodationType } from "@/lib/pricing";

interface StepAccommodationProps {
  available: AccommodationType; // 'hut' | 'caravan' | 'none' (vom Spot)
  selected: AccommodationType;
  accommodationPersons: number;
  totalPersons: number; // Angler + Begleitpersonen → Obergrenze
  onChange: (type: AccommodationType, persons: number) => void;
}

const StepAccommodation = ({
  available,
  selected,
  accommodationPersons,
  totalPersons,
  onChange,
}: StepAccommodationProps) => {
  const accommodationOption = available === "caravan"
    ? {
        key: "caravan" as const,
        title: "Wohnwagen",
        desc: "14 m² · Strom · Sat-TV · Eiskasten · Heizung · Sitzecke mit Bettfunktion",
        icon: Caravan,
      }
    : {
        key: "hut" as const,
        title: "Fischerhütte",
        desc: "ca. 9 m² · Strom · Sat-TV · 2 Betten · Tisch · Sessel · Heizung",
        icon: Home,
      };

  const setType = (t: AccommodationType) => {
    if (t === "none") onChange("none", 0);
    else onChange(t, Math.max(2, accommodationPersons || 2));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Keine Unterkunft */}
        <motion.button
          type="button"
          onClick={() => setType("none")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-left p-6 bg-card border transition-all ${
            selected === "none"
              ? "border-primary shadow-[0_8px_32px_hsla(82,30%,38%,0.18)]"
              : "border-border hover:border-accent/50"
          }`}
        >
          <Ban
            className={`w-6 h-6 mb-4 ${selected === "none" ? "text-primary" : "text-accent"}`}
            strokeWidth={1.4}
          />
          <h3 className="font-display text-lg text-foreground mb-1">Ohne Unterkunft</h3>
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            Klassisch im Zelt oder Bivvy am Platz. Keine zusätzlichen Kosten.
          </p>
        </motion.button>

        {/* Hütte oder Wohnwagen */}
        <motion.button
          type="button"
          onClick={() => setType(accommodationOption.key)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`text-left p-6 bg-card border transition-all ${
            selected === accommodationOption.key
              ? "border-primary shadow-[0_8px_32px_hsla(82,30%,38%,0.18)]"
              : "border-border hover:border-accent/50"
          }`}
        >
          <accommodationOption.icon
            className={`w-6 h-6 mb-4 ${
              selected === accommodationOption.key ? "text-primary" : "text-accent"
            }`}
            strokeWidth={1.4}
          />
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="font-display text-lg text-foreground">{accommodationOption.title}</h3>
            <span className="font-body text-xs text-accent whitespace-nowrap">€40 / Nacht</span>
          </div>
          <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2">
            {accommodationOption.desc}
          </p>
          <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
            ab 2 Personen · jede weitere +€10/Nacht · Endreinigung €5/Person
          </p>
        </motion.button>
      </div>

      {/* Personenzahl in Unterkunft */}
      {selected !== "none" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-6"
        >
          <h4 className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-5">
            Personen in der Unterkunft
          </h4>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() =>
                onChange(selected, Math.max(1, accommodationPersons - 1))
              }
              disabled={accommodationPersons <= 1}
              className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="font-display text-4xl text-primary w-16 text-center">
              {accommodationPersons}
            </div>
            <button
              type="button"
              onClick={() =>
                onChange(
                  selected,
                  Math.min(totalPersons || 99, accommodationPersons + 1),
                )
              }
              disabled={accommodationPersons >= totalPersons}
              className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center font-body text-[11px] text-muted-foreground mt-4">
            Maximal {totalPersons} (Angler + Begleitung)
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StepAccommodation;
