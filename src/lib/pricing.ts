// Zentrale Preislogik für das Buchungssystem.
// Alle Preise auf Basis der echten Bucht M1 Preisliste.

export const PRICES = {
  LICENSE_BASE: 130,           // Wochenend-/72h-Karte
  LICENSE_EXTRA_24H: 40,       // jede angefangene weitere 24h
  ACCOMMODATION_BASE: 40,      // pro Nacht für 2 Personen (Hütte oder Wohnwagen)
  ACCOMMODATION_EXTRA_PERSON: 10, // pro Zusatzperson pro Nacht
  CLEANING_PER_PERSON: 5,      // einmalig je Person der Unterkunft
  ALL_INCLUSIVE_PER_PERSON_24H: 15,
} as const;

export type AccommodationType = "none" | "hut" | "caravan";
export type BookingMode = "weekend" | "custom";

export type ExtraUnit = "flat" | "per_day" | "per_kg" | "per_piece" | "per_24h";

export interface Extra {
  id: string;
  code: string | null;
  name: string;
  description: string;
  price: number;
  unit: ExtraUnit;
  allow_quantity: boolean;
  active: boolean;
  sort_order: number;
}

export interface SelectedExtra {
  id: string;
  code: string | null;
  name: string;
  unit_price: number;
  unit: ExtraUnit;
  quantity: number; // 1 für nicht-mengenbasierte Extras
  total: number;    // berechneter Preis dieses Extras
}

// 24h-Blöcke berechnen aus Nächten/Dauer.
// Wir verwenden ganze Nächte als Approximation für 24h-Blöcke.
// Beispiel: 3 Nächte = 72h = Basispreis. 4 Nächte = +1×40€.
export const calcExtra24hBlocks = (nights: number): number => {
  if (nights <= 3) return 0;
  return nights - 3;
};

export const calcLicensePrice = (nights: number): number => {
  if (nights <= 0) return 0;
  return PRICES.LICENSE_BASE + calcExtra24hBlocks(nights) * PRICES.LICENSE_EXTRA_24H;
};

export const calcAccommodation = (params: {
  type: AccommodationType;
  persons: number;       // Personen, die in der Unterkunft schlafen
  nights: number;
}) => {
  if (params.type === "none" || params.persons <= 0 || params.nights <= 0) {
    return { stayPrice: 0, cleaningPrice: 0 };
  }
  const extraPersons = Math.max(0, params.persons - 2);
  const stayPrice =
    params.nights * PRICES.ACCOMMODATION_BASE +
    extraPersons * params.nights * PRICES.ACCOMMODATION_EXTRA_PERSON;
  const cleaningPrice = params.persons * PRICES.CLEANING_PER_PERSON;
  return { stayPrice, cleaningPrice };
};

export const calcAllInclusive = (params: {
  enabled: boolean;
  totalPersons: number;  // Angler + Begleitpersonen
  nights: number;
}): number => {
  if (!params.enabled) return 0;
  return params.totalPersons * params.nights * PRICES.ALL_INCLUSIVE_PER_PERSON_24H;
};

export const calcExtraTotal = (
  extra: Extra,
  ctx: { quantity: number; persons: number; nights: number },
): number => {
  const qty = Math.max(1, ctx.quantity || 1);
  switch (extra.unit) {
    case "flat":
      return Number(extra.price);
    case "per_day":
      return Number(extra.price) * Math.max(1, ctx.nights);
    case "per_24h":
      // Begleitperson zählt einmal pro 24h-Block, NICHT pro Person
      return Number(extra.price) * Math.max(1, ctx.nights);
    case "per_kg":
    case "per_piece":
      return Number(extra.price) * qty;
    default:
      return Number(extra.price);
  }
};

export interface PricingBreakdown {
  nights: number;
  extra24hBlocks: number;
  licensePrice: number;
  accommodationPrice: number;
  cleaningPrice: number;
  allInclusivePrice: number;
  extras: SelectedExtra[];
  extrasPrice: number;
  total: number;
}

export const buildPricing = (input: {
  nights: number;
  accommodationType: AccommodationType;
  accommodationPersons: number;
  totalPersons: number;
  allInclusive: boolean;
  extras: Extra[];
  extraQuantities: Record<string, number>;   // extraId -> quantity
  selectedExtraIds: string[];
}): PricingBreakdown => {
  const licensePrice = calcLicensePrice(input.nights);
  const extra24hBlocks = calcExtra24hBlocks(input.nights);

  const acc = calcAccommodation({
    type: input.accommodationType,
    persons: input.accommodationPersons,
    nights: input.nights,
  });

  const allInclusivePrice = calcAllInclusive({
    enabled: input.allInclusive,
    totalPersons: input.totalPersons,
    nights: input.nights,
  });

  const selectedExtras: SelectedExtra[] = input.selectedExtraIds
    .map((id) => input.extras.find((e) => e.id === id))
    .filter((e): e is Extra => !!e)
    .map((e) => {
      const qty = input.extraQuantities[e.id] ?? 1;
      const total = calcExtraTotal(e, {
        quantity: qty,
        persons: input.totalPersons,
        nights: Math.max(1, input.nights),
      });
      return {
        id: e.id,
        code: e.code,
        name: e.name,
        unit_price: Number(e.price),
        unit: e.unit,
        quantity: qty,
        total,
      };
    });

  const extrasPrice = selectedExtras.reduce((s, e) => s + e.total, 0);

  return {
    nights: input.nights,
    extra24hBlocks,
    licensePrice,
    accommodationPrice: acc.stayPrice,
    cleaningPrice: acc.cleaningPrice,
    allInclusivePrice,
    extras: selectedExtras,
    extrasPrice,
    total:
      licensePrice +
      acc.stayPrice +
      acc.cleaningPrice +
      allInclusivePrice +
      extrasPrice,
  };
};

export const ACCOMMODATION_LABEL: Record<AccommodationType, string> = {
  none: "Ohne Unterkunft",
  hut: "Fischerhütte",
  caravan: "Wohnwagen",
};

export const EXTRA_UNIT_LABEL: Record<ExtraUnit, string> = {
  flat: "pauschal",
  per_day: "pro Tag",
  per_kg: "pro kg",
  per_piece: "pro Stück",
  per_24h: "pro 24h",
};
