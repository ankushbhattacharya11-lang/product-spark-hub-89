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
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are the Baba Champion Premier League tournament engine. Parse an eFootball match report into a strict record. League players: ${roster}. home_player/away_player MUST be exactly one of the player names (map club names to their player). The first-mentioned player is home unless stated. Scorers are in-game footballers; omit if not mentioned. Scorer goals per side must not exceed that side's score.`,
          },
          { role: "user", content: data.report },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "record_result",
              description: "Record a parsed match result",
              parameters: {
                type: "object",
                properties: {
                  home_player: { type: "string" },
                  away_player: { type: "string" },
                  home_goals: { type: "integer" },
                  away_goals: { type: "integer" },
                  scorers: {
                    type: "array",
                    items: {
                      type: "object",
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
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "record_result" } },
      }),
    });

    if (res.status === 429) return { ok: false as const, error: "Too many requests — try again in a minute." };
    if (res.status === 402) return { ok: false as const, error: "AI credits are used up for this workspace." };
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return { ok: false as const, error: "The AI couldn't read that report." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: z.infer<typeof ResultSchema>;
    try {
      parsed = ResultSchema.parse(JSON.parse(args ?? "{}"));
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
