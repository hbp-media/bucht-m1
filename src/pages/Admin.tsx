import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Shield, Search, Users } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
    fetchProfiles();
  }, [user, isAdmin, authLoading, adminLoading]);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      setProfiles(data || []);
    }
    setLoadingProfiles(false);
  };

  const handleDelete = async (profile: Profile) => {
    if (!confirm(`${profile.first_name} ${profile.last_name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;

    setDeletingId(profile.user_id);

    const { error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: profile.user_id },
    });

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Benutzer gelöscht", description: `${profile.first_name} ${profile.last_name} wurde entfernt.` });
      fetchProfiles();
    }
    setDeletingId(null);
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q)
    );
  });

  if (authLoading || adminLoading) return null;
  if (!isAdmin) return null;

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
              Benutzer<span className="italic text-primary">verwaltung</span>
            </h1>

            {/* Stats */}
            <div className="max-w-xs mx-auto mb-10">
              <div className="border border-border p-5 text-center">
                <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="font-display text-2xl text-foreground">{profiles.length}</p>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Benutzer</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Benutzer suchen..."
                className="pl-11 border-border bg-background font-body"
              />
            </div>

            {/* Table */}
            {loadingProfiles ? (
              <p className="text-center text-muted-foreground font-body">Lade Benutzer...</p>
            ) : (
              <div className="border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body text-[10px] tracking-[0.2em] uppercase">Name</TableHead>
                      <TableHead className="font-body text-[10px] tracking-[0.2em] uppercase">Telefon</TableHead>
                      <TableHead className="font-body text-[10px] tracking-[0.2em] uppercase">Registriert</TableHead>
                      <TableHead className="font-body text-[10px] tracking-[0.2em] uppercase text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground font-body py-8">
                          Keine Benutzer gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-body text-sm text-foreground">
                            {profile.first_name} {profile.last_name}
                          </TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">
                            {profile.phone || "–"}
                          </TableCell>
                          <TableCell className="font-body text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString("de-AT")}
                          </TableCell>
                          <TableCell className="text-right">
                            {profile.user_id !== user?.id && (
                              <button
                                onClick={() => handleDelete(profile)}
                                disabled={deletingId === profile.user_id}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                title="Benutzer löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Admin;
