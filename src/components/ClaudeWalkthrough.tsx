import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, RotateCcw, Sparkles, Check } from "lucide-react";

const RAW_INPUT = `Matchday 7
Ankush 3-2 Rocky (Ankush: Mbappe x2, Vini; Rocky: Haaland, Foden)
Sam 1-1 Dev (Sam: Kane; Dev: Saka) — Dev yellow card`;

const PARSED = `{
  "matchday": 7,
  "matches": [
    {
      "home": "Ankush", "away": "Rocky", "score": [3, 2],
      "scorers": { "Ankush": ["Mbappe", "Mbappe", "Vini"],
                   "Rocky": ["Haaland", "Foden"] }
    },
    {
      "home": "Sam", "away": "Dev", "score": [1, 1],
      "scorers": { "Sam": ["Kane"], "Dev": ["Saka"] },
      "cards": [{ "player": "Dev", "type": "yellow" }]
    }
  ]
}`;

const STANDINGS = [
  { pos: 1, team: "Ankush", p: 7, w: 5, d: 1, l: 1, gd: "+9", pts: 16 },
  { pos: 2, team: "Sam", p: 7, w: 4, d: 2, l: 1, gd: "+6", pts: 14 },
  { pos: 3, team: "Rocky", p: 7, w: 3, d: 1, l: 3, gd: "+1", pts: 10 },
  { pos: 4, team: "Dev", p: 7, w: 1, d: 2, l: 4, gd: "-16", pts: 5 },
];

const METRICS = [
  { label: "Top scorer", value: "Mbappe — 11" },
  { label: "Most assists", value: "Vini — 7" },
  { label: "Best G/match", value: "Ankush — 2.6" },
  { label: "Discipline", value: "Dev — 3 yellows" },
];

const STEPS = [
  { id: 0, name: "Raw result", hint: "Pasted exactly as players report it" },
  { id: 1, name: "Claude parses", hint: "Schema-constrained extraction" },
  { id: 2, name: "Standings", hint: "Points, GD, and tie-breaks recomputed" },
  { id: 3, name: "Player metrics", hint: "Season aggregates updated" },
];

export function ClaudeWalkthrough() {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusStep = (next: number) => {
    const clamped = (next + STEPS.length) % STEPS.length;
    setStep(clamped);
    tabRefs.current[clamped]?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: step + 1,
      ArrowDown: step + 1,
      ArrowLeft: step - 1,
      ArrowUp: step - 1,
      Home: 0,
      End: STEPS.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      focusStep(keys[e.key]!);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Interactive walkthrough
          </div>
          <h3 className="font-heading text-xl font-bold sm:text-2xl">
            How Claude turns a match report into a league table
          </h3>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Step {step + 1} of {STEPS.length}
        </Badge>
      </div>

      {/* Stepper */}
      <div
        role="tablist"
        aria-label="Walkthrough steps"
        className="mt-6 grid gap-2 sm:grid-cols-4"
      >
        {STEPS.map((s) => {
          const done = s.id < step;
          const active = s.id === step;
          return (
            <div key={s.id}>
              <button
                type="button"
                role="tab"
                id={`walkthrough-tab-${s.id}`}
                ref={(el) => {
                  tabRefs.current[s.id] = el;
                }}
                aria-selected={active}
                aria-controls="walkthrough-panel"
                tabIndex={active ? 0 : -1}
                onKeyDown={onTabKeyDown}
                onClick={() => setStep(s.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      done || active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" aria-hidden="true" /> : s.id + 1}
                  </span>
                  {s.name}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{s.hint}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Panel */}
      <div
        id="walkthrough-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`walkthrough-tab-${step}`}
        aria-live="polite"
        className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6"
      >
        {step === 0 && (
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {RAW_INPUT}
          </pre>
        )}

        {step === 1 && (
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {PARSED}
          </pre>
        )}

        {step === 2 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">#</th>
                  <th className="pb-2 pr-3 font-medium">Team</th>
                  <th className="pb-2 pr-3 font-medium">P</th>
                  <th className="pb-2 pr-3 font-medium">W</th>
                  <th className="pb-2 pr-3 font-medium">D</th>
                  <th className="pb-2 pr-3 font-medium">L</th>
                  <th className="pb-2 pr-3 font-medium">GD</th>
                  <th className="pb-2 font-medium">Pts</th>
                </tr>
              </thead>
              <tbody>
                {STANDINGS.map((r) => (
                  <tr key={r.team} className="border-t border-border/70">
                    <td className="py-2 pr-3 text-muted-foreground">{r.pos}</td>
                    <td className="py-2 pr-3 font-medium">{r.team}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.p}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.w}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.d}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.l}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.gd}</td>
                    <td className="py-2 font-heading font-semibold text-primary">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className="mt-1 font-heading font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          onClick={() => setStep(isLast ? 0 : step + 1)}
          className="group gap-2 glow-primary"
        >
          {isLast ? "Replay walkthrough" : "Run next step"}
          {isLast ? (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          )}
        </Button>
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
