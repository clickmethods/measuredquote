import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Move, RotateCcw, Square } from "lucide-react";

type Pt = { x: number; y: number };

type Props = {
  mode: "polygon" | "polyline";
  /** Target measurement in feet (sqft or linear ft) — used to scale the drawn shape. */
  target: number;
  unit: "sqft" | "lf";
  /** Address typed by user, displayed as a pseudo-marker label. */
  address?: string;
  /** Number of vertices for the auto-generated polygon. */
  edges?: number;
  className?: string;
  /** Whether to display measurement overlay text. */
  showMeasurement?: boolean;
  /** Visual seed — different shapes for variety. */
  seed?: number;
};

/**
 * Stylized "satellite" map. No external APIs. Renders a procedural
 * land/turf gradient with a grid, a property pin, and an animated
 * polygon/polyline measurement matching the user's selected size.
 */
export function SatelliteMap({
  mode,
  target,
  unit,
  address,
  edges = 5,
  className,
  showMeasurement = true,
  seed = 1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 360 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      const r = ref.current!.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const cx = dims.w / 2;
  const cy = dims.h / 2;

  const points: Pt[] = useMemo(() => {
    if (mode === "polyline") {
      // L-shape style polyline scaled by target length
      const baseLen = Math.min(dims.w, dims.h) * 0.7;
      const startX = cx - baseLen / 2;
      const startY = cy + baseLen / 4;
      const corner = { x: cx - baseLen / 8, y: cy - baseLen / 6 };
      const endX = cx + baseLen / 2;
      const endY = cy - baseLen / 6;
      return [
        { x: startX, y: startY },
        corner,
        { x: endX, y: endY },
      ];
    }
    // Polygon: irregular n-gon scaled so visual area roughly tracks `target` sqft.
    // We don't claim true accuracy — just a coherent visual.
    const baseR = Math.min(dims.w, dims.h) * 0.32;
    const scale = Math.min(1.0, 0.5 + Math.log10(Math.max(target, 1)) / 5);
    const r = baseR * scale;
    const pts: Pt[] = [];
    for (let i = 0; i < edges; i++) {
      const a = (i / edges) * Math.PI * 2 - Math.PI / 2;
      const wobble = 0.85 + ((Math.sin(i * 1.7 + seed) + 1) / 2) * 0.3;
      pts.push({
        x: cx + Math.cos(a) * r * wobble,
        y: cy + Math.sin(a) * r * wobble * 0.78,
      });
    }
    return pts;
  }, [mode, dims, edges, target, seed, cx, cy]);

  const polyD = useMemo(() => {
    if (points.length === 0) return "";
    const head = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    const tail = points.slice(1).map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return mode === "polygon" ? `${head} ${tail} Z` : `${head} ${tail}`;
  }, [points, mode]);

  return (
    <div
      ref={ref}
      className={"relative overflow-hidden rounded-xl border border-border " + (className ?? "")}
      data-testid="map-canvas"
    >
      {/* Procedural satellite background */}
      <div className="absolute inset-0 satellite-bg" />
      {/* Roads (subtle) */}
      <svg className="absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${dims.w} ${dims.h}`} preserveAspectRatio="none">
        <defs>
          <pattern id="lm-road" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(8)">
            <rect width="14" height="14" fill="transparent" />
            <rect x="0" y="6" width="8" height="2" fill="rgba(255,255,255,0.7)" />
          </pattern>
        </defs>
        <rect x={-40} y={dims.h * 0.85} width={dims.w + 80} height={18} fill="hsl(0 0% 16% / 0.55)" />
        <rect x={-40} y={dims.h * 0.85 + 8} width={dims.w + 80} height={2} fill="url(#lm-road)" />
        <rect x={dims.w * 0.15} y={-40} width={14} height={dims.h + 80} fill="hsl(0 0% 16% / 0.5)" />

        {/* Houses / footprints — vague rectangles */}
        <g opacity={0.55}>
          <rect x={cx - 130} y={cy - 90} width={62} height={48} rx="3" fill="rgba(150,130,110,0.65)" />
          <rect x={cx + 80} y={cy + 30} width={58} height={42} rx="3" fill="rgba(150,130,110,0.6)" />
          <rect x={cx - 60} y={cy + 70} width={48} height={36} rx="3" fill="rgba(150,130,110,0.6)" />
        </g>

        {/* User polygon/polyline */}
        <g>
          {mode === "polygon" ? (
            <path
              d={polyD}
              fill="hsl(84 70% 50% / 0.18)"
              stroke="hsl(84 70% 55%)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              className="draw-line"
              data-testid="map-polygon"
            />
          ) : (
            <path
              d={polyD}
              fill="none"
              stroke="hsl(84 70% 55%)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="draw-line"
              data-testid="map-polyline"
            />
          )}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={6} fill="hsl(84 70% 55%)" stroke="white" strokeWidth={1.5} />
            </g>
          ))}
        </g>

        {/* Center pin for address */}
        <g transform={`translate(${cx},${cy})`}>
          <circle r={10} fill="hsl(84 70% 55%)" opacity={0.25} className="pulse-dot" />
          <circle r={5} fill="hsl(84 70% 55%)" />
        </g>
      </svg>

      {/* Address label */}
      {address && (
        <div className="absolute top-3 left-3 right-3 max-w-md">
          <div className="bg-foreground/85 text-background backdrop-blur px-3 py-2 rounded-md text-xs font-mono flex items-center gap-2 shadow-lg">
            <Crosshair className="h-3.5 w-3.5 text-accent" />
            <span className="truncate" data-testid="text-map-address">{address}</span>
          </div>
        </div>
      )}

      {/* Measurement chip */}
      {showMeasurement && (
        <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground rounded-md px-3 py-2 shadow-lg flex items-center gap-2">
          {mode === "polygon" ? <Square className="h-4 w-4" /> : <Move className="h-4 w-4" />}
          <span className="font-mono text-sm font-semibold" data-testid="text-map-measurement">
            {Math.round(target).toLocaleString()} {unit === "sqft" ? "sq ft" : "linear ft"}
          </span>
        </div>
      )}

      {/* Map controls (decorative) */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 bg-foreground/80 backdrop-blur rounded-md p-1">
        <button type="button" className="text-background hover:bg-foreground/40 p-1.5 rounded text-xs font-mono" aria-label="Reset map">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom-right scale indicator */}
      <div className="absolute bottom-3 right-3 bg-foreground/75 text-background text-[10px] font-mono px-2 py-1 rounded backdrop-blur">
        Satellite • simulated
      </div>
    </div>
  );
}
