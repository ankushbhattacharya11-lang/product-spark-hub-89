export interface LeaguePlayer {
  id: string;
  name: string;
  club: string;
}

export interface Scorer {
  player: string;
  side: "home" | "away";
  goals: number;
}

export interface LeagueMatch {
  id: string;
  home_id: string;
  away_id: string;
  home_goals: number;
  away_goals: number;
  scorers: Scorer[];
  played_at: string;
}

export interface StandingRow {
  player: LeaguePlayer;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export function computeStandings(players: LeaguePlayer[], matches: LeagueMatch[]): StandingRow[] {
  const rows = new Map<string, StandingRow>(
    players.map((p) => [
      p.id,
      { player: p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [] },
    ]),
  );
  const ordered = [...matches].sort((a, b) => a.played_at.localeCompare(b.played_at));
  for (const m of ordered) {
    const h = rows.get(m.home_id);
    const a = rows.get(m.away_id);
    if (!h || !a) continue;
    h.played++;
    a.played++;
    h.gf += m.home_goals;
    h.ga += m.away_goals;
    a.gf += m.away_goals;
    a.ga += m.home_goals;
    if (m.home_goals > m.away_goals) {
      h.won++; a.lost++; h.points += 3; h.form.push("W"); a.form.push("L");
    } else if (m.home_goals < m.away_goals) {
      a.won++; h.lost++; a.points += 3; a.form.push("W"); h.form.push("L");
    } else {
      h.drawn++; a.drawn++; h.points++; a.points++; h.form.push("D"); a.form.push("D");
    }
  }
  return [...rows.values()]
    .map((r) => ({ ...r, gd: r.gf - r.ga, form: r.form.slice(-5) }))
    .sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf || x.player.name.localeCompare(y.player.name));
}

export function topScorers(matches: LeagueMatch[], limit = 8) {
  const tally = new Map<string, number>();
  for (const m of matches) for (const s of m.scorers ?? []) tally.set(s.player, (tally.get(s.player) ?? 0) + s.goals);
  return [...tally.entries()].map(([player, goals]) => ({ player, goals })).sort((a, b) => b.goals - a.goals).slice(0, limit);
}

/** Round-robin (double) fixtures still to be played. */
export function remainingFixtures(players: LeaguePlayer[], matches: LeagueMatch[]) {
  const out: { home: LeaguePlayer; away: LeaguePlayer }[] = [];
  for (const h of players)
    for (const a of players) {
      if (h.id === a.id) continue;
      if (!matches.some((m) => m.home_id === h.id && m.away_id === a.id)) out.push({ home: h, away: a });
    }
  return out;
}
