import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Shield, ShieldCheck, Search, Users, Calendar, MapPin, Package } from "lucide-react";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminSpots from "@/components/admin/AdminSpots";
import AdminExtras from "@/components/admin/AdminExtras";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

type Tab = "bookings" | "users" | "spots" | "extras";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("bookings");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingAdminId, setTogglingAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, isAdmin, authLoading, adminLoading]);

  const fetchData = async () => {
    setLoadingProfiles(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    if (profilesRes.error) {
      toast({ title: "Fehler", description: profilesRes.error.message, variant: "destructive" });
    } else {
      setProfiles(profilesRes.data || []);
    }
    if (rolesRes.data) {
      setAdminUserIds(new Set(rolesRes.data.map((r) => r.user_id)));
    }
    setLoadingProfiles(false);
  };

  const handleDelete = async (profile: Profile) => {
    if (!confirm(`${profile.first_name} ${profile.last_name} wirklich löschen?`)) return;
    setDeletingId(profile.user_id);
    const { error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: profile.user_id },
    });
    if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Benutzer gelöscht" });
      fetchData();
    }
    setDeletingId(null);
  };

  const handleToggleAdmin = async (profile: Profile) => {
    const isCurrentlyAdmin = adminUserIds.has(profile.user_id);
    const action = isCurrentlyAdmin ? "entfernen" : "erteilen";
    if (!confirm(`Admin-Rechte für ${profile.first_name} ${profile.last_name} ${action}?`)) return;
    setTogglingAdminId(profile.user_id);
    if (isCurrentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", profile.user_id).eq("role", "admin");
      if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
      else {
        setAdminUserIds((p) => {
          const n = new Set(p);
          n.delete(profile.user_id);
          return n;
        });
        toast({ title: "Admin-Rechte entfernt" });
      }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: profile.user_id, role: "admin" });
      if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
      else {
        setAdminUserIds((p) => new Set(p).add(profile.user_id));
        toast({ title: "Admin-Rechte erteilt" });
      }
    }
    setTogglingAdminId(null);
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return p.first_name.toLowerCase().includes(q) || p.last_name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q);
  });

  if (authLoading || adminLoading) return null;
  if (!isAdmin) return null;

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-accent" />
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-accent flex items-center gap-2">
                <Shield className="w-4 h-4" /> Admin
              </span>
              <div className="w-12 h-px bg-accent" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-foreground text-center mb-10">
              Verwaltung
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-1 mb-10 border-b border-border">
              <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")} icon={<Calendar className="w-4 h-4" />}>Buchungen</TabBtn>
              <TabBtn active={tab === "users"} onClick={() => setTab("users")} icon={<Users className="w-4 h-4" />}>Benutzer</TabBtn>
              <TabBtn active={tab === "spots"} onClick={() => setTab("spots")} icon={<MapPin className="w-4 h-4" />}>Plätze</TabBtn>
              <TabBtn active={tab === "extras"} onClick={() => setTab("extras")} icon={<Package className="w-4 h-4" />}>Extras</TabBtn>
            </div>

            {tab === "bookings" && <AdminBookings />}
            {tab === "spots" && <AdminSpots />}
            {tab === "extras" && <AdminExtras />}

            {tab === "users" && (
              <div>
                <div className="max-w-xs mx-auto mb-8">
                  <div className="border border-border p-5 text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-display text-2xl text-foreground">{profiles.length}</p>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Benutzer</p>
                  </div>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Benutzer suchen..." className="pl-11" />
                </div>

                {loadingProfiles ? (
                  <p className="text-center text-muted-foreground font-body">Lade Benutzer...</p>
                ) : (
                  <div className="border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Rolle</TableHead>
                          <TableHead>Registriert</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              Keine Benutzer gefunden
                            </TableCell>
                          </TableRow>
                        ) : (
                          filtered.map((profile) => (
                            <TableRow key={profile.id}>
                              <TableCell>{profile.first_name} {profile.last_name}</TableCell>
                              <TableCell className="text-muted-foreground">{profile.phone || "–"}</TableCell>
                              <TableCell>
                                {adminUserIds.has(profile.user_id) ? (
                                  <span className="inline-flex items-center gap-1 text-primary">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Benutzer</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(profile.created_at).toLocaleDateString("de-AT")}
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                {profile.user_id !== user?.id && (
                                  <>
                                    <button
                                      onClick={() => handleToggleAdmin(profile)}
                                      disabled={togglingAdminId === profile.user_id}
                                      className={`p-2 transition-colors disabled:opacity-50 ${
                                        adminUserIds.has(profile.user_id)
                                          ? "text-primary hover:text-muted-foreground"
                                          : "text-muted-foreground hover:text-primary"
                                      }`}
                                    >
                                      <ShieldCheck className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(profile)}
                                      disabled={deletingId === profile.user_id}
                                      className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

const TabBtn = ({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 font-body text-[11px] tracking-[0.2em] uppercase border-b-2 transition-colors -mb-px ${
      active
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    {children}
  </button>
);

export default Admin;
