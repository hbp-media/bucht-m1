import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface StepExtrasProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const StepExtras = ({ selected, onChange }: StepExtrasProps) => {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("extras")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      setExtras(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  if (loading) return <p className="text-center text-muted-foreground font-body py-8">Lade Extras...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {extras.map((extra, i) => {
        const isSelected = selected.includes(extra.id);
        return (
          <motion.button
            key={extra.id}
            type="button"
            onClick={() => toggle(extra.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`text-left p-5 border bg-card transition-all duration-300 ${
              isSelected ? "border-primary" : "border-border hover:border-accent/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-5 h-5 mt-0.5 border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-display text-base text-foreground">{extra.name}</h4>
                  <span className="font-body text-sm text-accent whitespace-nowrap">
                    +€{extra.price}
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  {extra.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default StepExtras;
