import { Minus, Plus, Users } from "lucide-react";

interface StepPersonsProps {
  persons: number;
  maxPersons: number;
  onChange: (n: number) => void;
}

const StepPersons = ({ persons, maxPersons, onChange }: StepPersonsProps) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card border border-border p-8 text-center">
        <Users className="w-8 h-8 text-accent mx-auto mb-4" strokeWidth={1.4} />

        <h3 className="font-display text-xl text-foreground mb-2">Anzahl Angler</h3>
        <p className="font-body text-xs text-muted-foreground mb-8">
          Maximal {maxPersons} {maxPersons === 1 ? "Person" : "Personen"} auf diesem Platz
        </p>

        <div className="flex items-center justify-center gap-6 mb-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, persons - 1))}
            disabled={persons <= 1}
            className="w-12 h-12 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Weniger"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="font-display text-5xl text-primary w-20 text-center">{persons}</div>

          <button
            type="button"
            onClick={() => onChange(Math.min(maxPersons, persons + 1))}
            disabled={persons >= maxPersons}
            className="w-12 h-12 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mehr"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <p className="font-body text-[11px] text-muted-foreground">
          {persons === 1 ? "Angler" : "Angler"}
        </p>
      </div>
    </div>
  );
};

export default StepPersons;
