import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ResultSchema = z.object({
  home_player: z.string(),
  away_player: z.string(),
  home_goals: z.number().int().min(0).max(50),
  away_goals: z.number().int().min(0).max(50),
  scorers: z
    .array(z.object({ player: z.string(), side: z.enum(["home", "away"]), goals: z.number().int().min(1).max(20) }))
    .default([]),
});

export const parseAndSaveResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ report: z.string().trim().min(3).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return { ok: false as const, error: "Only the league admin can submit results." };

    const { data: players, error: pErr } = await supabase.from("league_players").select("id, name, club");
    if (pErr || !players) return { ok: false as const, error: "Could not load players." };

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI is not configured." };

    const roster = players.map((p) => `${p.name} (plays as ${p.club})`).join(", ");
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        home_player: { type: "string" },
        away_player: { type: "string" },
        home_goals: { type: "integer" },
        away_goals: { type: "integer" },
        scorers: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              player: { type: "string" },
              side: { type: "string", enum: ["home", "away"] },
              goals: { type: "integer" },
            },
            required: ["player", "side", "goals"],
          },
        },
      },
      required: ["home_player", "away_player", "home_goals", "away_goals", "scorers"],
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        input: [
          {
            role: "system",
            content: `You are the Baba Champion Premier League tournament engine. Parse an eFootball match report into a strict record. League players: ${roster}. home_player/away_player MUST be exactly one of the player names (map club names to their player). The first-mentioned player is home unless stated. Scorers are in-game footballers; use an empty list if none are mentioned. Scorer goals per side must not exceed that side's score.`,
          },
          { role: "user", content: data.report },
        ],
        text: { format: { type: "json_schema", name: "match_result", strict: true, schema } },
      }),
    });

    if (res.status === 429) return { ok: false as const, error: "Too many requests — try again in a minute." };
    if (res.status === 402) return { ok: false as const, error: "AI credits are used up for this workspace." };
    if (!res.ok || !res.body) {
      console.error("AI gateway error", res.status, await res.text());
      return { ok: false as const, error: "The AI couldn't read that report." };
    }

    // Consume the SSE stream and accumulate the output text.
    let out = "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
        } catch {
          /* ignore partial */
        }
      }
    }

    let parsed: z.infer<typeof ResultSchema>;
    try {
      parsed = ResultSchema.parse(JSON.parse(out || "{}"));
    } catch {
      return { ok: false as const, error: "The AI response didn't match the result format." };
    }

    const find = (n: string) => players.find((p) => p.name.toLowerCase() === n.trim().toLowerCase());
    const home = find(parsed.home_player);
    const away = find(parsed.away_player);
    if (!home || !away || home.id === away.id)
      return { ok: false as const, error: `Couldn't match players: "${parsed.home_player}" vs "${parsed.away_player}".` };

    const sideTotal = (s: "home" | "away") => parsed.scorers.filter((x) => x.side === s).reduce((t, x) => t + x.goals, 0);
    if (sideTotal("home") > parsed.home_goals || sideTotal("away") > parsed.away_goals)
      return { ok: false as const, error: "Scorer goals exceed the scoreline — please check the report." };

    const { error: insErr } = await supabase.from("league_matches").insert({
      home_id: home.id,
      away_id: away.id,
      home_goals: parsed.home_goals,
      away_goals: parsed.away_goals,
      scorers: parsed.scorers,
      raw_report: data.report,
    });
    if (insErr) return { ok: false as const, error: "Couldn't save the result." };

    return {
      ok: true as const,
      summary: `${home.name} ${parsed.home_goals}–${parsed.away_goals} ${away.name}`,
      parsed,
    };
  });
