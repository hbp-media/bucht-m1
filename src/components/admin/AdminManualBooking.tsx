import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Spot {
  id: string;
  name: string;
  max_persons: number;
  accommodation_type: string;
  allow_companions: boolean;
}

interface ExtraRow {
  id: string;
  name: string;
  price: number;
  unit: string;
  allow_quantity: boolean;
}

interface Props {
  onCreated: () => void;
  onClose: () => void;
}

const AdminManualBooking = ({ onCreated, onClose }: Props) => {
  const { toast } = useToast();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [extras, setExtras] = useState<ExtraRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    spot_id: "",
    start_date: "",
    end_date: "",
    persons: 1,
    companions: 0,
    companions_kids: 0,
    with_accommodation: false,
    accommodation_persons: 2,
    all_inclusive: false,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    admin_notes: "",
    price_override: "",
    payment_state: "unpaid" as "unpaid" | "deposit_paid" | "paid",
    send_email: false,
  });
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [spotRes, extraRes] = await Promise.all([
        supabase
          .from("fishing_spots")
          .select("id, name, max_persons, accommodation_type, allow_companions")
          .eq("active", true)
          .order("sort_order"),
        supabase
          .from("extras")
          .select("id, name, price, unit, allow_quantity")
          .eq("active", true)
          .order("sort_order"),
      ]);
      setSpots((spotRes.data as any) || []);
      setExtras((extraRes.data as any) || []);
    })();
  }, []);

  const spot = spots.find((s) => s.id === form.spot_id);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.spot_id || !form.start_date || !form.end_date) {
      toast({ title: "Fehlende Angaben", description: "Platz und Zeitraum sind erforderlich.", variant: "destructive" });
      return;
    }
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      toast({ title: "Fehlende Angaben", description: "Bitte Kontaktdaten vollständig ausfüllen.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-create-booking", {
      body: {
        spot_id: form.spot_id,
        start_date: form.start_date,
        end_date: form.end_date,
        persons: Number(form.persons),
        companions: Number(form.companions),
        companions_kids: Number(form.companions_kids),
        accommodation_type: form.with_accommodation ? spot?.accommodation_type ?? "none" : "none",
        accommodation_persons: form.with_accommodation ? Number(form.accommodation_persons) : 0,
        all_inclusive: form.all_inclusive,
        extras: Object.entries(selectedExtras).map(([id, quantity]) => ({ id, quantity })),
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        admin_notes: form.admin_notes,
        price_override: form.price_override === "" ? null : Number(form.price_override),
        payment_state: form.payment_state,
        send_email: form.send_email,
      },
    });
    setSaving(false);

    const errMsg = (data as any)?.error || error?.message;
    if (errMsg) {
      toast({ title: "Fehler", description: String(errMsg), variant: "destructive" });
      return;
    }
    toast({
      title: "Buchung angelegt",
      description: `${(data as any)?.booking_number ?? ""} · €${Number((data as any)?.total_price ?? 0).toFixed(2)}`,
    });
    onCreated();
    onClose();
  };

  return (
    <div className="space-y-5">
      <div>
        <Label className="font-body text-xs uppercase tracking-[0.15em]">Platz</Label>
        <Select value={form.spot_id} onValueChange={(v) => set({ spot_id: v })}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Platz wählen" />
          </SelectTrigger>
          <SelectContent>
            {spots.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} · max {s.max_persons} Angler
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Anreise</Label>
          <Input type="date" className="mt-1.5" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} />
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Abreise</Label>
          <Input type="date" className="mt-1.5" value={form.end_date} onChange={(e) => set({ end_date: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Angler</Label>
          <Input type="number" min={1} max={spot?.max_persons ?? 4} className="mt-1.5" value={form.persons} onChange={(e) => set({ persons: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Begleiter</Label>
          <Input
            type="number"
            min={0}
            disabled={spot ? !spot.allow_companions : false}
            className="mt-1.5"
            value={form.companions}
            onChange={(e) => set({ companions: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Kinder &lt;10</Label>
          <Input type="number" min={0} className="mt-1.5" value={form.companions_kids} onChange={(e) => set({ companions_kids: Number(e.target.value) })} />
        </div>
      </div>

      <div className="space-y-3 border border-border p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={form.with_accommodation} onCheckedChange={(c) => set({ with_accommodation: !!c })} />
          <span className="font-body text-sm">Hütte / Unterkunft buchen</span>
        </label>
        {form.with_accommodation && (
          <div>
            <Label className="font-body text-xs uppercase tracking-[0.15em]">Personen in der Unterkunft</Label>
            <Input type="number" min={1} className="mt-1.5" value={form.accommodation_persons} onChange={(e) => set({ accommodation_persons: Number(e.target.value) })} />
          </div>
        )}
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={form.all_inclusive} onCheckedChange={(c) => set({ all_inclusive: !!c })} />
          <span className="font-body text-sm">All you can Eat</span>
        </label>
      </div>

      {extras.length > 0 && (
        <div className="border border-border p-4 space-y-2">
          <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">Extras</span>
          {extras.map((ex) => {
            const active = selectedExtras[ex.id] !== undefined;
            return (
              <div key={ex.id} className="flex items-center gap-3">
                <Checkbox
                  checked={active}
                  onCheckedChange={(c) =>
                    setSelectedExtras((prev) => {
                      const next = { ...prev };
                      if (c) next[ex.id] = 1;
                      else delete next[ex.id];
                      return next;
                    })
                  }
                />
                <span className="font-body text-sm flex-1">
                  {ex.name} · €{Number(ex.price).toFixed(2)}
                </span>
                {active && ex.allow_quantity && (
                  <Input
                    type="number"
                    min={1}
                    className="w-20 h-8"
                    value={selectedExtras[ex.id]}
                    onChange={(e) =>
                      setSelectedExtras((prev) => ({ ...prev, [ex.id]: Math.max(1, Number(e.target.value)) }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Vorname</Label>
          <Input className="mt-1.5" value={form.first_name} onChange={(e) => set({ first_name: e.target.value })} />
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Nachname</Label>
          <Input className="mt-1.5" value={form.last_name} onChange={(e) => set({ last_name: e.target.value })} />
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">E-Mail</Label>
          <Input type="email" className="mt-1.5" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Telefon</Label>
          <Input className="mt-1.5" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Zahlungsstatus</Label>
          <Select value={form.payment_state} onValueChange={(v) => set({ payment_state: v as any })}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Vorreserviert · Anzahlung offen</SelectItem>
              <SelectItem value="deposit_paid">Anzahlung erhalten</SelectItem>
              <SelectItem value="paid">Vollständig bezahlt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-[0.15em]">Preis überschreiben (€)</Label>
          <Input
            type="number"
            min={0}
            placeholder="automatisch"
            className="mt-1.5"
            value={form.price_override}
            onChange={(e) => set({ price_override: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label className="font-body text-xs uppercase tracking-[0.15em]">Interne Notiz</Label>
        <Textarea className="mt-1.5" rows={2} value={form.admin_notes} onChange={(e) => set({ admin_notes: e.target.value })} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={form.send_email} onCheckedChange={(c) => set({ send_email: !!c })} />
        <span className="font-body text-sm">Bestätigungs-E-Mail an den Gast senden</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button onClick={submit} disabled={saving} className="flex-1">
          {saving ? "Wird angelegt..." : "Buchung anlegen"}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
};

export default AdminManualBooking;
