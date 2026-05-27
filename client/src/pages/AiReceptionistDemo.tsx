import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  ShieldCheck,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  ArrowRight,
  Volume2,
  AlertCircle,
} from "lucide-react";

type Turn = { role: "ai" | "caller"; text: string };

const SCRIPT: Turn[] = [
  { role: "ai", text: "Hi, thanks for calling Ortiz Concrete. This is Maya, your dispatch assistant. How can I help today?" },
  { role: "caller", text: "Hey, I need a quote for a stamped concrete patio in my backyard." },
  { role: "ai", text: "Got it — a stamped concrete patio. Can I grab your name and the project address?" },
  { role: "caller", text: "Yeah, Mara Patel. 1428 Oakridge Lane, Aurora, Colorado." },
  { role: "ai", text: "Thanks Mara. About how big is the patio area — rough square footage is fine?" },
  { role: "caller", text: "Probably 18 by 22, so… 400-ish square feet." },
  { role: "ai", text: "Perfect. And how soon are you hoping to break ground?" },
  { role: "caller", text: "Within the next month if possible — we have a graduation party Memorial Day weekend." },
  { role: "ai", text: "Understood — that's high urgency. I have an opening for an on-site walkthrough Tuesday at 10am or Thursday at 4pm. Which works better?" },
  { role: "caller", text: "Thursday at 4 would be great." },
  { role: "ai", text: "Locked in. I'll text you a confirmation in the next minute. The team will give you a 30-minute heads-up before arrival." },
];

const TURN_DELAY = 4200; // ms between turns
const CAP_SECONDS = 60;

export default function AiReceptionistDemo() {
  const [status, setStatus] = useState<"idle" | "ringing" | "live" | "ended">("idle");
  const [seconds, setSeconds] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [callerInput, setCallerInput] = useState("");
  const tickRef = useRef<number | null>(null);
  const turnRef = useRef<number | null>(null);
  const turnIdx = useRef(0);

  // Demo controls — captured lead grows as the call progresses
  const detected = useDetectedLead(turns);

  useEffect(() => {
    return () => stop();
  }, []);

  function startCall() {
    setStatus("ringing");
    setTurns([]);
    setSeconds(0);
    turnIdx.current = 0;
    setTimeout(() => {
      setStatus("live");
      tickRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s >= CAP_SECONDS) {
            endCall();
            return CAP_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
      pushNextTurn();
    }, 1100);
  }

  function pushNextTurn() {
    if (turnIdx.current >= SCRIPT.length) return;
    const next = SCRIPT[turnIdx.current];
    setTurns((prev) => [...prev, next]);
    turnIdx.current += 1;
    turnRef.current = window.setTimeout(pushNextTurn, TURN_DELAY);
  }

  function endCall() {
    setStatus("ended");
    stop();
  }

  function stop() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (turnRef.current) clearTimeout(turnRef.current);
    tickRef.current = null;
    turnRef.current = null;
  }

  function submitCallerLine() {
    if (!callerInput.trim() || status !== "live") return;
    setTurns((prev) => [...prev, { role: "caller", text: callerInput.trim() }]);
    setCallerInput("");
    // Add a friendly AI ack
    setTimeout(() => {
      setTurns((prev) => [...prev, { role: "ai", text: "Noted — anything else I should pass along to the estimator?" }]);
    }, 900);
  }

  const progress = (seconds / CAP_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40 text-foreground" data-testid="badge-ai-demo">
            <Sparkles className="h-3 w-3 mr-1 text-accent" /> AI Receptionist · clickable demo
          </Badge>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl mt-4 text-foreground max-w-2xl leading-tight">
          A 24/7 receptionist that captures the lead before they hang up.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          This is a browser-safe simulation — no microphone needed. Click <strong className="text-foreground">Start call</strong> to see a 60-second
          intake play out. Caller details land in the lead inbox automatically.
        </p>

        <div className="mt-10 grid lg:grid-cols-[1.1fr_1fr] gap-6">
          {/* Phone UI */}
          <Card className="border-border bg-card overflow-hidden">
            <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className={"h-2 w-2 rounded-full " + (status === "live" ? "bg-accent pulse-dot" : "bg-background/30")} />
                {status === "live" ? "On call" : status === "ringing" ? "Connecting…" : status === "ended" ? "Call ended" : "Standby"}
              </span>
              <span className="text-background/70">+1 (720) 555-0134 · Ortiz Concrete</span>
            </div>

            {/* Caller card */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <PhoneCall className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="font-display text-lg text-foreground">{detected.name || "Incoming caller"}</div>
                  <div className="text-xs text-muted-foreground font-mono">{detected.urgency ? `${detected.urgency} urgency` : "intake in progress"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl text-foreground tabular-nums">{formatTime(seconds)}</div>
                <div className="text-[10px] font-mono text-muted-foreground">60s demo cap</div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-5 pt-4">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Transcript */}
            <div className="p-5 max-h-80 overflow-auto space-y-3" data-testid="transcript">
              {turns.length === 0 && status === "idle" && (
                <div className="text-center text-sm text-muted-foreground py-10">
                  Press <strong className="text-foreground">Start call</strong> to begin the simulated intake.
                </div>
              )}
              {status === "ringing" && (
                <div className="text-center text-sm text-muted-foreground py-10 animate-pulse">Connecting to Ortiz Concrete…</div>
              )}
              {turns.map((t, i) => (
                <div
                  key={i}
                  className={t.role === "ai" ? "flex justify-start" : "flex justify-end"}
                  data-testid={`turn-${t.role}-${i}`}
                >
                  <div
                    className={
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm " +
                      (t.role === "ai" ? "bg-secondary text-foreground" : "bg-accent text-accent-foreground")
                    }
                  >
                    <div className="text-[10px] uppercase font-mono opacity-60 mb-0.5">{t.role === "ai" ? "Maya · AI" : "Caller"}</div>
                    {t.text}
                  </div>
                </div>
              ))}
              {status === "live" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse" /> Listening…
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-5 border-t border-border bg-secondary/40">
              {status === "idle" || status === "ended" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={startCall}
                    data-testid="button-start-call"
                  >
                    <PhoneCall className="h-4 w-4 mr-1.5" /> {status === "ended" ? "Replay simulated call" : "Start simulated call"}
                  </Button>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> No microphone needed — fully simulated.
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="destructive" onClick={endCall} data-testid="button-end-call">
                    <PhoneOff className="h-4 w-4 mr-1.5" /> End call
                  </Button>
                  <div className="flex-1 min-w-[12rem] flex gap-2">
                    <input
                      className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="Type a caller line (optional)…"
                      value={callerInput}
                      onChange={(e) => setCallerInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitCallerLine()}
                      data-testid="input-caller-line"
                    />
                    <Button variant="outline" onClick={submitCallerLine} data-testid="button-send-caller-line">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Captured lead summary */}
          <div className="space-y-5">
            <Card className="border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg">Captured lead</h3>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40">
                  <Mic className="h-3 w-3 mr-1" /> Auto-extracted
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                <Field label="Caller name" value={detected.name} testid="lead-name" />
                <Field label="Project / trade" value={detected.trade} testid="lead-trade" />
                <Field label="Project address" value={detected.address} testid="lead-address" />
                <Field label="Measurement" value={detected.size} testid="lead-size" />
                <Field label="Callback number" value={detected.phone} testid="lead-phone" />
                <Field label="Urgency" value={detected.urgency} testid="lead-urgency" />
                <Field label="Booked window" value={detected.appointment} testid="lead-appt" />
              </div>
              <Button
                className="w-full mt-5 bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
                disabled={status !== "ended"}
                data-testid="button-push-to-dashboard"
              >
                <Link href="/dashboard">
                  Push to dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border-border bg-card p-5">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" /> How the real thing works
              </h3>
              <ul className="text-sm text-foreground/85 mt-3 space-y-2">
                <Li><strong>Auto-detect language</strong> across EN/ES/FR/PT and respond in-kind.</Li>
                <Li>Hard <strong>60-second cap</strong> on demo calls, 1 free demo per visitor per 6 hours.</Li>
                <Li>Captures name, trade, urgency, address, callback, and proposed appointment window.</Li>
                <Li>Drops the lead into your MeasuredQuote inbox and fires the same automation chain as the widget.</Li>
              </ul>
              <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-foreground/80 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                Demo plays a scripted transcript. Production calls use a live voice model with sub-300ms turn-taking.
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({ label, value, testid }: { label: string; value: string; testid: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 items-start" data-testid={testid}>
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground pt-0.5">{label}</span>
      {value ? (
        <span className="text-sm text-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {value}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground italic flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" /> waiting…
        </span>
      )}
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Naive extractor that fills in lead fields as the transcript progresses. */
function useDetectedLead(turns: Turn[]) {
  const text = turns.map((t) => t.text).join(" ");
  const name = /Mara Patel/i.test(text) ? "Mara Patel" : "";
  const trade = /stamped concrete patio/i.test(text)
    ? "Stamped concrete patio"
    : /concrete/i.test(text)
      ? "Concrete"
      : "";
  const address = /1428 Oakridge Lane, Aurora, Colorado/i.test(text)
    ? "1428 Oakridge Ln, Aurora, CO"
    : "";
  const size = /400-ish square feet/i.test(text) ? "~400 sq ft" : "";
  const urgency = /Memorial Day weekend|graduation party|within the next month/i.test(text) ? "High" : "";
  const appointment = /Thursday at 4/i.test(text) ? "Thu 4:00 PM walkthrough" : "";
  const phone = appointment ? "+1 (303) 555-0190" : "";
  return { name, trade, address, size, urgency, appointment, phone };
}
