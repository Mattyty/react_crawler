const COCKTAIL_IMAGES = [
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails2.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails3.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails4.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails5.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails6.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/cocktails7.jpg',
];

const BEER_WINE_IMAGES = [
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/wine&beer.jpg',
];

const DRINKS_IMAGES = [
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks2.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks3.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks4.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks5.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks6.jpg',
  'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/drinks7.jpg',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns the bar's image_url if available, otherwise picks a fallback
 * based on the drinks array from the associated offer.
 *
 * @param imageUrl - The bar's image_url (may be null/undefined)
 * @param drinks - The drinks array from the offer (e.g. ["cocktails"] or ["beer", "wine", "cocktails"])
 * @param barId - Used as a seed for consistent picks per bar (so the image doesn't change on re-render)
 */
export function getBarImage(imageUrl: string | null | undefined, drinks?: string[] | string | null, barId?: number): string {
  if (imageUrl) return imageUrl;

  // Normalise drinks - handle Postgres array strings and other formats
  let drinkList: string[] = [];
  if (Array.isArray(drinks)) {
    drinkList = drinks;
  } else if (typeof drinks === 'string') {
    const trimmed = drinks.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      drinkList = trimmed.slice(1, -1).split(',').map((s) => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
    } else if (trimmed) {
      drinkList = [trimmed];
    }
  }

  const normalised = drinkList.map((d) => d.toLowerCase().trim());

  // If only cocktails
  const hasCocktails = normalised.some((d) => d.includes('cocktail'));
  const hasBeer = normalised.some((d) => d.includes('beer'));
  const hasWine = normalised.some((d) => d.includes('wine'));

  // Use barId for a stable "random" pick so it doesn't flicker on re-render
  if (normalised.length === 1 && hasCocktails) {
    const idx = barId != null ? barId % COCKTAIL_IMAGES.length : Math.floor(Math.random() * COCKTAIL_IMAGES.length);
    return COCKTAIL_IMAGES[idx];
  }

  if (normalised.length <= 2 && (hasBeer || hasWine) && !hasCocktails) {
    return BEER_WINE_IMAGES[0];
  }

  // Multiple drink types or anything else -> general drinks images
  const idx = barId != null ? barId % DRINKS_IMAGES.length : Math.floor(Math.random() * DRINKS_IMAGES.length);
  return DRINKS_IMAGES[idx];
}
