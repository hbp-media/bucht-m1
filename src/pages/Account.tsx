import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { User, LogOut, Trash2 } from "lucide-react";

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setEmail(user.email || "");
    fetchProfile();
  }, [user, loading]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setPhone(data.phone);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert", description: "Deine Daten wurden aktualisiert." });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDelete = async () => {
    if (!user) return;
    
    // Delete profile first (cascade will handle it but let's be explicit)
    await supabase.from("profiles").delete().eq("user_id", user.id);
    await signOut();
    
    toast({
      title: "Konto gelöscht",
      description: "Dein Konto und alle Daten wurden entfernt.",
    });
    navigate("/");
  };

  if (loading) return null;

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent">
                Mein Konto
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Dein <span className="italic text-primary">Profil</span>
            </h1>

            {/* Profile info */}
            <form onSubmit={handleSave} className="space-y-5 mb-12">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Vorname
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-border bg-background font-body"
                  />
                </div>
                <div>
                  <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Nachname
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-border bg-background font-body"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                  E-Mail
                </label>
                <Input
                  value={email}
                  disabled
                  className="border-border bg-muted font-body opacity-60"
                />
              </div>

              <div>
                <label className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                  Telefon
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-border bg-background font-body"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light transition-colors duration-300 disabled:opacity-50"
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </button>
            </form>

            {/* Actions */}
            <div className="space-y-4 border-t border-border pt-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold border border-border text-foreground hover:border-accent/40 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>

              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 font-body text-xs tracking-[0.2em] uppercase font-semibold border border-destructive/30 text-destructive hover:border-destructive/60 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Konto löschen
                </button>
              ) : (
                <div className="p-6 border border-destructive/30 space-y-4">
                  <p className="font-body text-sm text-foreground text-center">
                    Bist du sicher? Alle Daten werden unwiderruflich gelöscht.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDelete(false)}
                      className="flex-1 px-4 py-3 font-body text-xs tracking-[0.1em] uppercase border border-border text-foreground hover:border-accent/40 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-3 font-body text-xs tracking-[0.1em] uppercase bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                      Endgültig löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Account;
