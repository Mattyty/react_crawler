import { Bar, Offer } from './types';

/**
 * Parse a Postgres text[] value which may come as:
 * - A JavaScript array (already parsed by Supabase client)
 * - A string like '{"Cocktails","Beer"}' (raw Postgres format)
 * - null/undefined
 */
function parseDrinksArray(drinks: any): string[] {
  if (!drinks) return [];
  if (Array.isArray(drinks)) return drinks;
  if (typeof drinks === 'string') {
    const trimmed = drinks.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((s: string) => s.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

/**
 * Extract unique filter values from bars (neighbourhood) and offers (drinks).
 * Returns neighbourhoods first, then drinks — each group sorted alphabetically.
 */
export function extractFilterOptions(bars: Bar[], offers: Offer[]): string[] {
  const neighbourhoods = new Set<string>();
  const drinks = new Set<string>();

  bars.forEach((bar) => {
    if (bar.neighborhood && bar.neighborhood.trim()) {
      neighbourhoods.add(bar.neighborhood.trim());
    }
  });

  offers.forEach((offer) => {
    const parsed = parseDrinksArray((offer as any).drinks);
    parsed.forEach((drink) => {
      if (drink) drinks.add(drink);
    });
  });

  const sortedNeighbourhoods = Array.from(neighbourhoods).sort();
  const sortedDrinks = Array.from(drinks).sort();

  return [...sortedNeighbourhoods, ...sortedDrinks];
}

/**
 * Determine which active filters are neighbourhoods and which are drinks.
 */
function splitFilters(
  activeFilters: Set<string>,
  bars: Bar[],
  offers: Offer[]
): { neighbourhoodFilters: Set<string>; drinkFilters: Set<string> } {
  const allNeighbourhoods = new Set<string>();
  bars.forEach((b) => {
    if (b.neighborhood) allNeighbourhoods.add(b.neighborhood.trim());
  });

  const neighbourhoodFilters = new Set<string>();
  const drinkFilters = new Set<string>();

  activeFilters.forEach((f) => {
    if (allNeighbourhoods.has(f)) {
      neighbourhoodFilters.add(f);
    } else {
      drinkFilters.add(f);
    }
  });

  return { neighbourhoodFilters, drinkFilters };
}

/**
 * Filter bars based on selected filters.
 * Logic:
 * - If only neighbourhood selected: bar must be in that neighbourhood
 * - If only drink selected: bar must have an offer with that drink
 * - If both selected: bar must match neighbourhood AND have matching drink
 * - If nothing matches, show nothing.
 */
export function filterBars(
  bars: Bar[],
  offers: Offer[],
  activeFilters: Set<string>
): Bar[] {
  if (activeFilters.size === 0) return bars;

  const { neighbourhoodFilters, drinkFilters } = splitFilters(activeFilters, bars, offers);

  // Build drink lookup: bar_id -> set of drinks
  const barDrinks = new Map<number, Set<string>>();
  offers.forEach((offer) => {
    const parsed = parseDrinksArray((offer as any).drinks);
    if (parsed.length > 0) {
      const existing = barDrinks.get(offer.bar_id) || new Set();
      parsed.forEach((d) => existing.add(d));
      barDrinks.set(offer.bar_id, existing);
    }
  });

  return bars.filter((bar) => {
    const neighbourhoodMatch =
      neighbourhoodFilters.size === 0 ||
      (bar.neighborhood && neighbourhoodFilters.has(bar.neighborhood.trim()));

    const drinkMatch =
      drinkFilters.size === 0 ||
      (barDrinks.get(bar.id) && Array.from(drinkFilters).some((d) => barDrinks.get(bar.id)!.has(d)));

    // AND logic: must pass both active filter types
    return neighbourhoodMatch && drinkMatch;
  });
}

/**
 * Filter offers based on selected filters.
 * Same AND logic as filterBars.
 */
export function filterOffers(
  offers: Offer[],
  bars: Bar[],
  activeFilters: Set<string>
): Offer[] {
  if (activeFilters.size === 0) return offers;

  const { neighbourhoodFilters, drinkFilters } = splitFilters(activeFilters, bars, offers);

  const barNeighbourhoods = new Map<number, string>();
  bars.forEach((b) => {
    if (b.neighborhood) barNeighbourhoods.set(b.id, b.neighborhood.trim());
  });

  return offers.filter((offer) => {
    const neighbourhood = barNeighbourhoods.get(offer.bar_id);
    const neighbourhoodMatch =
      neighbourhoodFilters.size === 0 ||
      (neighbourhood ? neighbourhoodFilters.has(neighbourhood) : false);

    const parsed = parseDrinksArray((offer as any).drinks);
    const drinkMatch =
      drinkFilters.size === 0 ||
      parsed.some((d) => drinkFilters.has(d));

    return neighbourhoodMatch && drinkMatch;
  });
}
