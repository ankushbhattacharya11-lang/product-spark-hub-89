import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowRight,
  Github,
  Linkedin,
  ExternalLink,
  Rocket,
  Code2,
  Zap,
  Activity,
  Layers,
  Filter,
} from "lucide-react";

import { CATEGORIES, allTech, projects, type Category, type Project } from "@/data/projects";
import { ClaudeWalkthrough } from "@/components/ClaudeWalkthrough";
import { ContactSection } from "@/components/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ankush Bhattacharya | Digital Product Developer & UI/UX Designer" },
      {
        name: "description",
        content:
          "Portfolio of Ankush Bhattacharya — a digital product developer and UI/UX designer building dynamic, real-time web applications including Cricket Auction Pro and a Real-Time Sports Tracking Dashboard.",
      },
      { property: "og:title", content: "Ankush Bhattacharya | Digital Product Developer & UI/UX Designer" },
      {
        property: "og:description",
        content:
          "Explore launches by a product developer who blends process management, studio operations, and real-time web application design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Subtle ambient background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-1/4 -top-1/4 h-[60rem] w-[60rem] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[50rem] w-[50rem] rounded-full bg-live/[0.05] blur-[100px]" />
      </div>

      <Header />

      <main>
        <Hero />
        <Projects />
        <WalkthroughTeaser />
        <About />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          AB.
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a
            href="#launches"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Launches
          </a>
          <a
            href="#about"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            About
          </a>
          <Button asChild size="sm" className="glow-primary">
            <a href="#launches">View My Launches</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
          </span>
          Open to product & frontend opportunities
        </div>

        <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Digital Product Developer
          <br />
          <span className="text-gradient">& UI/UX Designer</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          I design and ship dynamic, real-time web applications that feel alive. From AI-assisted
          Webflow builds to React + Firebase dashboards, I turn complex product ideas into fast,
          intuitive experiences.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="group min-w-[12rem] gap-2 glow-primary">
            <a href="#launches">
              View My Launches
              <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[12rem] gap-2">
            <a href="#about">
              About Me
              <ArrowRight />
            </a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-muted-foreground sm:block">
        <ArrowDown className="h-5 w-5" />
      </div>
    </section>
  );
}

function Projects() {
  const [category, setCategory] = useState<Category | "All">("All");
  const [tech, setTech] = useState<string | "All">("All");

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (tech === "All" || p.tech.includes(tech)),
      ),
    [category, tech],
  );

  return (
    <section id="launches" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Zap className="h-4 w-4" />
            Selected Work
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Launches that move fast
          </h2>
          <p className="mt-4 text-muted-foreground">
            Product case studies built around real-time data, sports workflows, and AI-driven automation.
          </p>
        </div>

        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Category
            </span>
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === c
                    ? "border-primary/60 bg-primary/15 text-foreground"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Code2 className="h-3.5 w-3.5" />
              Tech
            </span>
            {(["All", ...allTech] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTech(t)}
                aria-pressed={tech === t}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  tech === t
                    ? "border-primary/60 bg-primary/15 text-foreground"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No projects match that combination — try clearing a filter.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WalkthroughTeaser() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Activity className="h-4 w-4" />
            Interactive Demo
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Watch Claude parse a match report
          </h2>
          <p className="mt-4 text-muted-foreground">
            Step through the exact pipeline behind the Baba Champion Premier League: raw results in,
            fixtures, standings, and player metrics out — no manual data entry.
          </p>
        </div>
        <ClaudeWalkthrough />
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { title, summary, image, imageAlt, tech, liveIndicator, slug } = project;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_-12px_var(--color-glow)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
        {liveIndicator && (
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-live backdrop-blur-sm ring-live">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
            Live Data
          </div>
        )}
        <img
          src={image}
          alt={imageAlt}
          width={1024}
          height={576}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>

        <div className="mt-6">
          <Button asChild variant="outline" className="group/btn gap-2">
            <a href={href}>
              {cta}
              <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <Layers className="h-4 w-4" />
              About Me
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Process thinker turned product builder
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                My background spans process management and studio operations — disciplines that
                taught me how to ship under pressure, coordinate cross-functional teams, and keep
                complex systems running smoothly.
              </p>
              <p>
                Today I channel that operational rigor into digital product design and frontend
                development. I specialize in real-time web applications: live dashboards,
                data-driven interfaces, and responsive experiences that perform at scale.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard icon={<Activity />} label="Real-Time" value="Dashboards" />
              <StatCard icon={<Zap />} label="Product" value="Design" />
              <StatCard icon={<Code2 />} label="Frontend" value="Development" />
            </div>
          </div>

          <div className="relative rounded-2xl border border-border bg-surface p-8 sm:p-10">
            <div className="absolute -right-px -top-px h-32 w-32 rounded-bl-full rounded-tr-2xl bg-primary/10 blur-2xl" />
            <h3 className="font-heading text-xl font-semibold">What I bring to the table</h3>
            <ul className="mt-6 space-y-4">
              <CapabilityItem>
                Translating operational processes into clean, scalable product workflows.
              </CapabilityItem>
              <CapabilityItem>
                Designing UI/UX for real-time, data-heavy applications that stay intuitive.
              </CapabilityItem>
              <CapabilityItem>
                Building with React, Firebase, Webflow, and AI-assisted tooling to ship fast.
              </CapabilityItem>
              <CapabilityItem>
                Balancing visual polish with performance and accessibility.
              </CapabilityItem>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-heading font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function CapabilityItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span className="text-sm text-muted-foreground sm:text-base">{children}</span>
    </li>
  );
}

function Footer() {
  const socialLinks = [
    { label: "GitHub", href: "https://github.com", icon: Github },
    { label: "Replit", href: "https://replit.com", icon: Code2 },
    { label: "Product Hunt", href: "https://producthunt.com", icon: Rocket },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ];

  return (
    <footer className="border-t border-border bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-heading font-semibold text-foreground">Ankush Bhattacharya</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Digital Product Developer & UI/UX Designer
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-3">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <Button
              key={label}
              asChild
              variant="outline"
              size="sm"
              className="gap-2"
              aria-label={`Visit ${label} profile`}
            >
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4" />
                {label}
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </Button>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-7xl text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ankush Bhattacharya. Built for speed, clarity, and real-time
        impact.
      </div>
    </footer>
  );
}
