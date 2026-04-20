-- ENUMS
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'rejected', 'paid', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE public.spot_availability AS ENUM ('available', 'partial', 'unavailable');

-- FISHING SPOTS
CREATE TABLE public.fishing_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_persons INTEGER NOT NULL DEFAULT 2,
  features TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fishing_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active spots"
  ON public.fishing_spots FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage spots"
  ON public.fishing_spots FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_fishing_spots_updated_at
  BEFORE UPDATE ON public.fishing_spots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EXTRAS
CREATE TABLE public.extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active extras"
  ON public.extras FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage extras"
  ON public.extras FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_extras_updated_at
  BEFORE UPDATE ON public.extras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  spot_id UUID NOT NULL REFERENCES public.fishing_spots(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  persons INTEGER NOT NULL DEFAULT 1,
  extras JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  extras_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_persons CHECK (persons >= 1)
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_spot ON public.bookings(spot_id);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own pending bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BLOCKED DATES
CREATE TABLE public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES public.fishing_spots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(spot_id, date)
);

CREATE INDEX idx_blocked_dates_spot_date ON public.blocked_dates(spot_id, date);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blocked dates"
  ON public.blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SEED: 10 Fishing Spots
INSERT INTO public.fishing_spots (name, description, price_per_day, max_persons, features, sort_order) VALUES
  ('Platz 1', 'Ruhiger Platz mit eigenem Steg und Naturblick.', 80, 2, ARRAY['ruhig','naturblick','steg'], 1),
  ('Platz 2', 'Großer Platz, ideal für längere Sessions.', 80, 2, ARRAY['groß','beliebt'], 2),
  ('Platz 3', 'Familienfreundlicher Platz mit Hütte.', 80, 2, ARRAY['familienfreundlich','hütte'], 3),
  ('Platz 4', 'Beliebter Eckplatz mit Tiefwasser.', 80, 2, ARRAY['beliebt','tiefwasser'], 4),
  ('Platz 5', 'Ruhig gelegen am Schilfgürtel.', 80, 2, ARRAY['ruhig','schilf'], 5),
  ('Platz 6', 'Großer Platz mit Panoramablick.', 80, 2, ARRAY['groß','naturblick'], 6),
  ('Platz 7', 'Sonniger Platz, ideal im Frühjahr.', 80, 2, ARRAY['sonnig','beliebt'], 7),
  ('Platz 8', 'Schattiger Platz für heiße Tage.', 80, 2, ARRAY['schattig','ruhig'], 8),
  ('Platz 9', 'Privater Platz mit eigenem Steg.', 80, 2, ARRAY['privat','steg'], 9),
  ('Platz 10', 'Premium-Eckplatz mit Hütte und Steg.', 80, 2, ARRAY['premium','hütte','steg'], 10);

-- SEED: 6 Extras
INSERT INTO public.extras (name, description, price, sort_order) VALUES
  ('Leih-Equipment', 'Komplette Angelausrüstung für deinen Aufenthalt.', 25, 1),
  ('Angelzubehör Paket', 'Köder, Haken und Kleinteile-Set.', 15, 2),
  ('Kühlbox', 'Große Kühlbox für deine Verpflegung.', 10, 3),
  ('Parkplatz reservieren', 'Garantierter Parkplatz direkt am Platz.', 5, 4),
  ('Früher Check-in', 'Anreise bereits ab 6:00 Uhr morgens.', 20, 5),
  ('Reinigung / Service', 'Endreinigung deines Platzes nach Abreise.', 30, 6);