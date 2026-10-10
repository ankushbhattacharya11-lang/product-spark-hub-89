import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Search, PenTool, FileCode2, Cpu, ShieldCheck, Rocket, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/process/baba-champion-league")({
  head: () => ({
    meta: [
      { title: "Baba Champion League — Full Build Process | Ankush Bhattacharya" },
      { name: "description", content: "End-to-end process: discovery, data design, prompt engineering, validation, launch and iteration of an AI-run eFootball league." },
      { property: "og:title", content: "Baba Champion League — Full Build Process" },
      { property: "og:description", content: "From spreadsheet chaos to a live, AI-parsed league dashboard — every step." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProcessPage,
});

const PHASES = [
  {
    icon: Search,
    phase: "01 · Discover",
    title: "Find the real bottleneck",
    body: "I sat in on three match nights and logged every manual step. Updating the table after each game took 6–10 minutes and was where almost every error came from.",
    artifacts: ["Task timing log", "Error list from 12 matches", "4 player interviews"],
  },
  {
    icon: PenTool,
    phase: "02 · Define",
    title: "Decide what 'done' looks like",
    body: "Goal: a result typed the way players already talk ends up in the table in seconds, with no one opening a spreadsheet. Success = zero manual entry, zero table mistakes.",
    artifacts: ["Problem statement", "Success metrics", "Out-of-scope list"],
  },
  {
    icon: FileCode2,
    phase: "03 · Model the data",
    title: "Design a strict result record",
    body: "Every match becomes home player, away player, both scores and a list of scorers. Standings, form and top scorers are always recalculated from these records — never edited by hand.",
    artifacts: ["Result schema", "Standings + tie-break rules", "Double round-robin fixture logic"],
  },
  {
    icon: Cpu,
    phase: "04 · Prompt engineering",
    title: "Turn the AI into a tournament engine",
    body: "The AI gets the roster, club-to-player mapping and a strict output format. It can only answer in that format, so messy reports like 'Haaland hat-trick, City smashed Barca 4-2' become clean data.",
    artifacts: ["System prompt v1 → v4", "20 tricky test reports", "Structured output contract"],
  },
  {
    icon: ShieldCheck,
    phase: "05 · Validate",
    title: "Never trust, always check",
    body: "Before anything is saved, the app checks both players exist, they aren't the same person, and scorer goals don't exceed the score. Bad parses are rejected with a clear message.",
    artifacts: ["Validation guards", "Owner-only publishing", "Rejected-parse messages"],
  },
  {
    icon: Rocket,
    phase: "06 · Ship",
    title: "Build the live dashboard",
    body: "A public page shows standings, form, latest results, top scorers and remaining fixtures. When a result is published, every open screen updates instantly — no refresh.",
    artifacts: ["Live standings page", "Instant updates", "Mobile-first table"],
  },
  {
    icon: RefreshCw,
    phase: "07 · Iterate",
    title: "Learn from real match nights",
    body: "Early versions confused club names with player names, so the roster now includes clubs. The next step is letting players submit results themselves for owner approval.",
    artifacts: ["Bug log", "Prompt revisions", "Roadmap"],
  },
];

function ProcessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Portfolio
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <Badge variant="outline" className="mb-4">Full process · end to end</Badge>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          Building the <span className="text-gradient">Baba Champion Premier League</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          How a four-player eFootball league went from a fragile spreadsheet to a live dashboard run by AI — every
          decision, from first observation to the version you can use today.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="gap-2 glow-primary">
            <Link to="/league">See it live <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/work/$slug" params={{ slug: "baba-champion-premier-league" }}>Read the case study</Link>
          </Button>
        </div>

        <section aria-label="Before and after" className="mt-14 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading font-semibold">Before</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>6–10 minutes of typing after each match</li>
              <li>Table often wrong or out of date</li>
              <li>One person had to own the spreadsheet</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-primary/40 bg-card p-6">
            <h2 className="font-heading font-semibold">After</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>One sentence in, table updated in seconds</li>
              <li>Every number recalculated from the results</li>
              <li>Anyone can watch it live</li>
            </ul>
          </div>
        </section>

        <ol className="relative mt-16 space-y-10 border-l border-border pl-8">
          {PHASES.map((p) => (
            <li key={p.phase} className="relative">
              <span className="absolute -left-[45px] grid h-8 w-8 place-items-center rounded-full border border-border bg-surface">
                <p.icon className="h-4 w-4 text-primary" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{p.phase}</p>
              <h2 className="mt-1 font-heading text-xl font-bold">{p.title}</h2>
              <p className="mt-2 text-muted-foreground">{p.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.artifacts.map((a) => (
                  <Badge key={a} variant="secondary">{a}</Badge>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
