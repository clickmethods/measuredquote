type Props = { size?: number; className?: string; mono?: boolean };

export function LogoMark({ size = 28, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MeasuredQuote"
      className={className}
    >
      {/* Tick/measure inside a rounded rect — measurement + lead funnel */}
      <rect x="2" y="2" width="28" height="28" rx="7" className="fill-foreground" />
      <path
        d="M8 22 L14 16 L18 20 L24 10"
        className="stroke-accent"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="10" r="2" className="fill-accent" />
    </svg>
  );
}

export function Logo({ size = 28, className, mono }: Props) {
  return (
    <div className={"flex items-center gap-2 " + (className ?? "")}>
      <LogoMark size={size} />
      <span className={"font-display text-base tracking-tight " + (mono ? "" : "text-foreground")}>
        Measured<span className="text-foreground/60">Quote</span>
      </span>
    </div>
  );
}
