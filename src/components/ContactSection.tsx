import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Sparkles, CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().nonempty("Please add your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(255, "Email is too long"),
  intent: z.string().max(80).default(DEFAULT_INTENT),
  message: z
    .string()
    .trim()
    .nonempty("Tell me a little about the project")
    .max(1000, "Please keep it under 1000 characters"),
});

type Errors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

const INTENTS = [
  "Start a project",
  "AI automation assessment",
  "Real-time dashboard",
  "Just saying hi",
] as const;

type Intent = (typeof INTENTS)[number];

const DEFAULT_INTENT: Intent = "Start a project";

export function ContactSection() {
  const [intent, setIntent] = useState<Intent>(DEFAULT_INTENT);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = contactSchema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      intent,
      message: String(form.get("message") ?? ""),
    });

    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSent(true);
  }

  return (
    <section id="contact" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" />
              Let's build
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Start a project or request an{" "}
              <span className="text-gradient">AI automation assessment</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Tell me where the friction is — repetitive data entry, slow reporting, or a product
              idea that needs a real-time interface. I'll come back with a concrete plan, scope, and
              the fastest path to a working build.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-muted-foreground sm:text-base">
              {[
                "Free 30-minute automation audit of one workflow",
                "Clear scope and timeline before any build starts",
                "Reply within two business days",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-live" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button asChild variant="outline" className="gap-2">
                <a href="mailto:hello@example.com">
                  <Mail className="h-4 w-4" />
                  Email directly
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
            {sent ? (
              <div className="flex h-full flex-col items-start justify-center gap-4">
                <Badge className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Message ready
                </Badge>
                <h3 className="font-heading text-xl font-bold">Thanks — that's captured.</h3>
                <p className="text-sm text-muted-foreground">
                  I'll review your {intent.toLowerCase()} request and reply within two business days.
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <fieldset>
                  <legend className="text-sm font-medium">What do you need?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INTENTS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setIntent(option)}
                        aria-pressed={intent === option}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          intent === option
                            ? "border-primary/60 bg-primary/15 text-foreground"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" maxLength={100} placeholder="Your name" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    maxLength={255}
                    placeholder="you@company.com"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Project details</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    maxLength={1000}
                    placeholder="What's the workflow or product you want to improve?"
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 glow-primary">
                  Send request
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
