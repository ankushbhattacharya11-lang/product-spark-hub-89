import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseAndSaveResult } from "@/lib/league.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Inbox, Sparkles, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Inbox & League" },
      { name: "description", content: "Private inbox and league result entry." },
      { property: "og:title", content: "Admin" },
      { property: "og:description", content: "Private admin area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface Msg {
  id: string;
  name: string;
  email: string;
  intent: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function AdminPage() {
  const navigate = useNavigate();
  const submitResult = useServerFn(parseAndSaveResult);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!role);
      if (role) {
        const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
        setMessages((data ?? []) as Msg[]);
      }
    })();
  }, []);

  async function markRead(id: string) {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
  }

  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const r = await submitResult({ data: { report } });
      if (r.ok) {
        setResult({ ok: true, text: `Saved: ${r.summary}` });
        setReport("");
      } else setResult({ ok: false, text: r.error });
    } catch {
      setResult({ ok: false, text: "Something went wrong. Try again." });
    }
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isAdmin === null) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!isAdmin)
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
        <div>
          <h1 className="font-heading text-2xl font-bold">This area is for the site owner only.</h1>
          <Button variant="outline" className="mt-4" onClick={signOut}>Sign out</Button>
        </div>
      </main>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Portfolio</Link>
        <div className="flex items-center gap-3">
          <Link to="/league" className="text-sm text-muted-foreground hover:text-foreground">Live league</Link>
          <Button size="sm" variant="ghost" onClick={signOut} className="gap-1.5"><LogOut className="h-4 w-4" />Sign out</Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-10 px-4 pb-24">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h1 className="flex items-center gap-2 font-heading text-xl font-bold"><Sparkles className="h-5 w-5 text-primary" />Add a match result</h1>
          <p className="mt-1 text-sm text-muted-foreground">Write it the way players report it, e.g. "Rohit beat Sayan 4-2, Haaland hat-trick, De Bruyne 1 — Yamal and Pedri for Sayan".</p>
          <form onSubmit={sendReport} className="mt-4 space-y-3">
            <Textarea rows={3} value={report} onChange={(e) => setReport(e.target.value)} maxLength={2000} required aria-label="Match report" />
            <Button type="submit" disabled={busy || report.trim().length < 3}>{busy ? "AI is parsing…" : "Parse & publish"}</Button>
            {result && <p role="status" className={`text-sm ${result.ok ? "text-live" : "text-destructive"}`}>{result.text}</p>}
          </form>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold"><Inbox className="h-5 w-5 text-primary" />Contact requests ({messages.length})</h2>
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{m.name}</span>
                  <a href={`mailto:${m.email}`} className="text-sm text-primary underline">{m.email}</a>
                  <Badge variant="outline">{m.intent}</Badge>
                  {!m.is_read && <Badge>New</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
                {!m.is_read && <Button size="sm" variant="ghost" className="mt-2" onClick={() => markRead(m.id)}>Mark as read</Button>}
              </li>
            ))}
            {messages.length === 0 && <li className="text-sm text-muted-foreground">No requests yet.</li>}
          </ul>
        </section>
      </main>
    </div>
  );
}
