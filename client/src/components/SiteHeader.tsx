import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [loc] = useLocation();
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="MeasuredQuote home" data-testid="link-home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <NavLink href="/demo" current={loc.startsWith("/demo")} testid="link-nav-demo">Live demos</NavLink>
          <NavLink href="/dashboard" current={loc.startsWith("/dashboard")} testid="link-nav-dashboard">Dashboard</NavLink>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md hover-elevate text-muted-foreground hover:text-foreground"
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            data-testid="link-nav-pricing"
          >
            Pricing
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/demo" data-testid="button-header-try">Try the demo</Link>
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 border border-accent-border" asChild>
            <Link href="/dashboard" data-testid="button-header-dashboard">View lead dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, current, children, testid }: { href: string; current: boolean; children: React.ReactNode; testid: string }) {
  return (
    <Link
      href={href}
      data-testid={testid}
      className={
        "px-3 py-1.5 rounded-md hover-elevate " + (current ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </Link>
  );
}
