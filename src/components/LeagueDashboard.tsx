import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  computeStandings,
  remainingFixtures,
  topScorers,
  type LeagueMatch,
  type LeaguePlayer,
} from "@/lib/league";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Goal, Radio } from "lucide-react";

export function LeagueDashboard() {
  const [players, setPlayers] = useState<LeaguePlayer[]>([]);
  const [matches, setMatches] = useState<LeagueMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const [p, m] = await Promise.all([
        supabase.from("league_players").select("id, name, club").order("name"),
        supabase.from("league_matches").select("id, home_id, away_id, home_goals, away_goals, scorers, played_at").order("played_at", { ascending: false }),
      ]);
      if (!active) return;
      setPlayers((p.data ?? []) as LeaguePlayer[]);
      setMatches((m.data ?? []) as unknown as LeagueMatch[]);
      setLoading(false);
    }
    load();
    const channel = supabase
      .channel("league-matches")
      .on("postgres_changes", { event: "*", schema: "public", table: "league_matches" }, () => {
        setFlash("New result just landed");
        load();
        setTimeout(() => setFlash(null), 4000);
      })
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const standings = useMemo(() => computeStandings(players, matches), [players, matches]);
  const scorers = useMemo(() => topScorers(matches), [matches]);
  const fixtures = useMemo(() => remainingFixtures(players, matches), [players, matches]);
  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  if (loading) return <p className="text-sm text-muted-foreground">Loading live league data…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3" aria-live="polite">
        <Badge variant="outline" className="gap-1.5 border-live/50 text-live">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live
        </Badge>
        <span className="text-sm text-muted-foreground">
          {matches.length} played · {fixtures.length} remaining
        </span>
        {flash && <Badge>{flash}</Badge>}
      </div>

      <section aria-labelledby="table-h" className="overflow-x-auto rounded-2xl border border-border bg-card">
        <h2 id="table-h" className="flex items-center gap-2 border-b border-border px-5 py-4 font-heading font-semibold">
          <Trophy className="h-4 w-4 text-primary" /> Standings
        </h2>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["#", "Player", "P", "W", "D", "L", "GF", "GA", "GD", "Pts", "Form"].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => (
              <tr key={r.player.id} className="border-t border-border">
                <td className="px-3 py-3 font-semibold">{i + 1}</td>
                <td className="px-3 py-3">
                  <div className="font-medium">{r.player.name}</div>
                  <div className="text-xs text-muted-foreground">{r.player.club}</div>
                </td>
                <td className="px-3">{r.played}</td>
                <td className="px-3">{r.won}</td>
                <td className="px-3">{r.drawn}</td>
                <td className="px-3">{r.lost}</td>
                <td className="px-3">{r.gf}</td>
                <td className="px-3">{r.ga}</td>
                <td className="px-3">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                <td className="px-3 font-bold text-primary">{r.points}</td>
                <td className="px-3">
                  <div className="flex gap-1">
                    {r.form.map((f, k) => (
                      <span
                        key={k}
                        className={`grid h-5 w-5 place-items-center rounded text-[10px] font-bold ${
                          f === "W" ? "bg-live/20 text-live" : f === "L" ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="res-h" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="res-h" className="mb-3 flex items-center gap-2 font-heading font-semibold">
            <Radio className="h-4 w-4 text-primary" /> Latest results
          </h2>
          <ul className="space-y-2 text-sm">
            {matches.slice(0, 8).map((m) => (
              <li key={m.id} className="flex justify-between rounded-lg bg-surface px-3 py-2">
                <span>{name(m.home_id)}</span>
                <span className="font-bold">{m.home_goals}–{m.away_goals}</span>
                <span>{name(m.away_id)}</span>
              </li>
            ))}
            {matches.length === 0 && <li className="text-muted-foreground">No matches yet.</li>}
          </ul>
        </section>
        <section aria-labelledby="sc-h" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="sc-h" className="mb-3 flex items-center gap-2 font-heading font-semibold">
            <Goal className="h-4 w-4 text-primary" /> Top scorers
          </h2>
          <ol className="space-y-2 text-sm">
            {scorers.map((s) => (
              <li key={s.player} className="flex justify-between">
                <span>{s.player}</span>
                <span className="font-bold">{s.goals}</span>
              </li>
            ))}
            {scorers.length === 0 && <li className="text-muted-foreground">No goals recorded.</li>}
          </ol>
        </section>
        <section aria-labelledby="fx-h" className="rounded-2xl border border-border bg-card p-5">
          <h2 id="fx-h" className="mb-3 flex items-center gap-2 font-heading font-semibold">
            <Calendar className="h-4 w-4 text-primary" /> Upcoming fixtures
          </h2>
          <ul className="max-h-72 space-y-2 overflow-y-auto text-sm">
            {fixtures.map((f) => (
              <li key={f.home.id + f.away.id} className="flex justify-between text-muted-foreground">
                <span className="text-foreground">{f.home.name}</span>
                <span>vs</span>
                <span className="text-foreground">{f.away.name}</span>
              </li>
            ))}
            {fixtures.length === 0 && <li className="text-muted-foreground">Season complete!</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
