import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Save, Send, Clock, ChevronRight, CheckCircle2 } from "lucide-react";

type Template = {
  id: string;
  channel: "email" | "sms";
  audience: "homeowner" | "contractor";
  trigger: string;
  delay: string;
  subject: string;
  body: string;
};

const TEMPLATES: Template[] = [
  {
    id: "homeowner-confirm",
    channel: "email",
    audience: "homeowner",
    trigger: "Estimate completed",
    delay: "0 min",
    subject: "Your {{trade}} estimate is ready, {{firstName}}",
    body: `Hi {{firstName}},

Thanks for using our instant estimator! Here is what you shared with us:

• Project: {{trade}} at {{address}}
• Measurement: {{measurement}} {{unit}}
• Material: {{material}}
• Ballpark range: \${{low}} – \${{high}}

A contractor will reach out within 1 business day to confirm scope and schedule a free on-site visit.

— Ortiz Concrete
sales@ortizconcrete.com · (720) 555-0134`,
  },
  {
    id: "contractor-alert",
    channel: "sms",
    audience: "contractor",
    trigger: "Estimate completed",
    delay: "0 min",
    subject: "(Internal)",
    body:
      "New MeasuredQuote lead: {{firstName}} {{lastName}} · {{trade}} · {{measurement}} {{unit}} · ${{low}}–${{high}}. Call {{phone}}. View → {{dashboardLink}}",
  },
  {
    id: "hour-reminder",
    channel: "sms",
    audience: "contractor",
    trigger: "Lead status = new",
    delay: "1 hr",
    subject: "(Internal)",
    body:
      "Reminder: lead from {{firstName}} ({{trade}}, ${{high}}) has been sitting for 1 hour. Call now while intent is hot → {{phone}}",
  },
  {
    id: "homeowner-followup",
    channel: "email",
    audience: "homeowner",
    trigger: "Lead status = new",
    delay: "24 hr",
    subject: "Still thinking about your {{trade}} project?",
    body: `Hi {{firstName}},

We saved the {{trade}} estimate you started yesterday. Want us to swing by and walk the site?

Pick a time in the next 7 days and we'll lock the rate from your estimate:
• Tue 10am
• Wed 4pm
• Sat 9am

— Ortiz Concrete`,
  },
];

const TIMELINE = [
  { time: "0 min", title: "Send homeowner confirmation", channel: "email", body: "Thanks them, repeats the range, sets expectation for contractor follow-up." },
  { time: "0 min", title: "Alert contractor", channel: "sms+email", body: "SMS + email to owner with call link, scope, and estimate range." },
  { time: "1 hr", title: "Contractor reminder", channel: "sms", body: "Triggered only if lead status is still 'new'." },
  { time: "24 hr", title: "Homeowner nurture", channel: "email", body: "Polite check-in with two appointment windows." },
  { time: "72 hr", title: "Sales recovery", channel: "email", body: "Last-touch offer: drop $200 off the range if they book this week." },
];

export function AutomationTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Template[]>(TEMPLATES);
  const [activeId, setActiveId] = useState<string>(TEMPLATES[0].id);
  const active = items.find((i) => i.id === activeId) ?? items[0];

  function update<K extends keyof Template>(key: K, value: Template[K]) {
    setItems((prev) => prev.map((p) => (p.id === active.id ? { ...p, [key]: value } : p)));
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 border-border bg-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display text-lg">Email & SMS automation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Editable templates and a workflow timeline. Variables in <code className="font-mono text-xs px-1 bg-secondary rounded">{`{{...}}`}</code> are auto-replaced per lead.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40">Demo</Badge>
        </div>

        <div className="mt-5 grid lg:grid-cols-[1fr_1.4fr] gap-4">
          {/* Template list */}
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-secondary/30">
            {items.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setActiveId(t.id)}
                data-testid={`row-template-${t.id}`}
                className={
                  "w-full text-left px-4 py-3 hover-elevate flex items-center gap-3 " +
                  (active.id === t.id ? "bg-accent/10" : "")
                }
              >
                <div className="h-9 w-9 rounded-md bg-foreground text-background flex items-center justify-center shrink-0">
                  {t.channel === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground capitalize">{t.trigger}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{t.delay}</span>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{t.channel} · {t.audience}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="border border-border rounded-lg p-4 bg-card" data-testid={`detail-template-${active.id}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                {active.channel} · {active.audience}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider border-accent/40 bg-accent/10">
                <Clock className="h-3 w-3 mr-1" /> {active.delay}
              </Badge>
            </div>

            <Tabs defaultValue="edit">
              <TabsList>
                <TabsTrigger value="edit" data-testid="tab-template-edit">Edit</TabsTrigger>
                <TabsTrigger value="preview" data-testid="tab-template-preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-3 space-y-3">
                {active.channel === "email" && (
                  <div>
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subject</Label>
                    <Input
                      value={active.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className="mt-1"
                      data-testid={`input-subject-${active.id}`}
                    />
                  </div>
                )}
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Body</Label>
                  <Textarea
                    value={active.body}
                    onChange={(e) => update("body", e.target.value)}
                    className="mt-1 font-mono text-xs min-h-[180px]"
                    data-testid={`textarea-body-${active.id}`}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => toast({ title: "Template saved", description: `${active.trigger} (${active.channel})` })}
                    data-testid={`button-save-template-${active.id}`}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Test sent", description: `Mock ${active.channel} fired to your test inbox.` })}
                    data-testid={`button-test-send-${active.id}`}
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Send test
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-3">
                <Preview tpl={active} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Sequence visualization */}
      <Card className="p-5 border-border bg-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-lg">Sequence preview</h3>
            <p className="text-sm text-muted-foreground mt-1">Workflow that fires for every new lead.</p>
          </div>
          <Button variant="outline" size="sm" data-testid="button-sequence-edit">
            <ChevronRight className="h-3.5 w-3.5 mr-1.5" /> Edit sequence
          </Button>
        </div>

        <div className="mt-5 relative">
          <div className="absolute left-[5.5rem] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-3">
            {TIMELINE.map((t, i) => (
              <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-4" data-testid={`sequence-step-${i}`}>
                <div className="font-mono text-xs text-muted-foreground pt-3">{t.time}</div>
                <div className="rounded-lg border border-border bg-secondary/30 p-3 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-md bg-foreground text-background flex items-center justify-center shrink-0">
                    {t.channel.includes("email") ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.body}</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase border-accent/40 bg-accent/10 shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Preview({ tpl }: { tpl: Template }) {
  const sample = {
    firstName: "Mara",
    lastName: "Patel",
    trade: "roofing",
    address: "1428 Oakridge Ln, Aurora, CO",
    measurement: "1,840",
    unit: "sqft",
    material: "Architectural shingles",
    low: "18,200",
    high: "22,400",
    phone: "+1 (303) 555-0190",
    dashboardLink: "https://app.measuredquote.com/leads/0042",
  } as Record<string, string>;
  const render = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => sample[k] ?? `{{${k}}}`);
  return (
    <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
      {tpl.channel === "email" ? (
        <>
          <div className="px-4 py-3 bg-card border-b border-border text-xs space-y-1">
            <div><span className="font-mono text-muted-foreground">From:</span> Ortiz Concrete &lt;sales@ortizconcrete.com&gt;</div>
            <div><span className="font-mono text-muted-foreground">To:</span> {sample.firstName} {sample.lastName} &lt;mara@example.com&gt;</div>
            <div><span className="font-mono text-muted-foreground">Subject:</span> <span className="font-medium text-foreground">{render(tpl.subject)}</span></div>
          </div>
          <div className="p-4 whitespace-pre-wrap text-sm text-foreground/85">{render(tpl.body)}</div>
        </>
      ) : (
        <div className="p-4">
          <div className="max-w-sm rounded-2xl bg-accent text-accent-foreground p-3 text-sm">
            {render(tpl.body)}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-2">SMS · 1 segment · sent via Twilio</div>
        </div>
      )}
    </div>
  );
}
