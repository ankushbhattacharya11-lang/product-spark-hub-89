import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LeagueDashboard } from "@/components/LeagueDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/league")({
  head: () => ({
    meta: [
      { title: "Baba Champion Premier League — Live Dashboard" },
      { name: "description", content: "Live standings, results, top scorers and fixtures, updated instantly by an AI that parses match reports." },
      { property: "og:title", content: "Baba Champion Premier League — Live Dashboard" },
      { property: "og:description", content: "Live eFootball league table powered by AI result parsing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaguePage,
});

function LeaguePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Portfolio
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/process/baba-champion-league" className="text-muted-foreground hover:text-foreground">How it was built</Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          Baba Champion <span className="text-gradient">Premier League</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The real league. Each result is pasted as a plain sentence, the AI turns it into a structured record, and this
          page updates for everyone watching — no refresh needed.
        </p>
        <div className="mt-10">
          <ClientOnly fallback={<p className="text-sm text-muted-foreground">Loading live league data…</p>}>
            <LeagueDashboard />
          </ClientOnly>
        </div>
      </main>
    </div>
  );
}
