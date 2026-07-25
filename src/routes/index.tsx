import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IdeaGate — Foundation" },
      {
        name: "description",
        content:
          "The visual foundation of IdeaGate: tokens, typography, motion and primitives for a calm, editorial Product OS.",
      },
    ],
  }),
  component: FoundationShowcase,
});

/* ---------------- Theme toggle ---------------- */
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
  return { theme, setTheme };
}

/* ---------------- Section shell ---------------- */
function Section({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="border-b border-border">
      <div className="mx-auto max-w-[var(--container-page)] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-12 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="text-subheading">{eyebrow}</div>
          <h2 className="text-heading-1 max-w-2xl text-foreground">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

/* ---------------- Swatch ---------------- */
function Swatch({
  name,
  varName,
  className,
  border,
}: {
  name: string;
  varName: string;
  className: string;
  border?: boolean;
}) {
  return (
    <div className="group">
      <div
        className={`aspect-[5/3] w-full rounded-md transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:-translate-y-0.5 ${className} ${
          border ? "border border-border" : ""
        }`}
      />
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-ui text-foreground">{name}</div>
        <div className="text-code text-muted-foreground">{varName}</div>
      </div>
    </div>
  );
}

/* ---------------- Button primitive ---------------- */
function Btn({
  children,
  variant = "primary",
  size = "md",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "accent" | "destructive";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-[0.98] disabled:opacity-50";
  const sizes = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-9 px-4 text-[13px]",
    lg: "h-11 px-5 text-sm",
  }[size];
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-xs)]",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    ghost: "text-foreground hover:bg-muted",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-xs)]",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  }[variant];
  return <button className={`${base} ${sizes} ${variants}`}>{children}</button>;
}

/* ---------------- Badge ---------------- */
function Badge({
  tone = "neutral",
  children,
  dot,
}: {
  tone?: "neutral" | "success" | "warning" | "info" | "destructive" | "accent";
  children: ReactNode;
  dot?: boolean;
}) {
  const tones = {
    neutral:
      "bg-secondary text-secondary-foreground border-border",
    success: "bg-success/12 text-success border-success/25",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    info: "bg-info/12 text-info border-info/25",
    destructive: "bg-destructive/10 text-destructive border-destructive/25",
    accent: "bg-accent-soft text-accent border-accent/25",
  }[tone];
  const dotColor = {
    neutral: "bg-muted-foreground",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    destructive: "bg-destructive",
    accent: "bg-accent",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight ${tones}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full pulse-dot ${dotColor}`} />}
      {children}
    </span>
  );
}

/* ---------------- Page ---------------- */
function FoundationShowcase() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground animate-in-fade">
      {/* Top toolbar */}
      <header className="sticky top-0 z-[var(--z-toolbar)] border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[var(--toolbar-height)] max-w-[var(--container-page)] items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <span className="font-serif text-[17px] leading-none">I</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-ui text-foreground">IdeaGate</span>
              <span className="text-caption">Foundation · v2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-caption sm:inline">Theme</span>
            <div className="inline-flex rounded-md border border-border p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={`h-7 rounded px-3 text-[12px] font-medium transition-colors ${
                  theme === "light"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`h-7 rounded px-3 text-[12px] font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[var(--container-page)] px-6 pt-24 pb-28 md:px-10 md:pt-32 md:pb-36">
          <div className="grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:items-end">
            <div className="animate-in-up">
              <Badge tone="accent" dot>
                Phase 1 · Foundation · v2
              </Badge>
              <div className="mt-8 flex flex-col gap-1 text-subheading">
                <span>The Product Operating System</span>
              </div>
            </div>
            <div className="animate-in-up" style={{ animationDelay: "80ms" }}>
              <h1 className="text-display text-foreground">
                A calm workspace
                <br />
                <span className="italic text-muted-foreground">for structured</span>{" "}
                <span className="italic">product thinking.</span>
              </h1>
              <p className="mt-8 max-w-xl text-body text-muted-foreground">
                IdeaGate turns a raw idea into a complete set of production-ready
                product artifacts. This page establishes the visual DNA every
                future screen inherits — tokens, typography, motion, and
                primitives. No product surfaces yet.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Btn variant="primary" size="lg">
                  Explore the system
                </Btn>
                <Btn variant="ghost" size="lg">
                  <span className="kbd-key">⌘</span>
                  <span className="kbd-key">K</span>
                  <span className="text-caption">Open command palette</span>
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <Section eyebrow="01 · Typography" title="Editorial voice, operational clarity.">
        <div className="grid gap-10">
          <div className="surface-card p-8 md:p-12">
            <div className="text-subheading mb-4">Display · Instrument Serif</div>
            <div className="text-display">
              From raw idea <span className="italic text-muted-foreground">to</span>{" "}
              shipped artifact.
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="surface-card p-8">
              <div className="text-subheading mb-3">Heading 1</div>
              <p className="text-heading-1">The document is the hero.</p>
              <div className="text-subheading mt-8 mb-3">Heading 2</div>
              <p className="text-heading-2">Motion exists to explain state.</p>
              <div className="text-subheading mt-8 mb-3">Heading 3</div>
              <p className="text-heading-3">Every artifact is connected.</p>
            </div>
            <div className="surface-card p-8">
              <div className="text-subheading mb-3">Body</div>
              <p className="text-body text-muted-foreground">
                IdeaGate believes that great products emerge from disciplined
                thinking rather than isolated documents. Every artifact is
                connected; every decision has context.
              </p>
              <div className="text-subheading mt-8 mb-3">Caption</div>
              <p className="text-caption">
                Last edited by Ana · 2 minutes ago · Draft v3
              </p>
              <div className="text-subheading mt-8 mb-3">Label</div>
              <p className="text-label text-muted-foreground">Discovery · Lifecycle Stage 02</p>
              <div className="text-subheading mt-8 mb-3">Code</div>
              <pre className="text-code panel-inset p-3">
                <span className="text-accent">const</span> artifact ={" "}
                <span className="text-accent">await</span> gate.synthesize(idea);
              </pre>
            </div>
          </div>
        </div>
      </Section>

      {/* Color */}
      <Section eyebrow="02 · Colour" title="A restrained palette. Signal, not saturation.">
        <div className="grid gap-10">
          <div>
            <div className="text-subheading mb-4">Neutral scale · Ink</div>
            <div className="grid grid-cols-6 gap-3 md:grid-cols-11">
              {[
                ["50", "bg-ink-50", true],
                ["100", "bg-ink-100", true],
                ["200", "bg-ink-200"],
                ["300", "bg-ink-300"],
                ["400", "bg-ink-400"],
                ["500", "bg-ink-500"],
                ["600", "bg-ink-600"],
                ["700", "bg-ink-700"],
                ["800", "bg-ink-800"],
                ["900", "bg-ink-900"],
                ["950", "bg-ink-950"],
              ].map(([n, cls, border]) => (
                <div key={n as string}>
                  <div
                    className={`aspect-square rounded-md ${cls as string} ${
                      border ? "border border-border" : ""
                    }`}
                  />
                  <div className="mt-1.5 text-code text-muted-foreground">
                    {n as string}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-subheading mb-4">Semantic surfaces</div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Swatch name="Background" varName="--background" className="bg-background" border />
              <Swatch name="Surface" varName="--surface" className="bg-surface" border />
              <Swatch name="Sunken" varName="--surface-sunken" className="bg-surface-sunken" border />
              <Swatch name="Muted" varName="--muted" className="bg-muted" border />
            </div>
          </div>

          <div>
            <div className="text-subheading mb-4">Semantic signals</div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Swatch name="Primary" varName="--primary" className="bg-primary" />
              <Swatch name="Accent" varName="--accent" className="bg-accent" />
              <Swatch name="Success" varName="--success" className="bg-success" />
              <Swatch name="Warning" varName="--warning" className="bg-warning" />
              <Swatch name="Destructive" varName="--destructive" className="bg-destructive" />
            </div>
          </div>
        </div>
      </Section>

      {/* Tokens */}
      <Section eyebrow="03 · Tokens" title="Space, radius, elevation, motion.">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Spacing */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-1">Spacing scale</div>
            <p className="text-caption mb-6">Based on a 4px rhythm.</p>
            <div className="space-y-3">
              {[
                ["1", "4px", "w-1"],
                ["2", "8px", "w-2"],
                ["3", "12px", "w-3"],
                ["4", "16px", "w-4"],
                ["6", "24px", "w-6"],
                ["8", "32px", "w-8"],
                ["12", "48px", "w-12"],
                ["16", "64px", "w-16"],
                ["24", "96px", "w-24"],
              ].map(([k, px, cls]) => (
                <div key={k as string} className="flex items-center gap-4">
                  <div className="text-code w-6 text-muted-foreground">{k}</div>
                  <div className={`h-2 rounded-sm bg-accent ${cls as string}`} />
                  <div className="text-caption">{px}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-1">Radius</div>
            <p className="text-caption mb-6">Restrained curvature.</p>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
              {[
                ["xs", "rounded-xs"],
                ["sm", "rounded-sm"],
                ["md", "rounded-md"],
                ["lg", "rounded-lg"],
                ["xl", "rounded-xl"],
              ].map(([n, cls]) => (
                <div key={n as string}>
                  <div
                    className={`aspect-square border border-border bg-secondary ${cls as string}`}
                  />
                  <div className="mt-2 text-code text-muted-foreground">{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Elevation */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-1">Elevation</div>
            <p className="text-caption mb-6">Soft, editorial shadows.</p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
              {[
                ["xs", "shadow-[var(--shadow-xs)]"],
                ["sm", "shadow-[var(--shadow-sm)]"],
                ["md", "shadow-[var(--shadow-md)]"],
                ["lg", "shadow-[var(--shadow-lg)]"],
                ["xl", "shadow-[var(--shadow-xl)]"],
              ].map(([n, cls]) => (
                <div key={n as string} className="pb-2">
                  <div
                    className={`aspect-square rounded-lg border border-border bg-surface-elevated ${cls as string}`}
                  />
                  <div className="mt-3 text-code text-muted-foreground">{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-1">Motion</div>
            <p className="text-caption mb-6">
              Every transition uses <code className="text-code">--ease-standard</code>{" "}
              or <code className="text-code">--ease-out</code>.
            </p>
            <div className="space-y-3 text-ui">
              {[
                ["instant", "80ms", "hover, press"],
                ["fast", "140ms", "tooltips, menus"],
                ["base", "220ms", "panels, dialogs"],
                ["slow", "340ms", "page enter"],
                ["slower", "520ms", "hero reveals"],
              ].map(([n, d, use]) => (
                <div
                  key={n as string}
                  className="flex items-center justify-between border-b border-border py-2 last:border-b-0"
                >
                  <div className="text-code text-foreground">{n as string}</div>
                  <div className="text-caption">{use as string}</div>
                  <div className="text-code text-muted-foreground">{d as string}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Components */}
      <Section eyebrow="04 · Primitives" title="Components that recede so content leads.">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Buttons */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-6">Buttons</div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="primary">Publish artifact</Btn>
              <Btn variant="secondary">Save draft</Btn>
              <Btn variant="ghost">Cancel</Btn>
              <Btn variant="accent">Run agent</Btn>
              <Btn variant="destructive">Delete</Btn>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Btn size="sm">Small</Btn>
              <Btn size="md">Medium</Btn>
              <Btn size="lg">Large</Btn>
            </div>
          </div>

          {/* Inputs */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-6">Inputs</div>
            <div className="space-y-4">
              <div>
                <label className="text-label mb-2 block text-muted-foreground">
                  Artifact title
                </label>
                <input
                  defaultValue="Retention discovery — Q3"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-[14px] transition-shadow duration-[var(--duration-fast)] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-label mb-2 block text-muted-foreground">
                  Summary
                </label>
                <textarea
                  rows={3}
                  defaultValue="Structured hypothesis about churn signals across activation stages."
                  className="w-full resize-none rounded-md border border-input bg-surface px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Badges & Agent chips */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-6">Badges & agent chips</div>
            <div className="flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="success" dot>
                Ready
              </Badge>
              <Badge tone="info" dot>
                Reviewing
              </Badge>
              <Badge tone="warning">Needs input</Badge>
              <Badge tone="destructive">Blocked</Badge>
              <Badge tone="accent" dot>
                Agent · Coordinator
              </Badge>
            </div>
          </div>

          {/* Progress + skeleton */}
          <div className="surface-card p-8">
            <div className="text-heading-3 mb-6">Progress & loading</div>
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-caption">
                <span>Synthesizing artifact</span>
                <span className="text-code">62%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-[var(--duration-slower)] ease-[var(--ease-out)]"
                  style={{ width: "62%" }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-3 w-5/6" />
            </div>
          </div>
        </div>

        {/* Command palette mock */}
        <div className="mt-10">
          <div className="text-subheading mb-4">Command palette</div>
          <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-xl)]">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="h-1.5 w-1.5 rounded-full pulse-dot bg-accent" />
              <input
                placeholder="Search artifacts, agents, and stages…"
                className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
              <span className="kbd-key">esc</span>
            </div>
            <ul className="p-2 text-[13px]">
              {[
                ["Create new artifact", "Discovery", "N"],
                ["Invoke coordinator", "Agent", "⏎"],
                ["Open lifecycle map", "View", "L"],
                ["Review pending decisions", "Inbox", "R"],
              ].map(([label, cat, key]) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-muted"
                >
                  <span className="text-foreground">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-caption">{cat}</span>
                    <span className="kbd-key">{key}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section eyebrow="05 · Layout" title="A 12-column rhythm. Whitespace as material.">
        <div className="surface-card overflow-hidden">
          <div className="grid grid-cols-12 gap-px bg-border">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex h-16 items-center justify-center bg-surface-elevated text-code text-muted-foreground"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-12 gap-4 p-6">
            <div className="col-span-3 h-24 rounded-md bg-secondary" />
            <div className="col-span-6 h-24 rounded-md bg-accent-soft" />
            <div className="col-span-3 h-24 rounded-md bg-secondary" />
            <div className="col-span-8 h-16 rounded-md bg-muted" />
            <div className="col-span-4 h-16 rounded-md bg-muted" />
          </div>
        </div>
      </Section>

      {/* CLI / Mission control */}
      <Section
        eyebrow="06 · Operational surface"
        title="Command-line DNA, reinterpreted as a calm graphical environment."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Execution timeline */}
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-operational pulse-dot" />
                <span className="text-ui text-foreground">gate.run · discovery/retention-q3</span>
              </div>
              <span className="status-rail">
                <span className="h-1 w-1 rounded-full bg-operational" />
                running · 00:04:12
              </span>
            </div>
            <ol className="divide-y divide-border">
              {[
                { t: "00:00", label: "Ingest brief", state: "done", agent: "coordinator" },
                { t: "00:41", label: "Synthesize hypothesis tree", state: "done", agent: "researcher" },
                { t: "02:07", label: "Draft artifact · problem framing", state: "done", agent: "writer" },
                { t: "03:55", label: "Review internal contradictions", state: "running", agent: "critic" },
                { t: "—", label: "Compose stakeholder digest", state: "queued", agent: "editor" },
              ].map((step) => {
                const dot =
                  step.state === "running"
                    ? "bg-operational pulse-dot"
                    : step.state === "done"
                      ? "bg-success"
                      : "bg-muted-foreground/40";
                return (
                  <li key={step.label} className="grid grid-cols-[64px_12px_1fr_auto] items-center gap-3 px-5 py-3">
                    <span className="text-code text-muted-foreground">{step.t}</span>
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className="text-ui text-foreground">{step.label}</span>
                    <span className="text-caption font-mono">{step.agent}</span>
                  </li>
                );
              })}
            </ol>
            <div className="border-t border-border p-4">
              <div className="mb-2 flex items-center justify-between text-caption">
                <span>Stage 04 · Review</span>
                <span className="text-code">running</span>
              </div>
              <div className="execution-bar h-1 w-full rounded-full">
                <div className="execution-bar-scan" />
              </div>
            </div>
          </div>

          {/* Structured logs */}
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-ui text-foreground">logs · stream</span>
              <div className="flex items-center gap-2">
                <span className="status-rail">tail -f</span>
                <span className="kbd-key">L</span>
              </div>
            </div>
            <div className="max-h-[320px] overflow-hidden px-5 py-4">
              {[
                { lvl: "INFO", tone: "text-muted-foreground", msg: "coordinator resolved dependency graph (12 nodes)" },
                { lvl: "INFO", tone: "text-muted-foreground", msg: "researcher opened source · segment_metrics.csv" },
                { lvl: "OK  ", tone: "text-success", msg: "writer emitted artifact draft (v3)" },
                { lvl: "WARN", tone: "text-warning", msg: "critic flagged 2 contradictions in section 03" },
                { lvl: "INFO", tone: "text-muted-foreground", msg: "editor queued · compose stakeholder digest" },
                { lvl: "RUN ", tone: "text-operational", msg: "critic reviewing artifact.retention-q3" },
              ].map((l, i) => (
                <div key={i} className="log-line grid grid-cols-[52px_44px_1fr] gap-3">
                  <span className="text-muted-foreground">{String((i + 1) * 41).padStart(4, "0")}</span>
                  <span className={l.tone}>{l.lvl}</span>
                  <span className="text-foreground/80">{l.msg}</span>
                </div>
              ))}
              <div className="log-line mt-1 flex items-center gap-2 text-operational">
                <span>›</span>
                <span>gate</span>
                <span className="cli-caret" />
              </div>
            </div>
          </div>

          {/* Agent grid */}
          <div className="surface-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-heading-3">Agents</div>
              <span className="text-caption">4 online · 1 idle</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "coordinator", role: "Orchestration", state: "running" },
                { name: "researcher", role: "Evidence", state: "running" },
                { name: "writer", role: "Composition", state: "idle" },
                { name: "critic", role: "Review", state: "running" },
              ].map((a) => {
                const tone =
                  a.state === "running"
                    ? "bg-operational-soft text-operational border-operational/30"
                    : "bg-secondary text-muted-foreground border-border";
                return (
                  <div key={a.name} className="rounded-lg border border-border bg-surface-elevated p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-ui text-foreground">{a.name}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${tone}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.state === "running" ? "bg-operational pulse-dot" : "bg-muted-foreground/60"}`} />
                        {a.state}
                      </span>
                    </div>
                    <div className="text-caption mt-1">{a.role}</div>
                    <div className="mt-4 execution-bar h-0.5 w-full rounded-full">
                      {a.state === "running" && <div className="execution-bar-scan" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System status rail */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-sunken px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-operational pulse-dot" />
              system · nominal
            </span>
            <span>lifecycle · 04 / 07</span>
            <span>queue · 2</span>
            <span>latency · 84ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span>press</span>
            <span className="kbd-key">⌘</span>
            <span className="kbd-key">K</span>
            <span>for commands</span>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <span className="font-serif text-[17px] leading-none">I</span>
            </div>
            <span className="text-caption">
              IdeaGate · Foundation v2.0 · Phase 01
            </span>
          </div>
          <span className="text-caption">
            No product screens are built in this phase. Future phases consume this
            foundation.
          </span>
        </div>
      </footer>
    </div>
  );
}
