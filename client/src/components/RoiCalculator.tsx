import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight, ShieldCheck } from "lucide-react";

const PLANS = [
  { name: "Solo", price: 89, max: 50 },
  { name: "Studio", price: 199, max: Infinity },
  { name: "Multi-Brand", price: 449, max: Infinity },
];

export function RoiCalculator() {
  const [adminHours, setAdminHours] = useState(8); // hours per week on quoting/lead admin
  const [closeLift, setCloseLift] = useState(15); // percentage points lift in close rate (vs ad-hoc form)
  const [jobValue, setJobValue] = useState(7500);
  const [monthlyVisitors, setMonthlyVisitors] = useState(900);

  const r = useMemo(() => {
    // Baseline assumptions
    const widgetStartRate = 0.13; // 13% of visitors start the estimator
    const completionRate = 0.42; // 42% complete to lead form
    const closeRate = 0.18 + closeLift / 100;
    const hourlyValue = 65; // contractor admin time value
    const weeksPerMonth = 4.345;

    const starts = monthlyVisitors * widgetStartRate;
    const leads = Math.round(starts * completionRate);
    const pipelineValue = leads * jobValue;
    const bookedJobs = Math.round(leads * closeRate);
    const newRevenue = bookedJobs * jobValue;
    const monthlyAdminHoursSaved = adminHours * weeksPerMonth * 0.7; // 70% of admin time reclaimed
    const timeSavingsValue = monthlyAdminHoursSaved * hourlyValue;

    // Recommended plan
    let recommendedPlan = PLANS[0];
    for (const p of PLANS) {
      if (leads <= p.max) {
        recommendedPlan = p;
        break;
      }
    }
    if (leads > 50) recommendedPlan = PLANS[1];
    if (leads > 500 || monthlyVisitors > 5000) recommendedPlan = PLANS[2];

    const monthlyCost = recommendedPlan.price;
    const totalMonthlyValue = newRevenue * 0.35 /* est. margin */ + timeSavingsValue; // contribution
    const payback = monthlyCost / (totalMonthlyValue / 30); // days
    const roi = Math.round((totalMonthlyValue / monthlyCost) * 10) / 10;

    return {
      starts: Math.round(starts),
      leads,
      pipelineValue,
      bookedJobs,
      newRevenue,
      monthlyAdminHoursSaved: Math.round(monthlyAdminHoursSaved),
      timeSavingsValue: Math.round(timeSavingsValue),
      recommendedPlan,
      payback: Math.max(1, Math.round(payback)),
      roi,
      totalMonthlyValue: Math.round(totalMonthlyValue),
    };
  }, [adminHours, closeLift, jobValue, monthlyVisitors]);

  return (
    <section id="roi" className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
            <Calculator className="h-3 w-3 mr-1.5" /> Live ROI calculator
          </Badge>
          <h2 className="font-display text-3xl mt-4 text-foreground">What does this look like in your business?</h2>
          <p className="text-muted-foreground mt-3">
            Drag the sliders. We'll estimate the booked jobs, time saved, and payback for your contractor — using
            the same conversion benchmarks we see across active MeasuredQuote tenants.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Inputs */}
          <Card className="p-5 border-border bg-card">
            <h3 className="font-display text-lg">Your inputs</h3>
            <div className="mt-5 space-y-6">
              <RoiSlider
                label="Hours/week spent on quoting & lead admin"
                value={adminHours}
                onChange={setAdminHours}
                min={1}
                max={30}
                step={1}
                format={(v) => `${v} hr/wk`}
                testid="slider-admin-hours"
              />
              <RoiSlider
                label="Close-rate lift vs. plain contact form"
                value={closeLift}
                onChange={setCloseLift}
                min={0}
                max={35}
                step={1}
                format={(v) => `+${v} pp`}
                testid="slider-close-lift"
              />
              <RoiSlider
                label="Average job value"
                value={jobValue}
                onChange={setJobValue}
                min={1500}
                max={40000}
                step={500}
                format={(v) => `$${v.toLocaleString()}`}
                testid="slider-job-value"
              />
              <RoiSlider
                label="Monthly website visitors"
                value={monthlyVisitors}
                onChange={setMonthlyVisitors}
                min={200}
                max={10000}
                step={50}
                format={(v) => `${v.toLocaleString()} / mo`}
                testid="slider-visitors"
              />
            </div>

            <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-accent shrink-0" />
              Benchmarks: ~13% of visitors start the estimator, ~42% complete the lead form, contractors recover ~70% of quoting admin time.
            </div>
          </Card>

          {/* Outputs */}
          <div className="space-y-5">
            <Card className="p-6 border-accent/40 bg-accent/10 relative overflow-hidden">
              <div className="text-xs uppercase font-mono tracking-wider text-foreground/70">Projected monthly impact</div>
              <div className="font-display text-4xl text-foreground mt-2 tabular-nums" data-testid="roi-revenue">
                ${r.newRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-foreground/80 mt-1">
                new booked revenue from <strong>{r.bookedJobs} jobs</strong> across <strong>{r.leads} measured leads</strong>.
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <OutputCard
                  icon={<Clock className="h-4 w-4" />}
                  label="Time saved"
                  value={`${r.monthlyAdminHoursSaved} hr/mo`}
                  sub={`$${r.timeSavingsValue.toLocaleString()} in reclaimed admin`}
                  testid="output-time"
                />
                <OutputCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Monthly pipeline"
                  value={`$${(r.pipelineValue / 1000).toFixed(0)}K`}
                  sub={`${r.leads} estimates created`}
                  testid="output-pipeline"
                />
                <OutputCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="ROI multiple"
                  value={`${r.roi}×`}
                  sub={`vs. ${r.recommendedPlan.name} plan @ $${r.recommendedPlan.price}/mo`}
                  testid="output-roi"
                />
                <OutputCard
                  icon={<Calculator className="h-4 w-4" />}
                  label="Payback period"
                  value={`${r.payback} day${r.payback === 1 ? "" : "s"}`}
                  sub={`Net value ~$${r.totalMonthlyValue.toLocaleString()}/mo`}
                  testid="output-payback"
                />
              </div>
            </Card>

            <Card className="p-5 border-border bg-card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Recommended plan</div>
                  <div className="font-display text-2xl text-foreground mt-1" data-testid="roi-plan">{r.recommendedPlan.name} · ${r.recommendedPlan.price}/mo</div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Based on {r.leads} expected monthly leads and {monthlyVisitors.toLocaleString()} site visitors.
                    {r.recommendedPlan.name === "Multi-Brand" && " You're at agency / franchise volume — talk to us."}
                  </p>
                </div>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/demo" data-testid="button-roi-cta">
                    Start free trial <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoiSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  testid,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  testid: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="font-mono text-sm text-foreground tabular-nums">{format(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        data-testid={testid}
      />
    </div>
  );
}

function OutputCard({ icon, label, value, sub, testid }: { icon: React.ReactNode; label: string; value: string; sub: string; testid: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3" data-testid={testid}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
        <span className="text-foreground/70">{icon}</span>
      </div>
      <div className="font-display text-xl text-foreground mt-1 tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{sub}</div>
    </div>
  );
}
