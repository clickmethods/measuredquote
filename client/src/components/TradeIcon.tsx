import type { Trade } from "@/lib/trades";

type Props = { trade: Trade["id"]; className?: string };

export function TradeIcon({ trade, className }: Props) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (trade) {
    case "concrete":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <rect x="3" y="6" width="18" height="12" rx="1" />
          <path d="M3 10h18M3 14h18M9 6v12M15 6v12" />
        </svg>
      );
    case "asphalt":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M4 18 L20 6" />
          <path d="M7 18 L15 8" strokeDasharray="2 2" />
          <path d="M4 20 L20 20" />
        </svg>
      );
    case "landscape":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M3 19c2-3 4-3 6 0M9 19c2-3 4-3 6 0M15 19c2-3 4-3 6 0" />
          <path d="M7 12l2-3 2 3M14 14l2-4 2 4" />
        </svg>
      );
    case "decks":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <rect x="3" y="9" width="18" height="9" rx="0.5" />
          <path d="M3 12h18M3 15h18M3 18v3M21 18v3" />
        </svg>
      );
    case "roofing":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M3 13 L12 5 L21 13" />
          <path d="M5 13v7h14v-7" />
          <path d="M9 20v-5h6v5" />
        </svg>
      );
    case "fencing":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <path d="M5 21V8l2-3 2 3v13M11 21V8l2-3 2 3v13M17 21V8l2-3 2 3v13" />
          <path d="M3 12h18M3 16h18" />
        </svg>
      );
  }
}
