import { Minus, Plus, Users, UserPlus } from "lucide-react";

interface StepPersonsProps {
  persons: number;
  companions: number;
  maxPersons: number;
  onChange: (persons: number, companions: number) => void;
}

const StepPersons = ({ persons, companions, maxPersons, onChange }: StepPersonsProps) => {
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="bg-card border border-border p-7">
        <div className="flex items-center gap-3 mb-5">
          <Users className="w-5 h-5 text-accent" strokeWidth={1.4} />
          <div>
            <h3 className="font-display text-lg text-foreground">Angler</h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Maximal {maxPersons} {maxPersons === 1 ? "Angler" : "Angler"} auf diesem Platz
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, persons - 1), companions)}
            disabled={persons <= 1}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Weniger Angler"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="font-display text-4xl text-primary w-16 text-center">{persons}</div>
          <button
            type="button"
            onClick={() => onChange(Math.min(maxPersons, persons + 1), companions)}
            disabled={persons >= maxPersons}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mehr Angler"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border p-7">
        <div className="flex items-center gap-3 mb-5">
          <UserPlus className="w-5 h-5 text-accent" strokeWidth={1.4} />
          <div>
            <h3 className="font-display text-lg text-foreground">Begleitpersonen</h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Ohne Angeln · €10 pro 24h · Kinder bis 10 Jahre kostenlos
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onChange(persons, Math.max(0, companions - 1))}
            disabled={companions <= 0}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Weniger Begleitung"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="font-display text-4xl text-primary w-16 text-center">{companions}</div>
          <button
            type="button"
            onClick={() => onChange(persons, companions + 1)}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent transition-colors"
            aria-label="Mehr Begleitung"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center font-body text-[11px] text-muted-foreground mt-4">
          Begleitpersonen werden separat als Extra berechnet, sobald aktiviert.
        </p>
      </div>
    </div>
  );
};

export default StepPersons;
