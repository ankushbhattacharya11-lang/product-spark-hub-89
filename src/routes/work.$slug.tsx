import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Target, Compass, Workflow, TrendingUp, Layers } from "lucide-react";
import { getProject, projects } from "@/data/projects";
import { ClaudeWalkthrough } from "@/components/ClaudeWalkthrough";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Case study not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { project } = loaderData;
    const title = `${project.title} — Case Study | Ankush Bhattacharya`;
    const description = `${project.tagline} ${project.summary}`.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CaseStudy,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold">Case study not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This project doesn't exist or has moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to portfolio</Link>
        </Button>
      </div>
    </div>
  ),
});

function CaseStudy() {
  const { project } = Route.useLoaderData();
  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-1/4 -top-1/4 h-[60rem] w-[60rem] rounded-full bg-primary/[0.06] blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All launches
          </Link>
          <Button asChild size="sm" className="glow-primary">
            <Link to="/" hash="contact">
              Start a project
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <Badge variant="secondary">{project.category}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {project.tagline} {project.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tech.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
          <img
            src={project.image}
            alt={project.imageAlt}
            width={1024}
            height={576}
            loading="eager"
            decoding="async"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <Section icon={<Target className="h-4 w-4" />} label="Problem" title="What wasn't working">
          <ul className="space-y-3">
            {project.problem.map((p) => (
              <Bullet key={p}>{p}</Bullet>
            ))}
          </ul>
        </Section>

        <Section icon={<Compass className="h-4 w-4" />} label="Approach" title="How I framed it">
          <ul className="space-y-3">
            {project.approach.map((p) => (
              <Bullet key={p}>{p}</Bullet>
            ))}
          </ul>
        </Section>

        <Section icon={<Workflow className="h-4 w-4" />} label="Workflow" title="The system, step by step">
          <ol className="space-y-4">
            {project.workflow.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-heading font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {project.hasWalkthrough && (
          <div className="mt-14">
            <ClaudeWalkthrough />
          </div>
        )}

        <Section icon={<TrendingUp className="h-4 w-4" />} label="Results" title="What changed">
          <div className="grid gap-4 sm:grid-cols-3">
            {project.results.map((r) => (
              <div key={r.label} className="rounded-xl border border-border bg-card p-5">
                <p className="font-heading text-2xl font-bold text-gradient">{r.metric}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{project.outcome}</p>
        </Section>

        <Section icon={<Layers className="h-4 w-4" />} label="Tech stack" title="What it's built with">
          <div className="grid gap-4 sm:grid-cols-3">
            {project.techStack.map((group) => (
              <div key={group.group} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold sm:text-2xl">
            Have a workflow that looks like this?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Request an AI automation assessment and I'll map the bottleneck and the fix.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="gap-2 glow-primary">
              <Link to="/" hash="contact">
                Start a project
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/" hash="launches">
                Browse other launches
              </Link>
            </Button>
          </div>
        </div>

        <nav aria-label="Other case studies" className="mt-14">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Next case studies</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/work/$slug"
                params={{ slug: p.slug }}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="mt-1 font-heading font-semibold group-hover:text-primary">{p.title}</p>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}

function Section({
  icon,
  label,
  title,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        {icon}
        {label}
      </div>
      <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span className="text-base leading-relaxed text-muted-foreground">{children}</span>
    </li>
  );
}
