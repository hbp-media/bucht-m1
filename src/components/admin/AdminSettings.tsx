import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Save, Settings as SettingsIcon, Banknote, Clock } from "lucide-react";

interface PaymentSettings {
  id?: string;
  bank_holder: string;
  iban: string;
  bic: string;
  deposit_deadline_hours: number;
  full_payment_days_before: number;
  cancellation_days_before: number;
  deposit_percent: number;
  contact_email: string;
  contact_phone: string;
}

const DEFAULTS: PaymentSettings = {
  bank_holder: "",
  iban: "",
  bic: "",
  deposit_deadline_hours: 24,
  full_payment_days_before: 14,
  cancellation_days_before: 14,
  deposit_percent: 50,
  contact_email: "",
  contact_phone: "",
};

const AdminSettings = () => {
  const { toast } = useToast();
  const [s, setS] = useState<PaymentSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) setS(data as PaymentSettings);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {
      bank_holder: s.bank_holder,
      iban: s.iban.replace(/\s+/g, "").toUpperCase(),
      bic: s.bic.replace(/\s+/g, "").toUpperCase(),
      deposit_deadline_hours: Number(s.deposit_deadline_hours) || 24,
      full_payment_days_before: Number(s.full_payment_days_before) || 14,
      cancellation_days_before: Number(s.cancellation_days_before) || 14,
      deposit_percent: Math.min(100, Math.max(0, Number(s.deposit_percent) || 50)),
      contact_email: s.contact_email,
      contact_phone: s.contact_phone,
    };
    const query = s.id
      ? supabase.from("payment_settings").update(payload).eq("id", s.id)
      : supabase.from("payment_settings").insert(payload);
    const { error } = await query;
    if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Einstellungen gespeichert" });
      load();
    }
    setSaving(false);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Lade…</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Bankdaten */}
      <section>
        <header className="flex items-center gap-2 mb-4">
          <Banknote className="w-4 h-4 text-accent" />
          <h2 className="font-display text-xl text-foreground">Bankdaten</h2>
        </header>
        <p className="font-body text-sm text-muted-foreground mb-5">
          Diese Daten erscheinen in der Anzahlungs-E-Mail an den Kunden.
        </p>
        <div className="grid gap-4">
          <Field label="Kontoinhaber">
            <Input
              value={s.bank_holder}
              onChange={(e) => setS({ ...s, bank_holder: e.target.value })}
              placeholder="z.B. Kevin Hoffmann"
            />
          </Field>
          <Field label="IBAN">
            <Input
              value={s.iban}
              onChange={(e) => setS({ ...s, iban: e.target.value })}
              placeholder="AT00 0000 0000 0000 0000"
              className="font-mono"
            />
          </Field>
          <Field label="BIC">
            <Input
              value={s.bic}
              onChange={(e) => setS({ ...s, bic: e.target.value })}
              placeholder="z.B. RZOOAT2L"
              className="font-mono"
            />
          </Field>
        </div>
      </section>

      {/* Zahlungsregeln */}
      <section>
        <header className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-accent" />
          <h2 className="font-display text-xl text-foreground">Zahlungsregeln</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Anzahlung in %">
            <Input
              type="number"
              min={0}
              max={100}
              value={s.deposit_percent}
              onChange={(e) => setS({ ...s, deposit_percent: Number(e.target.value) })}
            />
          </Field>
          <Field label="Anzahlungs-Frist (Stunden)">
            <Input
              type="number"
              min={1}
              value={s.deposit_deadline_hours}
              onChange={(e) => setS({ ...s, deposit_deadline_hours: Number(e.target.value) })}
            />
          </Field>
          <Field label="Restzahlung Tage vor Anreise">
            <Input
              type="number"
              min={0}
              value={s.full_payment_days_before}
              onChange={(e) => setS({ ...s, full_payment_days_before: Number(e.target.value) })}
            />
          </Field>
          <Field label="Storno bis Tage vor Anreise">
            <Input
              type="number"
              min={0}
              value={s.cancellation_days_before}
              onChange={(e) => setS({ ...s, cancellation_days_before: Number(e.target.value) })}
            />
          </Field>
        </div>
        <p className="font-body text-xs text-muted-foreground mt-3">
          Spätere Stornierung: Anzahlung verfällt.
        </p>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 font-body text-[11px] tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-50 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saving ? "Speichere…" : "Einstellungen speichern"}
      </button>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
      {label}
    </span>
    {children}
  </label>
);

export default AdminSettings;
