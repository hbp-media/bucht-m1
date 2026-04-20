import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
}

interface StepRequestProps {
  data: ContactData;
  onChange: (d: ContactData) => void;
}

const StepRequest = ({ data, onChange }: StepRequestProps) => {
  const set = (k: keyof ContactData, v: string) => onChange({ ...data, [k]: v });

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-card border border-border p-8 space-y-5">
        <p className="font-body text-sm text-muted-foreground text-center mb-4">
          Wir prüfen jede Anfrage persönlich. Du erhältst kurz nach Absenden eine Bestätigung
          per E-Mail.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Vorname *">
            <Input
              required
              value={data.first_name}
              onChange={(e) => set("first_name", e.target.value)}
              maxLength={50}
            />
          </Field>
          <Field label="Nachname *">
            <Input
              required
              value={data.last_name}
              onChange={(e) => set("last_name", e.target.value)}
              maxLength={50}
            />
          </Field>
        </div>

        <Field label="E-Mail *">
          <Input
            required
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            maxLength={120}
          />
        </Field>

        <Field label="Telefon *">
          <Input
            required
            type="tel"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            maxLength={30}
          />
        </Field>

        <Field label="Nachricht (optional)">
          <Textarea
            rows={4}
            value={data.message}
            onChange={(e) => set("message", e.target.value)}
            maxLength={500}
            placeholder="Besondere Wünsche oder Fragen..."
          />
        </Field>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
      {label}
    </label>
    {children}
  </div>
);

export default StepRequest;
