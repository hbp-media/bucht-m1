// Schritt 1 (eingebettet) — Platz wählen.
// Klick auf Platz → ruft onSelect, der Parent navigiert automatisch zu Schritt 2.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Home, Caravan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AccommodationType } from "@/lib/pricing";

export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  max_persons: number;
  features: string[];
  image_url: string | null;
  active: boolean;
  sort_order: number;
  accommodation_type: AccommodationType;
}

interface StepSpotProps {
  selectedSpotId: string | null;
  onSelect: (spot: FishingSpot) => void;
}

const StepSpot = ({ selectedSpotId, onSelect }: StepSpotProps) => {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("fishing_spots")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      const mapped: FishingSpot[] = (data || []).map((s: any) => ({
        ...s,
        accommodation_type: (s.accommodation_type ?? "hut") as AccommodationType,
      }));
      setSpots(mapped);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <p className="text-center text-muted-foreground font-body py-12">Lade Plätze...</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {spots.map((spot, i) => {
        const isSelected = selectedSpotId === spot.id;
        const AccIcon =
          spot.accommodation_type === "caravan" ? Caravan : Home;

        return (
          <motion.button
            key={spot.id}
            type="button"
            onClick={() => onSelect(spot)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className={`group text-left bg-card border transition-all duration-300 overflow-hidden ${
              isSelected
                ? "border-primary shadow-[0_8px_32px_hsla(82,30%,38%,0.18)]"
                : "border-border hover:border-accent/50 hover:-translate-y-1"
            }`}
          >
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              {spot.image_url ? (
                <img src={spot.image_url} alt={spot.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                  <MapPin className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.2} />
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg text-foreground">{spot.name}</h3>
                <span className="font-body text-xs text-accent whitespace-nowrap">ab €130</span>
              </div>

              <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {spot.description}
              </p>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="font-body text-[11px]">{spot.max_persons} Angler</span>
                </div>
                <div className="flex items-center gap-1.5 text-accent">
                  <AccIcon className="w-3 h-3" strokeWidth={1.6} />
                  <span className="font-body text-[10px] tracking-[0.1em] uppercase">
                    {spot.accommodation_type === "caravan" ? "Wohnwagen" : "Hütte"} inkl.
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default StepSpot;
