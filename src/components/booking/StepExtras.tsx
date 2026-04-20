import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Minus, Plus, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Extra, ExtraUnit } from "@/lib/pricing";
import { EXTRA_UNIT_LABEL } from "@/lib/pricing";

interface StepExtrasProps {
  selected: string[];
  quantities: Record<string, number>;
  allInclusive: boolean;
  onChange: (
    selected: string[],
    quantities: Record<string, number>,
    allInclusive: boolean,
  ) => void;
}

const StepExtras = ({
  selected,
  quantities,
  allInclusive,
  onChange,
}: StepExtrasProps) => {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("extras")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        // "Begleitperson" ist jetzt im Personen-Schritt enthalten und wird automatisch berechnet
        const filtered = ((data as Extra[]) || []).filter((e) => e.code !== "companion");
        setExtras(filtered);
        setLoading(false);
      });
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      const next = { ...quantities };
      delete next[id];
      onChange(
        selected.filter((x) => x !== id),
        next,
        allInclusive,
      );
    } else {
      onChange([...selected, id], { ...quantities, [id]: 1 }, allInclusive);
    }
  };

  const setQty = (id: string, q: number) => {
    onChange(selected, { ...quantities, [id]: Math.max(1, q) }, allInclusive);
  };

  if (loading) {
    return (
      <p className="text-center text-muted-foreground font-body py-8">Lade Extras...</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* All Inclusive */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 bg-card border transition-all ${
          allInclusive ? "border-primary" : "border-border"
        }`}
      >
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => onChange(selected, quantities, !allInclusive)}
            className={`flex-shrink-0 w-5 h-5 mt-0.5 border flex items-center justify-center transition-colors ${
              allInclusive
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {allInclusive && <Check className="w-3 h-3" />}
          </button>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-accent" strokeWidth={1.6} />
                <h4 className="font-display text-base text-foreground">All Inclusive</h4>
              </div>
              <span className="font-body text-sm text-accent whitespace-nowrap">
                €15 / Person / 24h
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Frühstück · Abendessen · Groundstick. Gilt für alle Personen der Buchung.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section title */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Weitere Extras
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.map((extra, i) => {
          const isSelected = selected.includes(extra.id);
          const qty = quantities[extra.id] ?? 1;
          return (
            <motion.div
              key={extra.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`p-5 bg-card border transition-all ${
                isSelected ? "border-primary" : "border-border hover:border-accent/50"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(extra.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="font-display text-base text-foreground">
                        {extra.name}
                      </h4>
                      <span className="font-body text-sm text-accent whitespace-nowrap">
                        €{Number(extra.price).toFixed(0)}{" "}
                        <span className="text-[10px] text-muted-foreground">
                          {EXTRA_UNIT_LABEL[extra.unit as ExtraUnit]}
                        </span>
                      </span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      {extra.description}
                    </p>
                  </div>
                </div>
              </button>

              {isSelected && extra.allow_quantity && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    Menge
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setQty(extra.id, qty - 1)}
                      disabled={qty <= 1}
                      className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-body text-sm w-8 text-center">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(extra.id, qty + 1)}
                      className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StepExtras;
export type { Extra };
