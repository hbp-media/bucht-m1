import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

const StepIndicator = ({ steps, current }: StepIndicatorProps) => {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((label, idx) => {
          const isDone = idx < current;
          const isActive = idx === current;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isDone || isActive ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    color: isDone || isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-body text-xs font-semibold"
                >
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </motion.div>
                <span
                  className={`font-body text-[10px] tracking-[0.15em] uppercase whitespace-nowrap ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px mx-3 bg-border relative -mt-6">
                  <motion.div
                    initial={false}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    className="h-full bg-primary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Schritt {current + 1} / {steps.length}
          </span>
          <span className="font-body text-xs text-foreground">{steps[current]}</span>
        </div>
        <div className="w-full h-1 bg-muted">
          <motion.div
            initial={false}
            animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
