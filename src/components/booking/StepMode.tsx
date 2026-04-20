import { motion } from "framer-motion";
import { CalendarDays, CalendarRange } from "lucide-react";
import type { BookingMode } from "@/lib/pricing";

interface StepModeProps {
  mode: BookingMode | null;
  onChange: (m: BookingMode) => void;
}

const StepMode = ({ mode, onChange }: StepModeProps) => {
  const options: {
    key: BookingMode;
    title: string;
    desc: string;
    detail: string;
    icon: typeof CalendarDays;
  }[] = [
    {
      key: "weekend",
      title: "Wochenend-Karte",
      desc: "Fr 11:00 – So 20:00 · 72 Stunden",
      detail: "Klassisches Wochenende. €130 inkl. E-Boot, Carpcradel, Kescher, Wiegeschlinge.",
      icon: CalendarDays,
    },
    {
      key: "custom",
      title: "Frei wählbarer Zeitraum",
      desc: "Ab 72h aufwärts, jede weitere 24h +€40",
      detail: "Flexibel verlängerbar. Basispreis €130 für die ersten 72h, jede weitere 24h +€40.",
      icon: CalendarRange,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
      {options.map((opt, i) => {
        const Icon = opt.icon;
        const active = mode === opt.key;
        return (
          <motion.button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={`text-left p-7 bg-card border transition-all duration-300 ${
              active
                ? "border-primary shadow-[0_8px_32px_hsla(82,30%,38%,0.18)]"
                : "border-border hover:border-accent/50"
            }`}
          >
            <Icon
              className={`w-7 h-7 mb-5 ${active ? "text-primary" : "text-accent"}`}
              strokeWidth={1.4}
            />
            <h3 className="font-display text-xl text-foreground mb-1.5">{opt.title}</h3>
            <p className="font-body text-[11px] tracking-[0.15em] uppercase text-accent mb-4">
              {opt.desc}
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {opt.detail}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
};

export default StepMode;
