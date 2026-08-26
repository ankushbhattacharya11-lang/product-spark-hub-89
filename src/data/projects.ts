import cricketAuctionThumb from "@/assets/cricket-auction-pro.jpg";
import sportsDashboardThumb from "@/assets/sports-dashboard.jpg";
import babaChampionThumb from "@/assets/baba-champion-league.jpg";

export const CATEGORIES = [
  "AI Automation",
  "Real-Time Dashboards",
  "Web Builds",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  category: Category;
  tech: string[];
  image: string;
  imageAlt: string;
  liveIndicator?: boolean;
  summary: string;
  problem: string[];
  approach: string[];
  workflow: { title: string; detail: string }[];
  results: { metric: string; label: string }[];
  outcome: string;
  techStack: { group: string; items: string[] }[];
  hasWalkthrough?: boolean;
}

export const projects: Project[] = [
  {
    slug: "cricket-auction-pro",
    title: "Cricket Auction Pro",
    tagline: "A live cricket auction platform where franchises bid in real time.",
    category: "Web Builds",
    tech: ["Webflow", "AI", "Real-Time Bidding", "Dashboard"],
    image: cricketAuctionThumb,
    imageAlt:
      "Cricket Auction Pro dashboard showing live player cards, bidding timer, and team budget bars in a dark UI",
    summary:
      "Built with Webflow and AI-assisted workflows, it blends sport admin tools with an engaging bidding experience.",
    problem: [
      "Community cricket auctions ran on shouted bids, paper sheets, and a single spreadsheet operator — nobody could see the live state of budgets or squads.",
      "Franchise owners routinely overspent because remaining purse and slot limits were only recalculated after the fact.",
    ],
    approach: [
      "Mapped the full auction ceremony as a state machine: player on the block, bid increments, sold/unsold, purse deduction, squad validation.",
      "Designed a big-screen auctioneer view plus a compact owner view, so the same data reads clearly at 10 feet and at arm's length.",
      "Used AI-assisted content and component generation to move from wireframe to production Webflow build in days, not weeks.",
    ],
    workflow: [
      { title: "Auction setup", detail: "Player pool, base prices, franchise purses and slot rules are configured before the event." },
      { title: "Live bidding", detail: "The auctioneer advances bids; increments and timers are enforced by the interface." },
      { title: "Instant settlement", detail: "On sold, the purse deducts, the squad card updates, and remaining slots recalculate." },
      { title: "Broadcast view", detail: "A projector-ready screen keeps the room synced with the same source of truth." },
      { title: "Post-auction export", detail: "Final squads, spend breakdowns, and unsold lists are exported for the league sheet." },
    ],
    results: [
      { metric: "0", label: "Manual purse errors" },
      { metric: "~40%", label: "Faster auction rounds" },
      { metric: "1", label: "Shared source of truth" },
    ],
    outcome:
      "The auction now runs as a guided flow instead of a spreadsheet scramble, with every franchise seeing the same live numbers.",
    techStack: [
      { group: "Build", items: ["Webflow", "Custom CSS", "Vanilla JS interactions"] },
      { group: "Data", items: ["Structured collections", "CSV import/export"] },
      { group: "AI assist", items: ["Copy generation", "Component scaffolding", "QA checklists"] },
    ],
  },
  {
    slug: "real-time-sports-tracking-dashboard",
    title: "Real-Time Sports Tracking Dashboard",
    tagline: "Live player movement, match stats, and heatmaps as the game unfolds.",
    category: "Real-Time Dashboards",
    tech: ["React", "Firebase", "Real-Time Data", "Data Viz"],
    image: sportsDashboardThumb,
    imageAlt:
      "Real-Time Sports Tracking Dashboard with live pitch map, statistics charts, and player heatmaps in a dark UI",
    liveIndicator: true,
    summary:
      "A React + Firebase dashboard designed for coaches, analysts, and fans who need instant insight.",
    problem: [
      "Match insight arrived after full-time, when tactical decisions were already too late to make.",
      "Stat feeds, positional data, and video notes lived in separate tools with no shared timeline.",
    ],
    approach: [
      "Modelled a single match document streamed over Firebase realtime listeners so every client renders the same tick.",
      "Prioritised glanceability: the pitch map answers 'where', the stat rail answers 'how much', the timeline answers 'when'.",
      "Kept the render path cheap — memoised chart data, throttled positional updates, and virtualised event lists.",
    ],
    workflow: [
      { title: "Ingest", detail: "Match events and positional samples are written to Firebase as they happen." },
      { title: "Stream", detail: "Realtime listeners push deltas to connected dashboards with no polling." },
      { title: "Aggregate", detail: "Derived metrics — possession, pressure, distance covered — recompute on each delta." },
      { title: "Visualise", detail: "Pitch map, heatmaps, and stat cards animate to the new state instead of flashing." },
      { title: "Review", detail: "Any moment on the timeline can be scrubbed back for post-match analysis." },
    ],
    results: [
      { metric: "<1s", label: "Event to screen" },
      { metric: "3", label: "Audiences served" },
      { metric: "100%", label: "Shared match timeline" },
    ],
    outcome:
      "Coaching staff now adjust during the match rather than after it, working from the same live picture as analysts and fans.",
    techStack: [
      { group: "Frontend", items: ["React", "TypeScript", "Tailwind CSS"] },
      { group: "Realtime", items: ["Firebase Realtime Database", "Firestore listeners"] },
      { group: "Visualisation", items: ["Canvas heatmaps", "SVG pitch map", "Chart components"] },
    ],
  },
  {
    slug: "baba-champion-premier-league",
    title: "Baba Champion Premier League",
    tagline: "An AI-automated eFootball tournament engine powered by Claude.",
    category: "AI Automation",
    tech: ["Claude AI", "Prompt Engineering", "Automation", "Tournament Ops"],
    image: babaChampionThumb,
    imageAlt:
      "Baba Champion Premier League tournament dashboard showing leaderboard, fixtures, and AI automation panel in a dark UI",
    liveIndicator: true,
    hasWalkthrough: true,
    summary:
      "Structured prompts parse raw match results into fixture schedules, leaderboards, and player metrics with zero manual data entry.",
    problem: [
      "A competitive four-player eFootball tournament needs continuous, accurate tracking of fixtures, standings, and detailed player statistics.",
      "Running that on spreadsheets meant repetitive data entry, delayed updates, and human error creeping into the table.",
    ],
    approach: [
      "Turned Claude into an autonomous tournament engine driven by structured, role-scoped prompts.",
      "Defined a strict result schema so free-form match reports normalise into machine-readable records.",
      "Chained parsing, standings calculation, and metric aggregation so one paste produces the full updated tournament state.",
    ],
    workflow: [
      { title: "Raw result in", detail: "A match result is pasted in natural language, exactly as players report it." },
      { title: "Parse", detail: "Claude extracts teams, scoreline, scorers, assists, and discipline into a strict schema." },
      { title: "Validate", detail: "The record is checked against the fixture list and rejected if it conflicts." },
      { title: "Recalculate", detail: "Points, goal difference, form, and player metrics are recomputed across the season." },
      { title: "Publish", detail: "Updated fixtures, standings, and top-scorer tables are emitted ready to share." },
    ],
    results: [
      { metric: "0", label: "Manual data entry tasks" },
      { metric: "0", label: "Tracking errors" },
      { metric: "Instant", label: "Standings updates" },
    ],
    outcome:
      "The system replaced all manual data entry with an AI-driven process, giving zero-latency, error-free tracking — a clear example of spotting an operational bottleneck and deploying targeted generative AI to fix it.",
    techStack: [
      { group: "AI", items: ["Claude", "Structured prompting", "Schema-constrained output"] },
      { group: "Logic", items: ["Standings algorithm", "Tie-break rules", "Player metric aggregation"] },
      { group: "Ops", items: ["Fixture generation", "Validation guards", "Shareable tables"] },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const allTech = Array.from(new Set(projects.flatMap((p) => p.tech))).sort();
