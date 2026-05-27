import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronLeft, ChevronRight, Loader2, Ruler, Sparkles, Phone, Mail, CalendarCheck } from "lucide-react";
import { GoogleMapsMeasure } from "./GoogleMapsMeasure";
import { SatelliteMap } from "./SatelliteMap";
import { calculateEstimate, I18N, LANGUAGES, type LanguageCode, type Trade } from "@/lib/trades";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { resetSession, trackEvent } from "@/lib/tracking";

type Step = "start" | "language" | "lead" | "measure" | "options" | "result" | "saved";

type LeadForm = { name: string; email: string; phone: string; address: string; lat?: number; lng?: number };

export function EstimatorWidget({ trade }: { trade: Trade }) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("start");
  const [lang, setLang] = useState<LanguageCode>("en");
  const [lead, setLead] = useState<LeadForm>({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Partial<LeadForm>>({});
  const [measurement, setMeasurement] = useState<number>(trade.defaultMeasurement);
  const [mapGeometry, setMapGeometry] = useState<unknown>(null);
  const [materialId, setMaterialId] = useState<string>(trade.materials[0].id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const t = I18N[lang];

  const estimate = useMemo(
    () => calculateEstimate(trade, measurement, materialId, addonIds),
    [trade, measurement, materialId, addonIds],
  );

  // Fire widget_started once per session/trade mount.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("widget_started", { trade: trade.id, step: "start", language: lang });
  }, [trade.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire estimate_viewed when the result step is reached.
  useEffect(() => {
    if (step === "result") {
      trackEvent("estimate_viewed", {
        trade: trade.id,
        step,
        language: lang,
        metadata: { low: estimate.low, high: estimate.high, material: estimate.material.label },
      });
    }
  }, [step, trade.id, lang, estimate.low, estimate.high, estimate.material.label]);

  function validateLead(): boolean {
    const e: Partial<LeadForm> = {};
    if (!lead.name.trim()) e.name = t.nameRequired;
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) e.email = t.emailInvalid;
    if (lead.phone.replace(/\D/g, "").length < 10) e.phone = t.phoneInvalid;
    if (!lead.address.trim()) e.address = t.addressRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submitLead() {
    setSubmitting(true);
    try {
      const payload = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        language: lang,
        trade: trade.id,
        measurement,
        measurementUnit: trade.unit,
        material: estimate.material.label,
        addonsJson: JSON.stringify(estimate.addons.map((a) => a.label)),
        lowEstimate: estimate.low,
        highEstimate: estimate.high,
        lineItemsJson: JSON.stringify(estimate.lineItems),
        geometryJson: JSON.stringify(mapGeometry ?? null),
        sourceUrl: "demo.measuredquote.com",
        status: "new",
      };
      const res = await apiRequest("POST", "/api/leads", payload);
      const created = await res.json();
      setSavedId(created.id);
      await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      trackEvent("lead_submitted", {
        trade: trade.id,
        step: "saved",
        language: lang,
        metadata: { leadId: created.id, low: estimate.low, high: estimate.high },
      });
      setStep("saved");
    } catch (err: any) {
      toast({ title: "Could not save lead", description: err?.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    resetSession();
    startedRef.current = false;
    setStep("start");
    setLead({ name: "", email: "", phone: "", address: "" });
    setMaterialId(trade.materials[0].id);
    setAddonIds([]);
    setMeasurement(trade.defaultMeasurement);
    setMapGeometry(null);
    setSavedId(null);
  }

  return (
    <Card className="overflow-hidden border-border bg-card shadow-xl">
      <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent pulse-dot" />
          <span className="font-mono text-xs uppercase tracking-wider text-background/80">
            MeasuredQuote • {trade.name}
          </span>
        </div>
        <StepIndicator step={step} />
      </div>

      <div className="p-5 sm:p-6 min-h-[520px]">
        {step === "start" && <StartScreen trade={trade} t={t} onStart={() => setStep("language")} />}
        {step === "language" && (
          <LanguageScreen
            t={t}
            current={lang}
            onPick={(c) => {
              setLang(c);
              trackEvent("language_selected", { trade: trade.id, step: "language", language: c });
              setStep("lead");
            }}
            onBack={() => setStep("start")}
          />
        )}
        {step === "lead" && (
          <LeadScreen
            t={t}
            lead={lead}
            errors={errors}
            onChange={(p) => setLead({ ...lead, ...p })}
            onBack={() => setStep("language")}
            onNext={() => {
              if (validateLead()) {
                trackEvent("lead_form_completed", { trade: trade.id, step: "lead", language: lang });
                setStep("measure");
              }
            }}
          />
        )}
        {step === "measure" && (
          <MeasureScreen
            trade={trade}
            t={t}
            address={lead.address}
            location={typeof lead.lat === "number" && typeof lead.lng === "number" ? { lat: lead.lat, lng: lead.lng } : null}
            measurement={measurement}
            setMeasurement={setMeasurement}
            setMapGeometry={setMapGeometry}
            onBack={() => setStep("lead")}
            onNext={() => {
              trackEvent("measurement_completed", {
                trade: trade.id,
                step: "measure",
                language: lang,
                metadata: { measurement, unit: trade.unit },
              });
              setStep("options");
            }}
          />
        )}
        {step === "options" && (
          <OptionsScreen
            trade={trade}
            t={t}
            measurement={measurement}
            materialId={materialId}
            setMaterialId={setMaterialId}
            addonIds={addonIds}
            setAddonIds={setAddonIds}
            onBack={() => setStep("measure")}
            onNext={() => {
              trackEvent("options_completed", {
                trade: trade.id,
                step: "options",
                language: lang,
                metadata: { materialId, addonIds },
              });
              setStep("result");
            }}
          />
        )}
        {step === "result" && (
          <ResultScreen
            trade={trade}
            t={t}
            estimate={estimate}
            address={lead.address}
            onBack={() => setStep("options")}
            onConfirm={submitLead}
            submitting={submitting}
          />
        )}
        {step === "saved" && (
          <SavedScreen t={t} estimate={estimate} lead={lead} trade={trade} savedId={savedId} onReset={reset} />
        )}
      </div>
    </Card>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ["start", "language", "lead", "measure", "options", "result", "saved"];
  const idx = order.indexOf(step);
  const total = order.length - 1;
  return (
    <div className="flex items-center gap-1.5">
      {order.slice(1).map((_, i) => (
        <div
          key={i}
          className={"h-1 w-5 rounded-full transition-colors " + (i < idx ? "bg-accent" : "bg-background/20")}
        />
      ))}
      <span className="ml-2 font-mono text-[10px] text-background/60">
        {Math.min(idx, total)}/{total}
      </span>
    </div>
  );
}

/* ---------- Step screens ---------- */

function StartScreen({ trade, t, onStart }: { trade: Trade; t: Record<string, string>; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge variant="outline" className="mb-3 border-accent/40 text-accent-foreground bg-accent/10 font-mono uppercase tracking-wider text-[10px]">
          {trade.name}
        </Badge>
        <h2 className="font-display text-2xl text-foreground">{t.welcome}</h2>
        <p className="text-muted-foreground mt-2 max-w-md">{t.subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat number="60s" label={t.statTime} />
        <Stat number="4-lang" label={t.statLangs} />
        <Stat number="±10%" label={t.statAccuracy} />
      </div>
      <Button
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 self-start"
        onClick={onStart}
        data-testid="button-widget-start"
      >
        <Sparkles className="mr-2 h-4 w-4" /> {t.start}
      </Button>
      <p className="text-xs text-muted-foreground">{t.startDisclaimer}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-secondary/40">
      <div className="font-display text-xl text-foreground">{number}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function LanguageScreen({
  t,
  current,
  onPick,
  onBack,
}: {
  t: Record<string, string>;
  current: LanguageCode;
  onPick: (c: LanguageCode) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-display text-xl">{t.pickLanguage}</h3>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            data-testid={`button-language-${l.code}`}
            onClick={() => onPick(l.code)}
            className={
              "flex items-center gap-3 border rounded-lg p-4 text-left hover-elevate active-elevate-2 " +
              (current === l.code
                ? "border-accent bg-accent/10 ring-1 ring-accent"
                : "border-border bg-card")
            }
          >
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1">
              <div className="font-medium text-foreground">{l.label}</div>
              <div className="text-xs text-muted-foreground uppercase font-mono">{l.code}</div>
            </div>
            {current === l.code && <Check className="h-4 w-4 text-accent" />}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <Button variant="ghost" onClick={onBack} data-testid="button-language-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t.back}
        </Button>
      </div>
    </div>
  );
}

function LeadScreen({
  t,
  lead,
  errors,
  onChange,
  onBack,
  onNext,
}: {
  t: Record<string, string>;
  lead: LeadForm;
  errors: Partial<LeadForm>;
  onChange: (p: Partial<LeadForm>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-xl">{t.yourDetails}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t.yourDetailsHelp}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t.fullName} error={errors.name}>
          <Input
            value={lead.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Maria Lopez"
            data-testid="input-lead-name"
          />
        </Field>
        <Field label={t.email} error={errors.email}>
          <Input
            type="email"
            value={lead.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@email.com"
            data-testid="input-lead-email"
          />
        </Field>
        <Field label={t.phone} error={errors.phone}>
          <Input
            value={lead.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(555) 123-4567"
            data-testid="input-lead-phone"
          />
        </Field>
        <Field label={t.address} error={errors.address}>
          <AddressAutocomplete
            value={lead.address}
            onChange={(patch) => onChange(patch)}
          />
        </Field>
      </div>
      <div className="flex justify-between mt-2">
        <Button variant="ghost" onClick={onBack} data-testid="button-lead-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t.back}
        </Button>
        <Button onClick={onNext} className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-lead-continue">
          {t.continue} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground font-mono">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive" data-testid={`text-error-${label}`}>{error}</p>}
    </div>
  );
}

function AddressAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (p: Partial<LeadForm>) => void;
}) {
  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => onChange({ address: e.target.value, lat: undefined, lng: undefined })}
        placeholder="1234 Maple St, Your City"
        autoComplete="street-address"
        data-testid="input-lead-address"
      />
      <p className="text-[11px] text-muted-foreground">
        Type the project address. Live Google autocomplete can be enabled after the Maps key is restricted to your domain.
      </p>
    </div>
  );
}

function MeasureScreen({
  trade,
  t,
  address,
  location,
  measurement,
  setMeasurement,
  setMapGeometry,
  onBack,
  onNext,
}: {
  trade: Trade;
  t: Record<string, string>;
  address: string;
  location: { lat: number; lng: number } | null;
  measurement: number;
  setMeasurement: (v: number) => void;
  setMapGeometry: (v: unknown) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [liveMapEnabled, setLiveMapEnabled] = useState(false);
  const handleMeasured = useCallback(
    (value: number, geometry: unknown) => {
      setMeasurement(value);
      setMapGeometry(geometry);
    },
    [setMeasurement, setMapGeometry],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl">
            {trade.unit === "lf" ? t.measureTitleLinear : t.measureTitle}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {trade.unit === "lf" ? t.measureHelpLinear : t.measureHelp}
          </p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs whitespace-nowrap">
          <Ruler className="h-3 w-3 mr-1" />
          {Math.round(measurement).toLocaleString()} {trade.unitLabel}
        </Badge>
      </div>
      {liveMapEnabled ? (
        <GoogleMapsMeasure
          mode={trade.unit === "lf" ? "polyline" : "polygon"}
          target={measurement}
          unit={trade.unit}
          address={address}
          location={location}
          onMeasured={handleMeasured}
          className="h-72 sm:h-80"
        />
      ) : (
        <SatelliteMap
          mode={trade.unit === "lf" ? "polyline" : "polygon"}
          target={measurement}
          unit={trade.unit}
          address={address}
          seed={trade.id.length}
          className="h-72 sm:h-80"
        />
      )}
      <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {liveMapEnabled ? "Live Google measurement mode" : "Demo-safe simulated measurement mode"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {liveMapEnabled
              ? "Draw on the satellite map to calculate a real measurement."
              : "Use the slider for a reliable sales demo. Enable live Google Maps after API restrictions are configured."}
          </p>
        </div>
        {!liveMapEnabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLiveMapEnabled(true)}
            data-testid="button-enable-live-map"
          >
            Enable live map
          </Button>
        )}
      </div>
      <div className="bg-secondary/40 border border-border rounded-lg p-4">
        <div className="flex justify-between mb-3 items-end">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground font-mono">
            Adjust size
          </Label>
          <span className="font-mono text-sm text-foreground" data-testid="text-measurement-value">
            {Math.round(measurement).toLocaleString()} {trade.unitLabel}
          </span>
        </div>
        <Slider
          min={trade.minMeasurement}
          max={trade.maxMeasurement}
          step={trade.step}
          value={[measurement]}
          onValueChange={(v) => setMeasurement(v[0])}
          data-testid="slider-measurement"
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground mt-2">
          <span>{trade.minMeasurement.toLocaleString()}</span>
          <span>{trade.maxMeasurement.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <Button variant="ghost" onClick={onBack} data-testid="button-measure-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t.back}
        </Button>
        <Button onClick={onNext} className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-measure-continue">
          {t.continue} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function OptionsScreen({
  trade,
  t,
  measurement,
  materialId,
  setMaterialId,
  addonIds,
  setAddonIds,
  onBack,
  onNext,
}: {
  trade: Trade;
  t: Record<string, string>;
  measurement: number;
  materialId: string;
  setMaterialId: (id: string) => void;
  addonIds: string[];
  setAddonIds: (ids: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function toggleAddon(id: string) {
    setAddonIds(addonIds.includes(id) ? addonIds.filter((a) => a !== id) : [...addonIds, id]);
  }
  const liveEstimate = calculateEstimate(trade, measurement, materialId, addonIds);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-xl">{t.chooseMaterial}</h3>
        <p className="text-sm text-muted-foreground mt-1">Tap to compare. Estimate updates live.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {trade.materials.map((m) => {
          const active = materialId === m.id;
          return (
            <button
              type="button"
              key={m.id}
              data-testid={`button-material-${m.id}`}
              onClick={() => setMaterialId(m.id)}
              className={
                "text-left rounded-lg border p-4 hover-elevate active-elevate-2 transition-colors " +
                (active
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border bg-card")
              }
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{m.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  ${m.rate}/{trade.unit === "sqft" ? "sqft" : "lf"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{m.blurb}</p>
            </button>
          );
        })}
      </div>

      <div>
        <h4 className="font-display text-sm uppercase tracking-wide text-muted-foreground mb-2">{t.addOns}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {trade.addons.map((a) => {
            const active = addonIds.includes(a.id);
            const cost = a.type === "flat" ? `$${a.value}` : `$${a.value}/${trade.unit === "sqft" ? "sqft" : "lf"}`;
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => toggleAddon(a.id)}
                data-testid={`button-addon-${a.id}`}
                className={
                  "flex items-start gap-3 rounded-lg border p-3 text-left hover-elevate active-elevate-2 " +
                  (active ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-border bg-card")
                }
              >
                <div
                  className={
                    "h-4 w-4 mt-0.5 rounded border flex items-center justify-center shrink-0 " +
                    (active ? "bg-accent border-accent" : "border-border bg-card")
                  }
                >
                  {active && <Check className="h-3 w-3 text-accent-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground font-medium">{a.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{cost}</span>
                  </div>
                  {a.hint && <p className="text-xs text-muted-foreground mt-0.5">{a.hint}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase font-mono text-accent-foreground/80">Live estimate</div>
          <div className="font-display text-xl text-foreground" data-testid="text-live-estimate">
            ${liveEstimate.low.toLocaleString()} – ${liveEstimate.high.toLocaleString()}
          </div>
        </div>
        <Button onClick={onNext} className="bg-foreground text-background hover:bg-foreground/90" data-testid="button-options-continue">
          {t.seeResults} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} data-testid="button-options-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t.back}
        </Button>
      </div>
    </div>
  );
}

function ResultScreen({
  trade,
  t,
  estimate,
  address,
  onBack,
  onConfirm,
  submitting,
}: {
  trade: Trade;
  t: Record<string, string>;
  estimate: ReturnType<typeof calculateEstimate>;
  address: string;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Badge variant="outline" className="border-accent/40 bg-accent/10 text-foreground font-mono text-[10px]">
          Ballpark range
        </Badge>
        <h3 className="font-display text-2xl mt-2">{t.resultsTitle}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{t.resultsBlurb}</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="bg-foreground text-background p-5">
          <div className="text-xs font-mono uppercase text-background/70 tracking-wider">Total project range</div>
          <div className="font-display text-3xl mt-1" data-testid="text-result-range">
            ${estimate.low.toLocaleString()} <span className="text-background/60 text-xl">–</span> ${estimate.high.toLocaleString()}
          </div>
          <div className="text-xs text-background/70 mt-2 font-mono">
            {estimate.measurement.toLocaleString()} {trade.unitLabel} · {estimate.material.label}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs uppercase font-mono text-muted-foreground mb-3">Line items</div>
          <div className="space-y-2">
            {estimate.lineItems.map((li, i) => (
              <div key={i} className="flex items-center justify-between text-sm" data-testid={`text-line-item-${i}`}>
                <span className="text-foreground/85">{li.label}</span>
                <span className="font-mono text-foreground">${li.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border my-3" />
          <div className="text-[11px] text-muted-foreground">
            Includes {Math.round((1 - 1 / 1.15) * 100)}% standard markup and a ±10% range buffer. Final
            quote requires an on-site visit and is subject to scope, access, and local conditions.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
        <div className="font-mono uppercase mb-2 text-foreground/70">Project address</div>
        <div className="text-foreground/90">{address}</div>
      </div>

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <Button variant="ghost" onClick={onBack} data-testid="button-result-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t.back}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting}
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          data-testid="button-result-confirm"
        >
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
          {t.bookVisit}
        </Button>
      </div>
    </div>
  );
}

function SavedScreen({
  t,
  estimate,
  lead,
  trade,
  savedId,
  onReset,
}: {
  t: Record<string, string>;
  estimate: ReturnType<typeof calculateEstimate>;
  lead: LeadForm;
  trade: Trade;
  savedId: number | null;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
        <Check className="h-6 w-6 text-accent-foreground" />
      </div>
      <div>
        <h3 className="font-display text-2xl">{t.saved}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t.savedBlurb}</p>
      </div>
      <div className="w-full rounded-lg border border-border bg-secondary/40 p-4 space-y-2 text-sm">
        <Row icon={<Mail className="h-4 w-4" />}>{lead.email}</Row>
        <Row icon={<Phone className="h-4 w-4" />}>{lead.phone}</Row>
        <Row icon={<Ruler className="h-4 w-4" />}>
          {Math.round(estimate.measurement).toLocaleString()} {trade.unitLabel} · {estimate.material.label}
        </Row>
        <Row icon={<Sparkles className="h-4 w-4" />}>
          <span className="font-mono">
            ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
          </span>
        </Row>
        {savedId !== null && (
          <div className="text-xs font-mono text-muted-foreground pt-2 border-t border-border" data-testid="text-saved-id">
            Lead #{String(savedId).padStart(4, "0")} created in your contractor inbox
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset} data-testid="button-saved-restart">
          {t.startAnother}
        </Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          asChild
          onClick={() =>
            trackEvent("lead_booked", {
              trade: trade.id,
              step: "saved",
              metadata: { leadId: savedId },
            })
          }
        >
          <Link href="/dashboard" data-testid="button-saved-dashboard">
            {t.openInbox}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-foreground/85">
      <span className="text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
