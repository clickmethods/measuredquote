import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted-foreground max-w-md">
            MeasuredQuote is a prototype white-label estimator concept. Pricing in demos is illustrative;
            real tenants configure their own rates, markup, and regional multipliers.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span className="font-mono">v0.1 demo build</span>
          <span>© MeasuredQuote</span>
        </div>
      </div>
    </footer>
  );
}
