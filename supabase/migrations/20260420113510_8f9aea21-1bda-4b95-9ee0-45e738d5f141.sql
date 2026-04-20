-- 1) Erweiterung fishing_spots: Unterkunfts-Typ
ALTER TABLE public.fishing_spots
  ADD COLUMN IF NOT EXISTS accommodation_type text NOT NULL DEFAULT 'hut';

-- gültige Werte: 'hut' | 'caravan' | 'none'
ALTER TABLE public.fishing_spots
  DROP CONSTRAINT IF EXISTS fishing_spots_accommodation_type_check;
ALTER TABLE public.fishing_spots
  ADD CONSTRAINT fishing_spots_accommodation_type_check
  CHECK (accommodation_type IN ('hut','caravan','none'));

-- 2) Erweiterung bookings: Modus, Unterkunft, AI, Begleiter, Berechnungs-Felder
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_mode text NOT NULL DEFAULT 'weekend',
  ADD COLUMN IF NOT EXISTS nights integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_24h_blocks integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accommodation_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS accommodation_persons integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS companions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_inclusive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS license_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accommodation_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cleaning_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_inclusive_price numeric NOT NULL DEFAULT 0;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_booking_mode_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_booking_mode_check
  CHECK (booking_mode IN ('weekend','custom'));

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_accommodation_type_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_accommodation_type_check
  CHECK (accommodation_type IN ('none','hut','caravan'));

-- 3) Plätze konfigurieren
UPDATE public.fishing_spots SET price_per_day = 130, accommodation_type = 'caravan'
  WHERE name = 'Platz 3';
UPDATE public.fishing_spots SET price_per_day = 130, accommodation_type = 'hut'
  WHERE name <> 'Platz 3';

-- 4) Extras-Tabelle erweitern: Einheits-/Mengen-Logik
ALTER TABLE public.extras
  ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'flat',
  ADD COLUMN IF NOT EXISTS allow_quantity boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS code text;

-- gültige Einheiten: flat | per_day | per_kg | per_piece | per_24h
ALTER TABLE public.extras
  DROP CONSTRAINT IF EXISTS extras_unit_check;
ALTER TABLE public.extras
  ADD CONSTRAINT extras_unit_check
  CHECK (unit IN ('flat','per_day','per_kg','per_piece','per_24h'));

CREATE UNIQUE INDEX IF NOT EXISTS extras_code_unique_idx
  ON public.extras(code) WHERE code IS NOT NULL;

-- 5) Bestehende Extras leeren und neu befüllen
DELETE FROM public.extras;

INSERT INTO public.extras (name, description, price, unit, allow_quantity, code, sort_order, active) VALUES
  ('Begleitperson',     'Begleitperson ohne Angeln (Kinder bis 10 Jahre kostenlos)', 10, 'per_24h',  false, 'companion',     10, true),
  ('Klimaanlage',       'Klimaanlage in der Unterkunft',                              5, 'per_24h',  false, 'aircon',        20, true),
  ('Groundstick Verleih','Groundstick zum Anfüttern',                                3, 'per_day',  false, 'groundstick',   30, true),
  ('Echolot',           'Echolot für die gesamte Buchung',                           10, 'flat',     false, 'echolot',       40, true),
  ('Partikelmix',       'Partikelmix pro Kilogramm',                                  3, 'per_kg',   true,  'particle_mix',  50, true),
  ('Gasflasche',        'Gasflasche pauschal',                                       30, 'flat',     false, 'gas_bottle',    60, true),
  ('Müllentsorgung',    'Mistsack-Entsorgung pro Sack',                               5, 'per_piece',true,  'waste_bag',     70, true);
