import { useEffect, useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  Home,
  Caravan,
  UtensilsCrossed,
  MessageSquare,
  Check,
  X,
  Calendar,
  Users,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  bookingId: string;
  onClose: () => void;
  onChanged?: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-primary/10 text-primary border-primary/20",
};

const ACC_LABEL: Record<string, string> = {
  none: "Ohne Unterkunft",
  hut: "Fischerhütte",
  caravan: "Wohnwagen",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Vorreserviert",
  approved: "Bestätigt",
  rejected: "Abgelehnt",
  paid: "Bezahlt",
};

const BookingDetail = ({ bookingId, onClose, onChanged }: Props) => {
  const { toast } = useToast();
  const [b, setB] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, fishing_spots(name)")
      .eq("id", bookingId)
      .maybeSingle();
    setB(data);
    setNotes(data?.admin_notes || "");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [bookingId]);

  const updateStatus = async (status: "approved" | "rejected" | "paid") => {
    setActing(true);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      setActing(false);
      return;
    }
    if (status === "approved" || status === "rejected") {
      try {
        await supabase.functions.invoke("send-booking-email", {
          body: { type: status, booking_id: bookingId },
        });
      } catch (e) {
        console.error("email failed", e);
      }
    }
    toast({ title: `Status: ${STATUS_LABEL[status]}` });
    setActing(false);
    onChanged?.();
    load();
  };

  const saveNotes = async () => {
    setActing(true);
    const { error } = await supabase
      .from("bookings")
      .update({ admin_notes: notes })
      .eq("id", bookingId);
    if (error) toast({ title: "Fehler", description: error.message, variant: "destructive" });
    else toast({ title: "Notizen gespeichert" });
    setActing(false);
  };

  const deleteBooking = async () => {
    if (!confirm("Diese Buchung endgültig löschen?")) return;
    setActing(true);
    const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      setActing(false);
      return;
    }
    toast({ title: "Buchung gelöscht" });
    onChanged?.();
    onClose();
  };

  if (loading || !b) {
    return <p className="text-center text-muted-foreground py-8">Lade...</p>;
  }

  const AccIcon = b.accommodation_type === "caravan" ? Caravan : Home;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="font-display text-2xl text-foreground">
            {b.first_name} {b.last_name}
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Erstellt {format(new Date(b.created_at), "dd.MM.yyyy 'um' HH:mm", { locale: de })} Uhr
          </p>
        </div>
        <span className={`px-2.5 py-1 font-body text-[10px] tracking-[0.15em] uppercase border ${STATUS_BADGE[b.status]}`}>
          {STATUS_LABEL[b.status]}
        </span>
      </div>

      {/* Stammdaten Grid */}
      <div className="grid grid-cols-2 gap-4">
        <DetailRow icon={<MapPin className="w-3.5 h-3.5" />} label="Platz">
          {b.fishing_spots?.name || "—"}
        </DetailRow>
        <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Modus">
          {b.booking_mode === "weekend" ? "Wochenende" : "Frei wählbar"}
        </DetailRow>
        <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Anreise">
          {format(new Date(b.start_date), "dd.MM.yyyy", { locale: de })}
        </DetailRow>
        <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Abreise">
          {format(new Date(b.end_date), "dd.MM.yyyy", { locale: de })}
        </DetailRow>
        <DetailRow icon={<Users className="w-3.5 h-3.5" />} label="Angler">
          {b.persons}
        </DetailRow>
        <DetailRow icon={<Users className="w-3.5 h-3.5" />} label="Begleitung">
          {b.companions || 0} {b.companions ? "(über 10 Jahre)" : ""}
        </DetailRow>
        <DetailRow icon={<AccIcon className="w-3.5 h-3.5" />} label="Unterkunft">
          {ACC_LABEL[b.accommodation_type]}
          {b.accommodation_persons > 0 && ` · ${b.accommodation_persons} Pers.`}
        </DetailRow>
        <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Nächte">
          {b.nights}
        </DetailRow>
      </div>

      {/* Kontakt */}
      <div className="flex flex-wrap gap-4 p-3 bg-muted/40 border border-border">
        <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
          <Mail className="w-3.5 h-3.5" />
          <span className="font-body text-sm">{b.email}</span>
        </a>
        <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
          <Phone className="w-3.5 h-3.5" />
          <span className="font-body text-sm">{b.phone}</span>
        </a>
      </div>

      {/* Extras */}
      {(b.all_inclusive || (Array.isArray(b.extras) && b.extras.length > 0)) && (
        <div>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Extras
          </p>
          <div className="flex flex-wrap gap-1.5">
            {b.all_inclusive && (
              <span className="inline-flex items-center gap-1 font-body text-[10px] tracking-[0.1em] uppercase px-2 py-1 bg-primary/10 text-primary">
                <UtensilsCrossed className="w-3 h-3" /> All Inclusive
              </span>
            )}
            {Array.isArray(b.extras) &&
              b.extras.map((e: any, i: number) => (
                <span key={i} className="font-body text-[10px] tracking-[0.1em] uppercase px-2 py-1 bg-muted text-muted-foreground">
                  {e.name}{e.quantity > 1 ? ` ×${e.quantity}` : ""}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Preisaufstellung */}
      <div className="border border-border bg-muted/30 p-4 space-y-1.5">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Preisaufstellung
        </p>
        <PriceLine label="Fischerlizenz" value={Number(b.license_price)} />
        {Number(b.accommodation_price) > 0 && (
          <PriceLine label={ACC_LABEL[b.accommodation_type]} value={Number(b.accommodation_price)} />
        )}
        {Number(b.cleaning_price) > 0 && <PriceLine label="Endreinigung" value={Number(b.cleaning_price)} />}
        {Number(b.all_inclusive_price) > 0 && (
          <PriceLine label="All Inclusive" value={Number(b.all_inclusive_price)} />
        )}
        {Array.isArray(b.extras) &&
          b.extras.map((e: any, i: number) => (
            <PriceLine
              key={i}
              label={e.quantity > 1 ? `${e.name} (×${e.quantity})` : e.name}
              value={Number(e.total ?? 0)}
            />
          ))}
        <div className="flex justify-between pt-2 mt-2 border-t border-border">
          <span className="font-body text-sm font-semibold">Gesamt</span>
          <span className="font-display text-lg text-primary">€{Number(b.total_price).toFixed(2)}</span>
        </div>
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground pt-1">
          Zahlung: <span className="text-foreground">{b.payment_status}</span>
        </p>
      </div>

      {/* Kunden-Nachricht */}
      {b.message && (
        <div className="flex gap-2 p-3 bg-muted/50 border border-border">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
              Nachricht des Kunden
            </p>
            <p className="font-body text-sm text-foreground italic">{b.message}</p>
          </div>
        </div>
      )}

      {/* Admin-Notizen */}
      <div>
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Interne Notizen
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notizen für das Team..."
          className="min-h-[80px]"
        />
        <button
          onClick={saveNotes}
          disabled={acting}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-[10px] tracking-[0.2em] uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50"
        >
          <Save className="w-3 h-3" /> Notizen speichern
        </button>
      </div>

      {/* Aktionen */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        {b.status === "pending" && (
          <>
            <button
              onClick={() => updateStatus("approved")}
              disabled={acting}
              className="flex items-center gap-1.5 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase font-semibold bg-primary text-primary-foreground hover:bg-olive-light disabled:opacity-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Bestätigen
            </button>
            <button
              onClick={() => updateStatus("rejected")}
              disabled={acting}
              className="flex items-center gap-1.5 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Ablehnen
            </button>
          </>
        )}
        {b.status === "approved" && (
          <button
            onClick={() => updateStatus("paid")}
            disabled={acting}
            className="flex items-center gap-1.5 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Als bezahlt markieren
          </button>
        )}
        {(b.status === "approved" || b.status === "paid") && (
          <button
            onClick={() => updateStatus("rejected")}
            disabled={acting}
            className="flex items-center gap-1.5 px-4 py-2 font-body text-[11px] tracking-[0.15em] uppercase border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Ablehnen
          </button>
        )}
        <button
          onClick={deleteBooking}
          disabled={acting}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Löschen
        </button>
      </div>
    </div>
  );
};

const DetailRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className="font-body text-sm text-foreground">{children}</p>
  </div>
);

const PriceLine = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between text-sm">
    <span className="font-body text-foreground">{label}</span>
    <span className="font-body text-foreground">€{value.toFixed(2)}</span>
  </div>
);

export default BookingDetail;
