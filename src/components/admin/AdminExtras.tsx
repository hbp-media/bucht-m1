import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";

interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  sort_order: number;
}

const AdminExtras = () => {
  const { toast } = useToast();
  const [extras, setExtras] = useState<Extra[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Extra>>({});
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("extras").select("*").order("sort_order");
    setExtras(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (e: Extra) => {
    setEditingId(e.id);
    setDraft({ ...e });
    setCreating(false);
  };

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setDraft({ name: "", description: "", price: 0, active: true, sort_order: extras.length + 1 });
  };

  const save = async () => {
    if (creating) {
      const { error } = await supabase.from("extras").insert({
        name: draft.name || "",
        description: draft.description || "",
        price: Number(draft.price || 0),
        active: draft.active ?? true,
        sort_order: Number(draft.sort_order || 0),
      });
      if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Erstellt" });
        setCreating(false);
        load();
      }
      return;
    }
    if (!editingId) return;
    const { error } = await supabase
      .from("extras")
      .update({
        name: draft.name,
        description: draft.description,
        active: draft.active,
      })
      .eq("id", editingId);

    if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Gespeichert" });
      setEditingId(null);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Wirklich löschen?")) return;
    const { error } = await supabase.from("extras").delete().eq("id", id);
    if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Gelöscht" });
      load();
    }
  };

  if (loading) return <p className="text-center text-muted-foreground font-body py-8">Lade...</p>;

  const renderForm = () => (
    <div className="space-y-3 border border-primary bg-card p-5">
      <Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" />
      <Textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Beschreibung" rows={2} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
            Preis € {!creating && <span className="text-accent normal-case tracking-normal">· gesperrt</span>}
          </label>
          <Input
            type="number"
            value={draft.price ?? 0}
            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            disabled={!creating}
          />
          {!creating && (
            <p className="font-body text-[10px] text-muted-foreground mt-1">
              Preis nach Erstellung gesperrt. Zum Ändern: altes deaktivieren, neues anlegen.
            </p>
          )}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 font-body text-xs">
            <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
            Aktiv
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="flex items-center gap-2 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-olive-light transition-colors">
          <Save className="w-3.5 h-3.5" /> Speichern
        </button>
        <button
          onClick={() => {
            setEditingId(null);
            setCreating(false);
          }}
          className="flex items-center gap-2 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase border border-border hover:border-accent transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Abbrechen
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={startCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-olive-light transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Neues Extra
        </button>
      </div>

      {creating && renderForm()}

      {extras.map((ex) =>
        editingId === ex.id ? (
          <div key={ex.id}>{renderForm()}</div>
        ) : (
          <div key={ex.id} className="border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-base text-foreground">{ex.name}</h4>
                  <span className="font-body text-xs text-accent">€{ex.price}</span>
                  {!ex.active && <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground border border-border px-2 py-0.5">Inaktiv</span>}
                </div>
                <p className="font-body text-xs text-muted-foreground">{ex.description}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(ex)} className="p-2 text-muted-foreground hover:text-accent transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => remove(ex.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdminExtras;
