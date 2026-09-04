// MapTiler configuration for basemap tiles.
// The key is a client-side tile key protected by MapTiler usage limits.
// If you later host the web build on a public domain, add that domain to the
// key's "Allowed HTTP Origins" in the MapTiler dashboard.
export const MAPTILER_KEY = 'LO7TVjclAMUV3kOly98g';

// Chosen style: "Dataviz Light" — a clean, lightly-coloured basemap close to
// the original Voyager look. Other clean options: 'positron', 'voyager', 'streets-v2'.
const STYLE = 'dataviz';

// Raster XYZ tile template (256px) used by both Leaflet (web) and react-native-maps UrlTile (Android).
export const MAPTILER_TILE_URL = `https://api.maptiler.com/maps/${STYLE}/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;

export const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
