import { useEffect, useRef, useState } from "react";
import { AlertTriangle, MapPin, Move, Square } from "lucide-react";
import { useGoogleMaps } from "@/lib/googleMaps";
import { SatelliteMap } from "./SatelliteMap";

type Props = {
  mode: "polygon" | "polyline";
  target: number;
  unit: "sqft" | "lf";
  address?: string;
  location?: { lat: number; lng: number } | null;
  className?: string;
  onMeasured: (value: number, geometry: unknown) => void;
};

export function GoogleMapsMeasure({ mode, target, unit, address, location, className, onMeasured }: Props) {
  const state = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<any>(null);
  const drawingRef = useRef<any>(null);
  const [drawnValue, setDrawnValue] = useState<number | null>(null);

  useEffect(() => {
    if (state !== "ready" || !mapRef.current || !window.google?.maps) return;

    const center = location ?? { lat: 39.7392, lng: -104.9903 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: location ? 20 : 17,
      mapTypeId: "satellite",
      tilt: 0,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      clickableIcons: false,
    });

    new window.google.maps.Marker({
      position: center,
      map,
      title: address || "Project address",
    });

    const overlayType =
      mode === "polygon"
        ? window.google.maps.drawing.OverlayType.POLYGON
        : window.google.maps.drawing.OverlayType.POLYLINE;

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: overlayType,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [overlayType],
      },
      polygonOptions: {
        fillColor: "#a3e635",
        fillOpacity: 0.22,
        strokeColor: "#bef264",
        strokeWeight: 3,
        editable: true,
        draggable: true,
      },
      polylineOptions: {
        strokeColor: "#bef264",
        strokeWeight: 4,
        editable: true,
        draggable: true,
      },
    });

    drawingManager.setMap(map);
    drawingRef.current = drawingManager;

    const updateFromOverlay = (overlay: any) => {
      const path = overlay.getPath();
      if (mode === "polygon") {
        const sqm = window.google.maps.geometry.spherical.computeArea(path);
        const sqft = sqm * 10.7639;
        setDrawnValue(sqft);
        onMeasured(Math.round(sqft), pathToJson(path));
      } else {
        const meters = window.google.maps.geometry.spherical.computeLength(path);
        const feet = meters * 3.28084;
        setDrawnValue(feet);
        onMeasured(Math.round(feet), pathToJson(path));
      }
    };

    const listener = window.google.maps.event.addListener(drawingManager, "overlaycomplete", (event: any) => {
      if (overlayRef.current) overlayRef.current.setMap(null);
      overlayRef.current = event.overlay;
      drawingManager.setDrawingMode(null);
      updateFromOverlay(event.overlay);
      event.overlay.getPath().addListener("set_at", () => updateFromOverlay(event.overlay));
      event.overlay.getPath().addListener("insert_at", () => updateFromOverlay(event.overlay));
    });

    return () => {
      window.google.maps.event.removeListener(listener);
      if (overlayRef.current) overlayRef.current.setMap(null);
      if (drawingRef.current) drawingRef.current.setMap(null);
    };
  }, [state, location?.lat, location?.lng, mode, address, onMeasured]);

  if (state === "missing-key" || state === "error") {
    return (
      <div className="relative">
        <SatelliteMap mode={mode} target={target} unit={unit} address={address} className={className} />
        <div className="absolute top-3 right-3 bg-foreground/85 text-background rounded-md px-3 py-2 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-accent" />
          {state === "missing-key" ? "Live Maps key not configured" : "Live Maps unavailable"}
        </div>
      </div>
    );
  }

  return (
    <div className={"relative overflow-hidden rounded-xl border border-border bg-secondary " + (className ?? "")} data-testid="google-map-canvas">
      <div ref={mapRef} className="absolute inset-0" />
      {(state === "idle" || state === "loading") && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground text-sm">
          Loading live satellite map…
        </div>
      )}
      <div className="absolute top-3 left-3 right-3 max-w-md">
        <div className="bg-foreground/85 text-background backdrop-blur px-3 py-2 rounded-md text-xs font-mono flex items-center gap-2 shadow-lg">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          <span className="truncate">{address || "Project address"}</span>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground rounded-md px-3 py-2 shadow-lg flex items-center gap-2">
        {mode === "polygon" ? <Square className="h-4 w-4" /> : <Move className="h-4 w-4" />}
        <span className="font-mono text-sm font-semibold" data-testid="text-live-map-measurement">
          {Math.round(drawnValue ?? target).toLocaleString()} {unit === "sqft" ? "sq ft" : "linear ft"}
        </span>
      </div>
      <div className="absolute bottom-3 right-3 bg-foreground/75 text-background text-[10px] font-mono px-2 py-1 rounded backdrop-blur">
        Google Maps • draw {mode === "polygon" ? "area" : "line"}
      </div>
    </div>
  );
}

function pathToJson(path: any) {
  const points = [];
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    points.push({ lat: point.lat(), lng: point.lng() });
  }
  return points;
}
