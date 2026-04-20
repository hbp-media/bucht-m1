import { Minus, Plus, Users, UserPlus, Baby } from "lucide-react";

interface StepPersonsProps {
  persons: number;
  companions: number;       // älter als 10 Jahre (kostenpflichtig €10/24h)
  companionsKids: number;   // bis 10 Jahre (kostenlos)
  maxPersons: number;
  onChange: (persons: number, companions: number, companionsKids: number) => void;
}

const StepPersons = ({
  persons,
  companions,
  companionsKids,
  maxPersons,
  onChange,
}: StepPersonsProps) => {
  const total = persons + companions + companionsKids;
  const atMax = total >= maxPersons;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Hinweis Gesamtbelegung */}
      <div className="bg-primary/5 border border-border px-5 py-3 flex items-center justify-between">
        <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          Belegung gesamt
        </span>
        <span className="font-display text-base text-primary">
          {total} / {maxPersons}
        </span>
      </div>

      {/* Angler */}
      <div className="bg-card border border-border p-7">
        <div className="flex items-center gap-3 mb-5">
          <Users className="w-5 h-5 text-accent" strokeWidth={1.4} />
          <div>
            <h3 className="font-display text-lg text-foreground">Angler</h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Maximal {maxPersons} Personen insgesamt auf diesem Platz
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, persons - 1), companions, companionsKids)}
            disabled={persons <= 1}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Weniger Angler"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="font-display text-4xl text-primary w-16 text-center">{persons}</div>
          <button
            type="button"
            onClick={() => onChange(Math.min(maxPersons, persons + 1), companions, companionsKids)}
            disabled={persons >= maxPersons || atMax}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mehr Angler"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Begleitung über 10 Jahre */}
      <div className="bg-card border border-border p-7">
        <div className="flex items-center gap-3 mb-5">
          <UserPlus className="w-5 h-5 text-accent" strokeWidth={1.4} />
          <div>
            <h3 className="font-display text-lg text-foreground">Begleitung über 10 Jahre</h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Ohne Angeln · €10 pro 24h
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onChange(persons, Math.max(0, companions - 1), companionsKids)}
            disabled={companions <= 0}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Weniger Begleitung"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="font-display text-4xl text-primary w-16 text-center">{companions}</div>
          <button
            type="button"
            onClick={() => onChange(persons, companions + 1, companionsKids)}
            disabled={atMax}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mehr Begleitung"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kinder bis 10 Jahre */}
      <div className="bg-card border border-border p-7">
        <div className="flex items-center gap-3 mb-5">
          <Baby className="w-5 h-5 text-accent" strokeWidth={1.4} />
          <div>
            <h3 className="font-display text-lg text-foreground">Kinder bis 10 Jahre</h3>
            <p className="font-body text-[11px] text-muted-foreground">
              Kostenlos
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onChange(persons, companions, Math.max(0, companionsKids - 1))}
            disabled={companionsKids <= 0}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Weniger Kinder"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="font-display text-4xl text-primary w-16 text-center">{companionsKids}</div>
          <button
            type="button"
            onClick={() => onChange(persons, companions, companionsKids + 1)}
            className="w-11 h-11 border border-border flex items-center justify-center text-foreground hover:border-accent transition-colors"
            aria-label="Mehr Kinder"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPersons;
