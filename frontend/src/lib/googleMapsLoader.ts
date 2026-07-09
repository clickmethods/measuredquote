// ═══════════════════════════════════════════════════════════════
// Shared Google Maps Loader — loads once, shares across app
// ═══════════════════════════════════════════════════════════════

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;
if (!MAPS_API_KEY) {
  console.error('[MeasuredQuote] VITE_MAPS_API_KEY is not set — maps will fail to load.');
}

let loadPromise: Promise<typeof google.maps> | null = null;
let scriptLoaded = false;

/**
 * Load Google Maps JavaScript API with all required libraries.
 * This is a SINGLETON — calling it multiple times returns the same promise.
 *
 * Libraries loaded: places, geometry (drawing lib removed in Maps v3.65)
 * All included in one load to prevent conflicts.
 */
export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (loadPromise) return loadPromise;

  // Already loaded?
  if (typeof window !== 'undefined' && window.google?.maps) {
    loadPromise = Promise.resolve(window.google.maps);
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Global callback that Google Maps calls when ready
    const callbackName = '__drawToQuoteMapsCb_' + Date.now();
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      if (window.google?.maps) {
        scriptLoaded = true;
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps callback fired but maps object not found'));
      }
    };

    const script = document.createElement('script');
    // Load: Maps JS API + Places library + Drawing library + Geometry library
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script. Check your API key and network connection.'));
    };

    // Safety timeout — if callback never fires
    const timeout = setTimeout(() => {
      if (!scriptLoaded) {
        reject(new Error('Google Maps load timeout (15s). Check API key, billing, and library settings.'));
      }
    }, 15000);

    // If promise resolves, clear timeout
    loadPromise?.then(() => clearTimeout(timeout)).catch(() => clearTimeout(timeout));

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Check if Google Maps is already loaded and available.
 */
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.google?.maps;
}

/**
 * Get the google.maps object synchronously (only if already loaded).
 */
export function getGoogleMaps(): typeof google.maps | null {
  if (typeof window !== 'undefined' && window.google?.maps) {
    return window.google.maps;
  }
  return null;
}
