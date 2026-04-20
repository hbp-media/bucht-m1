import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X } from "lucide-react";

interface Spot {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  max_persons: number;
  features: string[];
  active: boolean;
  sort_order: number;
}

const AdminSpots = () => {
  const { toast } = useToast();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Spot>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("fishing_spots").select("*").order("sort_order");
    setSpots(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (s: Spot) => {
    setEditingId(s.id);
    setDraft({ ...s });
  };

  const save = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("fishing_spots")
      .update({
        name: draft.name,
        description: draft.description,
        price_per_day: Number(draft.price_per_day),
        max_persons: Number(draft.max_persons),
        features: typeof draft.features === "string"
          ? (draft.features as any).split(",").map((s: string) => s.trim()).filter(Boolean)
          : draft.features,
        active: draft.active,
      })
      .eq("id", editingId);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert" });
      setEditingId(null);
      load();
    }
  };

  if (loading) return <p className="text-center text-muted-foreground font-body py-8">Lade...</p>;

  return (
    <div className="space-y-3">
      {spots.map((s) => (
        <div key={s.id} className="border border-border bg-card p-5">
          {editingId === s.id ? (
            <div className="space-y-3">
              <Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" />
              <Textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Beschreibung" rows={2} />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Preis/Tag €</label>
                  <Input type="number" value={draft.price_per_day || 0} onChange={(e) => setDraft({ ...draft, price_per_day: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Max. Personen</label>
                  <Input type="number" value={draft.max_persons || 1} onChange={(e) => setDraft({ ...draft, max_persons: Number(e.target.value) })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 font-body text-xs">
                    <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                    Aktiv
                  </label>
                </div>
              </div>
              <Input
                value={Array.isArray(draft.features) ? draft.features.join(", ") : (draft.features as any) || ""}
                onChange={(e) => setDraft({ ...draft, features: e.target.value as any })}
                placeholder="Eigenschaften (Komma-getrennt)"
              />
              <div className="flex gap-2">
                <button onClick={save} className="flex items-center gap-2 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-olive-light transition-colors">
                  <Save className="w-3.5 h-3.5" /> Speichern
                </button>
                <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase border border-border hover:border-accent transition-colors">
                  <X className="w-3.5 h-3.5" /> Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-base text-foreground">{s.name}</h4>
                  {!s.active && <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground border border-border px-2 py-0.5">Inaktiv</span>}
                </div>
                <p className="font-body text-xs text-muted-foreground mb-2">{s.description}</p>
                <div className="flex items-center gap-4 font-body text-xs text-muted-foreground">
                  <span>€{s.price_per_day}/Tag</span>
                  <span>max. {s.max_persons} P.</span>
                  {s.features.length > 0 && <span>{s.features.join(", ")}</span>}
                </div>
              </div>
              <button onClick={() => startEdit(s)} className="p-2 text-muted-foreground hover:text-accent transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminSpots;
