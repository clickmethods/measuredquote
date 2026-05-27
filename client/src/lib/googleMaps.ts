import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const SCRIPT_ID = "measuredquote-google-maps-js";

type LoadState = "idle" | "loading" | "ready" | "error" | "missing-key";

declare global {
  interface Window {
    google?: any;
  }
}

export function hasGoogleMapsKey() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

export function useGoogleMaps() {
  const [state, setState] = useState<LoadState>(() => {
    if (!GOOGLE_MAPS_API_KEY) return "missing-key";
    if (typeof window !== "undefined" && window.google?.maps) return "ready";
    return "idle";
  });

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setState("missing-key");
      return;
    }

    if (window.google?.maps) {
      setState("ready");
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      setState("loading");
      existing.addEventListener("load", () => setState("ready"), { once: true });
      existing.addEventListener("error", () => setState("error"), { once: true });
      return;
    }

    setState("loading");
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&loading=async`;
    script.onload = () => setState("ready");
    script.onerror = () => setState("error");
    document.head.appendChild(script);
  }, []);

  return state;
}
