import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/mission-control")({
  head: () => ({
    meta: [
      { title: "Mission Control — IdeaGate" },
      {
        name: "description",
        content:
          "The command bridge of your Product Operating System. Watch agents, artifacts, decisions and lifecycle health evolve in real time.",
      },
      { property: "og:title", content: "Mission Control — IdeaGate" },
      {
        property: "og:description",
        content:
          "The command bridge of IdeaGate. Live lifecycle, agents, artifacts and decisions in one calm operational surface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionControl,
});

/* ────────────────────────────────────────────────────────────────
 *  Mission Control — the first product surface of IdeaGate
 *  Editorial · Operational · Calm · Alive
 *
 *  Backend mapping (every visible surface below binds to one of these):
 *    HeroJourney       → journey_runs                (current stage, progress, ETA)
 *    OrchestrationLayer→ coordinator_state + agent_runs + artifact_versions
 *                        + validation + decision_log (runtime graph)
 *    ActiveAgents      → agent_runs                  (per-agent live state)
 *    RecentArtifacts   → artifact_versions           (latest per artifact)
 *    DecisionsPanel    → decision_log                (open + recent decisions)
 *    WorkspaceHealth   → analytics (aggregated)      (lifecycle coverage, contradiction load)
 *    MissionLog        → journey_events (stream)     (channel = agent code)
 *    SystemRail        → coordinator_state + analytics
 *    Inspector         → detail read for any of the above (universal viewer)
 * ──────────────────────────────────────────────────────────────── */

/* ─── Universal Inspector context ─────────────────────────────────
 * Any surface that can be "inspected" calls useInspector().open(...)
 * The <Inspector /> lives once at the root of Mission Control and
 * animates in from the right. Same component visualises every entity
 * kind — it is the universal detail read for the Product OS. */

type Inspectable =
  | { kind: "journey"; id: string }
  | { kind: "agent"; code: string }
  | { kind: "artifact"; id: string }
  | { kind: "decision"; id: string }
  | { kind: "validation"; id: string };

const InspectorContext = createContext<{ open: (i: Inspectable) => void }>({
  open: () => {},
});
const useInspector = () => useContext(InspectorContext);

function MissionControl() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<Inspectable | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <InspectorContext.Provider value={{ open: setSelected }}>
    <div className="dark relative min-h-screen overflow-x-hidden" style={{ background: "var(--surface-op-sunken)", color: "var(--foreground)" }}>
      <AmbientAtmosphere />

      <div className="relative z-10 flex min-h-screen">
        <MissionSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <MissionTopbar now={now} onOpenPalette={() => setPaletteOpen(true)} />

          <main className="mx-auto w-full max-w-[1400px] px-8 pb-24 pt-8">
            <HeroJourney />

            <div className="mt-10">
              <OrchestrationLayer />
            </div>

            <div className="mt-10 grid grid-cols-12 gap-6">
              <section className="col-span-12 xl:col-span-8">
                <ActiveAgents />
              </section>
              <section className="col-span-12 xl:col-span-4">
                <WorkspaceHealth />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <RecentArtifacts />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <DecisionsPanel />
              </section>

              <section className="col-span-12">
                <MissionLog />
              </section>
            </div>
          </main>

          <SystemRail now={now} />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Inspector selected={selected} onClose={() => setSelected(null)} />
    </div>
    </InspectorContext.Provider>
  );
}

/* ─────────────────────────── Ambient atmosphere ─────────────────────────── */

function AmbientAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -left-[15%] -top-[20%] h-[70vh] w-[70vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--operational) 18%, transparent), transparent 70%)",
          filter: "blur(80px)",
          animation: "ig-aurora-a 40s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -right-[10%] top-[10%] h-[60vh] w-[60vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--info) 14%, transparent), transparent 70%)",
          filter: "blur(90px)",
          animation: "ig-aurora-a 55s ease-in-out infinite alternate-reverse",
        }}
      />
      {/* precision grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
        }}
      />
      {/* grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
        <filter id="mc-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mc-noise)" />
      </svg>
    </div>
  );
}

/* ─────────────────────────── Sidebar ─────────────────────────── */

const SIDEBAR_SECTIONS: {
  label: string;
  items: { id: string; label: string; kbd?: string; href?: string; active?: boolean; badge?: string }[];
}[] = [
  {
    label: "Workspace",
    items: [
      { id: "control", label: "Mission Control", kbd: "M", active: true },
      { id: "intelligence", label: "Intelligence & Quality", kbd: "I", href: "/intelligence", badge: "7" },
      { id: "insights", label: "Insights & Performance", kbd: "P", href: "/insights" },
      { id: "journey", label: "Journeys", kbd: "J" },
      { id: "artifacts", label: "Artifacts", kbd: "A", badge: "12" },
      { id: "agents", label: "Agents", kbd: "G" },
      { id: "decisions", label: "Decisions", kbd: "D", badge: "3" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "signals", label: "Signals" },
      { id: "research", label: "Research desk" },
      { id: "critiques", label: "Critiques" },
    ],
  },
  {
    label: "Product",
    items: [
      { id: "atlas", label: "Nimbus Atlas", active: false },
      { id: "sprint", label: "Q3 Reforge" },
    ],
  },
];

function MissionSidebar() {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r lg:flex"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--surface-op) 92%, transparent), color-mix(in oklab, var(--surface-op-sunken) 92%, transparent))",
        borderColor: "var(--border-op)",
      }}
    >
      <Link to="/" className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <LogoGlyph />
        <div className="flex flex-col leading-none">
          <span className="text-ui text-foreground">IdeaGate</span>
          <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
            product os · v0.3
          </span>
        </div>
      </Link>

      <div className="mx-4 my-2 h-px" style={{ background: "var(--border-op)" }} />

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {SIDEBAR_SECTIONS.map((s) => (
          <div key={s.label} className="mb-5">
            <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>
              {s.label}
            </div>
            <ul className="space-y-0.5">
              {s.items.map((it) => (
                <li key={it.id}>
                  {(() => {
                    const className = `group relative flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                      it.active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`;
                    const style = {
                      background: it.active
                        ? "color-mix(in oklab, var(--operational) 10%, transparent)"
                        : "transparent",
                    } as const;
                    const inner = (<>
                    {it.active ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-1 left-0 w-[2px] rounded-full"
                        style={{
                          background: "var(--operational)",
                          boxShadow: "0 0 8px var(--operational)",
                        }}
                      />
                    ) : null}
                    <span className="text-ui truncate pl-2">{it.label}</span>
                    <span className="flex items-center gap-1.5">
                      {it.badge ? (
                        <span
                          className="text-code rounded-full px-1.5 py-px"
                          style={{
                            background: "color-mix(in oklab, var(--warning) 20%, transparent)",
                            color: "var(--warning)",
                            fontSize: 10,
                          }}
                        >
                          {it.badge}
                        </span>
                      ) : null}
                      {it.kbd ? (
                        <span
                          className="text-code opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          style={{ fontSize: 10 }}
                        >
                          {it.kbd}
                        </span>
                      ) : null}
                    </span>
                    </>);
                    return it.href ? (
                      <Link to={it.href} className={className} style={style}>{inner}</Link>
                    ) : (
                      <button className={className} style={style}>{inner}</button>
                    );
                  })()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t px-3 py-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-full text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, var(--operational), color-mix(in oklab, var(--info) 60%, var(--operational)))",
            }}
          >
            <span className="text-ui" style={{ fontSize: 11 }}>
              EA
            </span>
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-ui truncate text-foreground" style={{ fontSize: 12 }}>
              Elena Aoki
            </div>
            <div className="text-code truncate text-muted-foreground" style={{ fontSize: 10 }}>
              product lead · nimbus
            </div>
          </div>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
        </div>
      </div>
    </aside>
  );
}

function LogoGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="20" height="20" rx="5" stroke="var(--border-strong)" />
      <path d="M6 11h6M12 7l4 4-4 4" stroke="var(--operational)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────── Topbar ─────────────────────────── */

function MissionTopbar({ now, onOpenPalette }: { now: Date; onOpenPalette: () => void }) {
  const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-8"
      style={{
        background: "color-mix(in oklab, var(--surface-op) 78%, transparent)",
        backdropFilter: "saturate(140%) blur(14px)",
        borderColor: "var(--border-op)",
      }}
    >
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-code" style={{ fontSize: 11 }}>
          workspace
        </span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui text-foreground" style={{ fontSize: 13 }}>
          Nimbus Atlas
        </span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui" style={{ fontSize: 13 }}>
          Mission Control
        </span>
        <span
          className="ml-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5"
          style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--operational) 8%, transparent)" }}
        >
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
          <span className="text-code" style={{ fontSize: 10, color: "var(--operational)" }}>
            LIVE
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          className="group inline-flex items-center gap-3 rounded-md border px-3 py-1.5 transition-colors hover:text-foreground"
          style={{ borderColor: "var(--border-op)", color: "var(--muted-foreground)" }}
        >
          <span className="text-ui" style={{ fontSize: 12 }}>
            Command anything
          </span>
          <span className="flex items-center gap-1">
            <span className="kbd-key">⌘</span>
            <span className="kbd-key">K</span>
          </span>
        </button>
        <div
          className="text-code hidden items-center gap-2 rounded-md border px-2.5 py-1.5 md:inline-flex"
          style={{ borderColor: "var(--border-op)", color: "var(--muted-foreground)", fontSize: 11 }}
        >
          <span>utc</span>
          <span className="tabular-nums text-foreground">{time}</span>
        </div>
        <Link
          to="/"
          className="text-ui rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Exit
        </Link>
      </div>
    </header>
  );
}

/* ─────────────────────────── Hero: Current Journey ─────────────────────────── */

const LIFECYCLE_STAGES = [
  { key: "signal", label: "Signal" },
  { key: "shape", label: "Shape" },
  { key: "define", label: "Define" },
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "ship", label: "Ship" },
];

function HeroJourney() {
  const inspector = useInspector();
  // animated progress
  const [progress, setProgress] = useState(58);
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => (p < 63 ? p + 0.1 : p)), 300);
    return () => clearInterval(t);
  }, []);
  const currentStageIndex = 3; // Design

  return (
    <section
      className="animate-in-up relative overflow-hidden rounded-2xl border p-8"
      style={{
        borderColor: "var(--border-op)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--surface-op-elevated) 92%, transparent), color-mix(in oklab, var(--surface-op) 92%, transparent))",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* corner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--operational) 30%, transparent), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--operational) 60%, transparent), transparent)",
        }}
      />

      <div className="relative grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-label" style={{ fontSize: 10 }}>
              current journey
            </span>
            <span className="text-code" style={{ fontSize: 10 }}>·</span>
            <span className="text-code" style={{ fontSize: 10 }}>
              JRN-014
            </span>
          </div>
          <h1
            className="mt-3 text-foreground"
            style={{ fontFamily: "var(--font-serif)", fontSize: "2.75rem", lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            Reforge the onboarding
            <br />
            for enterprise teams
          </h1>
          <p className="text-body mt-4 max-w-[52ch] text-muted-foreground">
            Six agents have converged on the <span className="text-foreground">Design</span> stage.
            Two specifications are ready for your review, one contradiction awaits a decision.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md px-4 py-2 text-primary-foreground transition-transform hover:-translate-y-px"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--operational) 100%, transparent), color-mix(in oklab, var(--operational) 80%, black))",
                boxShadow:
                  "0 8px 24px -8px color-mix(in oklab, var(--operational) 60%, transparent), inset 0 1px 0 color-mix(in oklab, white 24%, transparent)",
              }}
            >
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
              <span className="text-ui" style={{ fontSize: 13 }}>
                Continue journey
              </span>
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
            <button
              className="text-ui inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-foreground transition-colors hover:border-foreground/40"
              style={{ borderColor: "var(--border-op)", background: "transparent", fontSize: 13 }}
              onClick={() => inspector.open({ kind: "journey", id: "JRN-014" })}
            >
              Inspect journey
            </button>
            <div className="text-code ml-1 flex items-center gap-2 text-muted-foreground" style={{ fontSize: 11 }}>
              <span>ETA</span>
              <span className="text-foreground tabular-nums">4d · 06h</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div
            className="relative rounded-xl border p-5"
            style={{
              borderColor: "var(--border-op)",
              background: "color-mix(in oklab, var(--surface-op-sunken) 60%, transparent)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-label text-muted-foreground" style={{ fontSize: 10 }}>
                lifecycle
              </span>
              <span className="text-code tabular-nums text-foreground" style={{ fontSize: 11 }}>
                {progress.toFixed(0)}%
              </span>
            </div>

            <div className="execution-bar mt-3 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, color-mix(in oklab, var(--operational) 80%, transparent), var(--operational))",
                  transition: "width 400ms var(--ease-standard)",
                }}
              />
            </div>

            <ol className="mt-6 flex items-center justify-between">
              {LIFECYCLE_STAGES.map((s, i) => {
                const done = i < currentStageIndex;
                const active = i === currentStageIndex;
                return (
                  <li key={s.key} className="flex flex-col items-center gap-2">
                    <span
                      className="relative grid h-5 w-5 place-items-center rounded-full"
                      style={{
                        background: done
                          ? "var(--operational)"
                          : active
                            ? "color-mix(in oklab, var(--operational) 20%, transparent)"
                            : "var(--surface-op)",
                        border: `1px solid ${active ? "var(--operational)" : "var(--border-op)"}`,
                        boxShadow: active ? "0 0 0 4px color-mix(in oklab, var(--operational) 20%, transparent)" : "none",
                      }}
                    >
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path d="M2 5.5l2 2 4-5" fill="none" stroke="var(--operational-foreground)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : active ? (
                        <span className="pulse-dot h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
                      ) : null}
                    </span>
                    <span
                      className="text-code"
                      style={{
                        fontSize: 10,
                        color: active ? "var(--foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <MiniStat label="Artifacts" value="42" trend="+6" />
              <MiniStat label="Decisions" value="11" trend="3 pending" tone="warn" />
              <MiniStat label="Confidence" value="87%" trend="+4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, trend, tone }: { label: string; value: string; trend: string; tone?: "warn" }) {
  return (
    <div>
      <div className="text-label text-muted-foreground" style={{ fontSize: 9 }}>
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="tabular-nums text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1 }}>
          {value}
        </span>
        <span
          className="text-code"
          style={{
            fontSize: 10,
            color: tone === "warn" ? "var(--warning)" : "var(--operational)",
          }}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Active Agents ─────────────────────────── */

type Agent = {
  code: string;
  name: string;
  role: string;
  state: "running" | "reviewing" | "idle" | "queued" | "blocked";
  task: string;
  load: number; // 0-1
  tokens: number;
  since: string;
};

const AGENTS: Agent[] = [
  { code: "R-01", name: "Researcher", role: "signal · evidence", state: "running", task: "Synthesising 18 discovery interviews", load: 0.82, tokens: 14320, since: "2m" },
  { code: "S-01", name: "Strategist", role: "shape · framing", state: "reviewing", task: "Weighing three positioning tracks", load: 0.51, tokens: 9840, since: "5m" },
  { code: "U-01", name: "UX", role: "design · flows", state: "running", task: "Redrafting the empty-state pattern", load: 0.66, tokens: 6410, since: "1m" },
  { code: "A-01", name: "Architect", role: "build · systems", state: "queued", task: "Awaiting design tokens hand-off", load: 0.12, tokens: 0, since: "—" },
  { code: "Q-01", name: "QA", role: "review · integrity", state: "blocked", task: "Contradiction on onboarding scope", load: 0.0, tokens: 0, since: "9m" },
  { code: "C-01", name: "Coordinator", role: "conductor", state: "running", task: "Rebalancing agent workload", load: 0.34, tokens: 2210, since: "12m" },
];

function ActiveAgents() {
  return (
    <SectionShell
      eyebrow="active agents"
      title="Six minds, one workspace"
      meta="4 running · 1 queued · 1 blocked"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a) => (
          <AgentCard key={a.code} agent={a} />
        ))}
      </div>
    </SectionShell>
  );
}

function AgentCard({ agent: a }: { agent: Agent }) {
  const stateColor: Record<Agent["state"], string> = {
    running: "var(--operational)",
    reviewing: "var(--info)",
    idle: "var(--muted-foreground)",
    queued: "var(--muted-foreground)",
    blocked: "var(--destructive)",
  };
  const isLive = a.state === "running";
  const isReviewing = a.state === "reviewing";
  const streaming = isLive || isReviewing;

  // Live token counter — increments while the agent is actively working.
  const [tokens, setTokens] = useState(a.tokens);
  useEffect(() => {
    if (!streaming) return;
    const rate = Math.round(30 + a.load * 220); // tokens per tick
    const t = setInterval(() => setTokens((v) => v + Math.round(rate * (0.6 + Math.random() * 0.8))), 1200);
    return () => clearInterval(t);
  }, [streaming, a.load]);

  // Micro confidence delta — occasional small drift while running.
  const [delta, setDelta] = useState<{ v: number; k: number } | null>(null);
  useEffect(() => {
    if (!isLive) return;
    let k = 0;
    const t = setInterval(() => {
      k += 1;
      const sign = Math.random() > 0.35 ? 1 : -1;
      setDelta({ v: sign * (Math.random() < 0.5 ? 1 : 2), k });
    }, 4200);
    return () => clearInterval(t);
  }, [isLive]);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border p-4 transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border-op)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--surface-op-elevated) 88%, transparent), color-mix(in oklab, var(--surface-op) 88%, transparent))",
      }}
    >
      {isLive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--operational) 70%, transparent), transparent)",
          }}
        />
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`grid h-8 w-8 place-items-center rounded-md ${isLive ? "heartbeat" : ""}`}
            style={{
              background: `color-mix(in oklab, ${stateColor[a.state]} 14%, transparent)`,
              border: `1px solid color-mix(in oklab, ${stateColor[a.state]} 32%, transparent)`,
            }}
          >
            <span className="text-code" style={{ fontSize: 10, color: stateColor[a.state] }}>
              {a.code}
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-ui text-foreground" style={{ fontSize: 13 }}>
              {a.name}
            </div>
            <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
              {a.role}
            </div>
          </div>
        </div>
        <StateBadge state={a.state} />
      </div>

      <div className="mt-4 min-h-[2.5em]">
        <div className="text-caption text-foreground/85">
          {a.task}
          {streaming ? <span className="cli-caret ml-0.5 align-baseline" /> : null}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end gap-0.5">
          {Array.from({ length: 18 }).map((_, i) => {
            const active = i / 18 < a.load;
            const h = 4 + Math.round(((i * 37) % 11) + (active ? 4 : 0));
            return (
              <span
                key={i}
                className={`w-1 rounded-sm ${isLive && active ? "breathe" : ""}`}
                style={{
                  height: h,
                  background: active ? stateColor[a.state] : "color-mix(in oklab, var(--foreground) 8%, transparent)",
                  opacity: active ? 0.9 : 0.6,
                  transition: "background 220ms var(--ease-standard)",
                  animationDelay: `${(i % 6) * 120}ms`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="text-code flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 10 }}>
          <span className="tabular-nums text-foreground/80">{tokens.toLocaleString()}</span>
          <span>tok</span>
          {streaming ? (
            <span
              className="tabular-nums"
              style={{ color: "var(--operational)" }}
            >
              ▲
            </span>
          ) : null}
        </div>
        <div className="text-code flex items-center gap-2 text-muted-foreground" style={{ fontSize: 10 }}>
          {delta ? (
            <span
              key={delta.k}
              className="animate-in-fade tabular-nums"
              style={{ color: delta.v >= 0 ? "var(--operational)" : "var(--warning)" }}
            >
              {delta.v >= 0 ? "+" : ""}
              {delta.v}Δconf
            </span>
          ) : null}
          <span>{a.since}</span>
        </div>
      </div>
    </div>
  );
}

function StateBadge({ state }: { state: Agent["state"] }) {
  const map = {
    running: { c: "var(--operational)", label: "running" },
    reviewing: { c: "var(--info)", label: "reviewing" },
    idle: { c: "var(--muted-foreground)", label: "idle" },
    queued: { c: "var(--muted-foreground)", label: "queued" },
    blocked: { c: "var(--destructive)", label: "blocked" },
  }[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5"
      style={{
        borderColor: `color-mix(in oklab, ${map.c} 32%, transparent)`,
        background: `color-mix(in oklab, ${map.c} 10%, transparent)`,
      }}
    >
      <span
        className={state === "running" ? "pulse-dot inline-block h-1.5 w-1.5 rounded-full" : "inline-block h-1.5 w-1.5 rounded-full"}
        style={{ background: map.c }}
      />
      <span className="text-code" style={{ fontSize: 10, color: map.c }}>
        {map.label}
      </span>
    </span>
  );
}

/* ─────────────────────────── Section shell ─────────────────────────── */

function SectionShell({
  eyebrow,
  title,
  meta,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="animate-in-up">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>
            {eyebrow}
          </div>
          <h2
            className="mt-1 text-foreground"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", lineHeight: 1.15, letterSpacing: "-0.015em" }}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {meta ? (
            <span className="text-code hidden text-muted-foreground sm:inline" style={{ fontSize: 11 }}>
              {meta}
            </span>
          ) : null}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────── Workspace Health ─────────────────────────── */

function WorkspaceHealth() {
  const metrics = [
    { label: "Lifecycle coverage", value: 87, tone: "op" as const },
    { label: "AI confidence", value: 92, tone: "op" as const },
    { label: "Artifact completeness", value: 71, tone: "warn" as const },
    { label: "Contradiction load", value: 12, tone: "warn" as const, invert: true },
  ];
  return (
    <SectionShell eyebrow="workspace health" title="Signals across the workspace">
      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--border-op)",
          background: "color-mix(in oklab, var(--surface-op-elevated) 84%, transparent)",
        }}
      >
        <div className="space-y-4">
          {metrics.map((m) => {
            const color = m.tone === "warn" ? "var(--warning)" : "var(--operational)";
            return (
              <div key={m.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-ui text-foreground" style={{ fontSize: 12 }}>
                    {m.label}
                  </span>
                  <span className="text-code tabular-nums" style={{ fontSize: 11, color }}>
                    {m.value}%
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${m.value}%`,
                      background: `linear-gradient(90deg, color-mix(in oklab, ${color} 60%, transparent), ${color})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--border-op)" }}>
          <div className="text-label mb-3 text-muted-foreground" style={{ fontSize: 10 }}>
            needs attention
          </div>
          <ul className="space-y-2.5">
            {[
              { c: "var(--warning)", t: "Missing 'Success Metrics' in Define" },
              { c: "var(--destructive)", t: "Contradiction between UX and Architect" },
              { c: "var(--info)", t: "Two decisions await your review" },
            ].map((r) => (
              <li key={r.t} className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: r.c, boxShadow: `0 0 8px ${r.c}` }}
                />
                <span className="text-caption text-foreground/85">{r.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

/* ─────────────────────────── Recent Artifacts ─────────────────────────── */

type Artifact = {
  id: string;
  kind: string;
  title: string;
  updated: string;
  author: string;
  aiContribution: number;
  confidence: number;
  status: "draft" | "review" | "approved" | "hydrating";
};

const ARTIFACTS: Artifact[] = [
  { id: "spec-014", kind: "spec", title: "Enterprise onboarding — v3 draft", updated: "2m ago", author: "UX-01 + Elena", aiContribution: 68, confidence: 91, status: "review" },
  { id: "res-041", kind: "research", title: "Signal synthesis · 18 interviews", updated: "5m ago", author: "R-01", aiContribution: 94, confidence: 88, status: "approved" },
  { id: "arch-007", kind: "architecture", title: "Token migration plan", updated: "12m ago", author: "A-01", aiContribution: 52, confidence: 77, status: "draft" },
  { id: "brief-002", kind: "brief", title: "Positioning · calm operating layer", updated: "just now", author: "S-01", aiContribution: 71, confidence: 0, status: "hydrating" },
];

function RecentArtifacts() {
  return (
    <SectionShell
      eyebrow="recent artifacts"
      title="Living documents"
      meta="42 in workspace"
      action={
        <button className="text-ui text-muted-foreground transition-colors hover:text-foreground" style={{ fontSize: 12 }}>
          Open library →
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ARTIFACTS.map((a) => (
          <ArtifactCard key={a.id} a={a} />
        ))}
      </div>
    </SectionShell>
  );
}

function ArtifactCard({ a }: { a: Artifact }) {
  const statusColor: Record<Artifact["status"], string> = {
    draft: "var(--muted-foreground)",
    review: "var(--warning)",
    approved: "var(--operational)",
    hydrating: "var(--info)",
  };
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border p-5 transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--border-op)",
        background: "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
          {a.kind} · {a.id}
        </div>
        <span
          className="text-code rounded-full border px-2 py-0.5"
          style={{
            fontSize: 10,
            color: statusColor[a.status],
            borderColor: `color-mix(in oklab, ${statusColor[a.status]} 32%, transparent)`,
            background: `color-mix(in oklab, ${statusColor[a.status]} 10%, transparent)`,
          }}
        >
          {a.status}
        </span>
      </div>

      <div
        className="mt-3 text-foreground"
        style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", lineHeight: 1.2, letterSpacing: "-0.01em" }}
      >
        {a.title}
      </div>

      {a.status === "hydrating" ? (
        <div className="mt-4 space-y-1.5">
          <div className="skeleton h-2 w-11/12 rounded" />
          <div className="skeleton h-2 w-9/12 rounded" />
          <div className="skeleton h-2 w-7/12 rounded" />
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          <div className="log-line" style={{ fontSize: 10 }}>
            <span className="text-foreground/70">§</span> problem framing &nbsp;·&nbsp; personas &nbsp;·&nbsp; flows
          </div>
          <div className="log-line" style={{ fontSize: 10 }}>
            <span className="text-foreground/70">§</span> success metrics &nbsp;·&nbsp; risks
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex items-center gap-3">
          <ContributionDial value={a.aiContribution} />
          <div className="leading-tight">
            <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
              ai contribution
            </div>
            <div className="text-ui text-foreground tabular-nums" style={{ fontSize: 12 }}>
              {a.aiContribution}%
            </div>
          </div>
        </div>
        <div className="text-right leading-tight">
          <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
            {a.author}
          </div>
          <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
            {a.updated}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributionDial({ value }: { value: number }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r={r} fill="none" stroke="color-mix(in oklab, var(--foreground) 12%, transparent)" strokeWidth="2.5" />
      <circle
        cx="15"
        cy="15"
        r={r}
        fill="none"
        stroke="var(--operational)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 15 15)"
      />
    </svg>
  );
}

/* ─────────────────────────── Decisions ─────────────────────────── */

const DECISIONS = [
  { id: "DCN-021", title: "Move 'Teams' before 'Billing' in setup", tone: "review" as const, meta: "requires your review", by: "S-01" },
  { id: "DCN-020", title: "Adopt refined empty-state pattern", tone: "approved" as const, meta: "approved · 08:42", by: "Elena" },
  { id: "DCN-019", title: "Split onboarding into three surfaces", tone: "pending" as const, meta: "pending · 3 threads", by: "Coordinator" },
  { id: "DCN-018", title: "Migrate legacy token palette", tone: "blocked" as const, meta: "blocked by architecture", by: "A-01" },
];

function DecisionsPanel() {
  const toneColor = {
    review: "var(--warning)",
    approved: "var(--operational)",
    pending: "var(--info)",
    blocked: "var(--destructive)",
  } as const;
  return (
    <SectionShell eyebrow="decisions" title="What deserves attention" meta="4 open">
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor: "var(--border-op)",
          background: "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)",
        }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--border-op)" }}>
          {DECISIONS.map((d) => (
            <li
              key={d.id}
              className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
              style={{ borderColor: "var(--border-op)" }}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[2px]"
                style={{ background: toneColor[d.tone] }}
              />
              <div className="min-w-0 flex-1 pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
                    {d.id}
                  </span>
                  <span
                    className="text-code rounded-full px-1.5 py-px"
                    style={{
                      fontSize: 9,
                      color: toneColor[d.tone],
                      background: `color-mix(in oklab, ${toneColor[d.tone]} 12%, transparent)`,
                    }}
                  >
                    {d.tone}
                  </span>
                </div>
                <div className="text-ui mt-1 truncate text-foreground" style={{ fontSize: 13 }}>
                  {d.title}
                </div>
                <div className="text-code mt-0.5 text-muted-foreground" style={{ fontSize: 10 }}>
                  {d.meta} · by {d.by}
                </div>
              </div>
              <span
                aria-hidden
                className="text-ui text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                style={{ fontSize: 13 }}
              >
                →
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

/* ─────────────────────────── Mission Log ─────────────────────────── */

type LogEntry = { t: string; ch: string; kind: string; msg: string; tone?: "op" | "info" | "warn" | "err" };

const LOG_SEED: LogEntry[] = [
  { t: "08:52:14", ch: "R-01", kind: "synth", msg: "clustered 18 interviews → 5 latent needs", tone: "op" },
  { t: "08:53:02", ch: "U-01", kind: "draft", msg: "redrew empty-state — 3 candidate patterns", tone: "info" },
  { t: "08:53:41", ch: "Q-01", kind: "warn", msg: "contradiction: scope disagreement between UX ↔ Architect", tone: "warn" },
  { t: "08:54:10", ch: "C-01", kind: "route", msg: "escalated DCN-021 → product lead", tone: "info" },
  { t: "08:54:47", ch: "S-01", kind: "shape", msg: "positioning tightened around 'calm operating layer'", tone: "op" },
  { t: "08:55:12", ch: "R-01", kind: "cite", msg: "attached 12 source quotes to spec-014", tone: "op" },
  { t: "08:55:44", ch: "U-01", kind: "hand", msg: "handed spec-014 to A-01 for feasibility pass", tone: "info" },
];

function MissionLog() {
  const [entries, setEntries] = useState<LogEntry[]>(LOG_SEED);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // stream new lines periodically
  useEffect(() => {
    const pool: LogEntry[] = [
      { t: "", ch: "R-01", kind: "trace", msg: "read discovery/interview-11.md", tone: "op" },
      { t: "", ch: "A-01", kind: "spec", msg: "proposed token migration in 3 phases", tone: "info" },
      { t: "", ch: "Q-01", kind: "guard", msg: "verified DCN-020 has no downstream conflicts", tone: "op" },
      { t: "", ch: "C-01", kind: "beat", msg: "rebalanced load: U-01 +18%, S-01 -12%", tone: "info" },
      { t: "", ch: "R-01", kind: "note", msg: "added observation: onboarding depth ≠ length", tone: "op" },
    ];
    let i = 0;
    const t = setInterval(() => {
      const now = new Date();
      const stamp = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      const next = { ...pool[i % pool.length], t: stamp };
      i++;
      setEntries((prev) => [...prev.slice(-24), next]);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries]);

  const toneColor = { op: "var(--operational)", info: "var(--info)", warn: "var(--warning)", err: "var(--destructive)" } as const;

  return (
    <SectionShell
      eyebrow="mission log"
      title="Everything the system is thinking"
      meta="streaming · last 30m"
      action={
        <div className="hidden items-center gap-1.5 md:flex">
          {["all", "agents", "artifacts", "decisions"].map((f, i) => (
            <button
              key={f}
              className="text-code rounded-md border px-2 py-1 transition-colors"
              style={{
                fontSize: 10,
                borderColor: "var(--border-op)",
                color: i === 0 ? "var(--foreground)" : "var(--muted-foreground)",
                background: i === 0 ? "color-mix(in oklab, var(--foreground) 5%, transparent)" : "transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      <div
        className="relative overflow-hidden rounded-xl border"
        style={{
          borderColor: "var(--border-op)",
          background: "color-mix(in oklab, var(--surface-op-sunken) 85%, transparent)",
        }}
      >
        {/* scan sweep on top edge */}
        <div className="execution-bar relative h-[2px] w-full">
          <div className="execution-bar-scan" />
        </div>

        <div
          ref={scrollRef}
          className="max-h-[360px] overflow-y-auto px-6 py-5"
          style={{ scrollBehavior: "smooth" }}
        >
          <ul className="space-y-1.5">
            {entries.map((e, i) => (
              <li key={`${e.t}-${i}`} className="log-line flex items-baseline gap-3">
                <span className="tabular-nums" style={{ color: "var(--muted-foreground)", minWidth: 68 }}>
                  {e.t}
                </span>
                <span
                  className="rounded-sm px-1.5"
                  style={{
                    color: e.tone ? toneColor[e.tone] : "var(--muted-foreground)",
                    background: e.tone
                      ? `color-mix(in oklab, ${toneColor[e.tone]} 10%, transparent)`
                      : "transparent",
                    minWidth: 46,
                    textAlign: "center",
                  }}
                >
                  {e.ch}
                </span>
                <span className="text-muted-foreground" style={{ minWidth: 52 }}>
                  {e.kind}
                </span>
                <span className="text-foreground/85">
                  {e.msg}
                  {i === entries.length - 1 ? <span className="cli-caret ml-1 align-baseline" /> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

/* ─────────────────────────── Bottom system rail ─────────────────────────── */

/* ─────────────────────────── Orchestration Layer ─────────────────────────── */

type OrchNode = {
  id: string;
  label: string;
  sub: string;
  x: number; // percent
  y: number; // percent
  state: "running" | "idle" | "queued" | "review" | "blocked";
  count?: string;
};

const ORCH_NODES: OrchNode[] = [
  { id: "coord", label: "Coordinator", sub: "C-01 · dispatch", x: 8, y: 50, state: "running", count: "12/s" },
  { id: "r", label: "Researcher", sub: "R-01 · signal", x: 32, y: 18, state: "running", count: "14.3k" },
  { id: "s", label: "Strategist", sub: "S-01 · shape", x: 32, y: 50, state: "review", count: "9.8k" },
  { id: "u", label: "UX", sub: "U-01 · design", x: 32, y: 82, state: "running", count: "6.4k" },
  { id: "a", label: "Architect", sub: "A-01 · build", x: 32, y: 115, state: "queued" }, // rendered below viewbox unless we extend — cap layout
];

// A simplified, editorial 4-column pipeline (dispatch → agents → artifacts → validation → review → stage advance)
function OrchestrationLayer() {
  return (
    <SectionShell
      eyebrow="orchestration"
      title="How the coordinator moves work through the system"
      meta="live · 4 agents dispatched"
    >
      <div
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{
          borderColor: "var(--border-op)",
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--surface-op-elevated) 92%, transparent), color-mix(in oklab, var(--surface-op) 92%, transparent))",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--operational) 55%, transparent), transparent)",
          }}
        />
        <OrchestrationDiagram />
      </div>
    </SectionShell>
  );
}

function OrchestrationDiagram() {
  // 6 columns: Coordinator · Agents · Artifacts · Validation · Review · Stage
  // Editorial SVG at fixed viewBox — scales responsively.
  const W = 1200;
  const H = 340;

  const cols = [
    { x: 80, label: "coordinator" },
    { x: 310, label: "agents" },
    { x: 560, label: "artifacts" },
    { x: 780, label: "validation" },
    { x: 960, label: "review" },
    { x: 1130, label: "next stage" },
  ];

  const agents = [
    { y: 70, code: "R-01", label: "Researcher", state: "running" as const },
    { y: 140, code: "S-01", label: "Strategist", state: "reviewing" as const },
    { y: 210, code: "U-01", label: "UX", state: "running" as const },
    { y: 280, code: "A-01", label: "Architect", state: "queued" as const },
  ];

  const artifacts = [
    { y: 100, code: "spec-014", state: "hydrating" as const },
    { y: 180, code: "res-041", state: "ready" as const },
    { y: 260, code: "arch-007", state: "ready" as const },
  ];

  const stateColor = (s: string) =>
    s === "running" || s === "ready"
      ? "var(--operational)"
      : s === "reviewing" || s === "hydrating"
        ? "var(--info)"
        : s === "queued"
          ? "var(--muted-foreground)"
          : "var(--warning)";

  return (
    <div className="w-full">
      {/* column headers */}
      <div className="mb-3 grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        {cols.map((c) => (
          <div key={c.label} className="text-label text-muted-foreground" style={{ fontSize: 10, letterSpacing: "0.08em" }}>
            {c.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="block h-[340px] w-full">
        <defs>
          <linearGradient id="edge-op" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="color-mix(in oklab, var(--operational) 10%, transparent)" />
            <stop offset="60%" stopColor="var(--operational)" stopOpacity="0.65" />
            <stop offset="100%" stopColor="color-mix(in oklab, var(--operational) 10%, transparent)" />
          </linearGradient>
          <linearGradient id="edge-info" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="color-mix(in oklab, var(--info) 10%, transparent)" />
            <stop offset="60%" stopColor="var(--info)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="color-mix(in oklab, var(--info) 10%, transparent)" />
          </linearGradient>
          <radialGradient id="node-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--operational)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Coordinator hub */}
        <g transform={`translate(${cols[0].x}, 175)`}>
          <circle r="40" fill="url(#node-glow)" />
          <circle r="22" fill="color-mix(in oklab, var(--surface-op-elevated) 100%, transparent)" stroke="var(--operational)" strokeWidth="1" />
          <circle r="6" fill="var(--operational)">
            <animate attributeName="r" values="5;7;5" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <text y="52" textAnchor="middle" fill="var(--foreground)" style={{ font: "500 12px var(--font-sans, Inter)" }}>Coordinator</text>
          <text y="68" textAnchor="middle" fill="var(--muted-foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>C-01 · dispatch</text>
        </g>

        {/* Coordinator → Agents edges */}
        {agents.map((a, i) => {
          const x1 = cols[0].x + 24;
          const y1 = 175;
          const x2 = cols[1].x - 30;
          const y2 = a.y;
          const cx = (x1 + x2) / 2;
          const d = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
          const active = a.state === "running";
          return (
            <g key={`c2a-${i}`}>
              <path d={d} fill="none" stroke="var(--border-op)" strokeWidth="1" />
              {active ? (
                <path
                  d={d}
                  fill="none"
                  stroke="var(--operational)"
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  className="flow-dash"
                />
              ) : null}
              {active ? (
                <circle r="2.5" fill="var(--operational)">
                  <animateMotion dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" path={d} />
                  <animate attributeName="opacity" values="0;1;1;0" dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" />
                </circle>
              ) : null}
            </g>
          );
        })}

        {/* Agent nodes */}
        {agents.map((a, i) => (
          <g key={a.code} transform={`translate(${cols[1].x}, ${a.y})`}>
            <rect x="-30" y="-14" width="60" height="28" rx="6"
              fill="color-mix(in oklab, var(--surface-op-elevated) 100%, transparent)"
              stroke={`color-mix(in oklab, ${stateColor(a.state)} 40%, transparent)`} />
            <text textAnchor="middle" y="4" fill={stateColor(a.state)} style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>
              {a.code}
            </text>
            {a.state === "running" ? (
              <circle cx="22" cy="-10" r="2" fill="var(--operational)">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
              </circle>
            ) : null}
            <text y="30" textAnchor="middle" fill="var(--muted-foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>
              {a.label.toLowerCase()}
            </text>
          </g>
        ))}

        {/* Agents → Artifacts edges (subset that produce) */}
        {[
          { from: agents[0], to: artifacts[1] },
          { from: agents[2], to: artifacts[0] },
          { from: agents[1], to: artifacts[2] },
        ].map((e, i) => {
          const x1 = cols[1].x + 30;
          const x2 = cols[2].x - 40;
          const y1 = e.from.y;
          const y2 = e.to.y;
          const cx = (x1 + x2) / 2;
          const d = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
          const active = e.from.state === "running" || e.to.state === "hydrating";
          return (
            <g key={`a2f-${i}`}>
              <path d={d} fill="none" stroke="var(--border-op)" strokeWidth="1" />
              {active ? (
                <circle r="2" fill={e.to.state === "hydrating" ? "var(--info)" : "var(--operational)"}>
                  <animateMotion dur={`${2.8 + i * 0.5}s`} repeatCount="indefinite" path={d} />
                </circle>
              ) : null}
            </g>
          );
        })}

        {/* Artifact nodes */}
        {artifacts.map((a) => (
          <g key={a.code} transform={`translate(${cols[2].x}, ${a.y})`}>
            <rect x="-40" y="-12" width="80" height="24" rx="4"
              fill="color-mix(in oklab, var(--surface-op-sunken) 100%, transparent)"
              stroke="var(--border-op)" />
            <text textAnchor="middle" y="4" fill="var(--foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>
              {a.code}
            </text>
            <circle cx="-32" cy="0" r="2.5" fill={stateColor(a.state)}>
              {a.state === "hydrating" ? <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" /> : null}
            </circle>
          </g>
        ))}

        {/* Artifacts → Validation → Review → Stage */}
        {artifacts.map((a, i) => {
          const d1 = `M ${cols[2].x + 40} ${a.y} C ${(cols[2].x + cols[3].x) / 2} ${a.y}, ${(cols[2].x + cols[3].x) / 2} 170, ${cols[3].x - 16} 170`;
          return (
            <g key={`f2v-${i}`}>
              <path d={d1} fill="none" stroke="var(--border-op)" strokeWidth="1" />
              <circle r="2" fill="var(--info)">
                <animateMotion dur={`${3.2 + i * 0.4}s`} repeatCount="indefinite" path={d1} />
                <animate attributeName="opacity" values="0;1;0" dur={`${3.2 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Validation node */}
        <g transform={`translate(${cols[3].x}, 170)`}>
          <rect x="-30" y="-18" width="60" height="36" rx="6"
            fill="color-mix(in oklab, var(--surface-op-elevated) 100%, transparent)"
            stroke="color-mix(in oklab, var(--info) 40%, transparent)" />
          <text textAnchor="middle" y="-2" fill="var(--info)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>Q-01</text>
          <text textAnchor="middle" y="12" fill="var(--muted-foreground)" style={{ font: "9px var(--font-mono, JetBrains Mono)" }}>3 checks</text>
          <text textAnchor="middle" y="34" fill="var(--muted-foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>validation</text>
        </g>

        {/* Validation → Review edge */}
        {(() => {
          const d = `M ${cols[3].x + 30} 170 L ${cols[4].x - 24} 170`;
          return (
            <g>
              <path d={d} fill="none" stroke="var(--border-op)" strokeWidth="1" />
              <circle r="2.5" fill="var(--warning)">
                <animateMotion dur="2.6s" repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })()}

        {/* Review node */}
        <g transform={`translate(${cols[4].x}, 170)`}>
          <circle r="22" fill="color-mix(in oklab, var(--surface-op-elevated) 100%, transparent)" stroke="color-mix(in oklab, var(--warning) 45%, transparent)" />
          <text textAnchor="middle" y="4" fill="var(--warning)" style={{ font: "500 11px var(--font-sans, Inter)" }}>2</text>
          <text y="42" textAnchor="middle" fill="var(--muted-foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>human review</text>
        </g>

        {/* Review → Next stage */}
        {(() => {
          const d = `M ${cols[4].x + 22} 170 L ${cols[5].x - 24} 170`;
          return (
            <g>
              <path d={d} fill="none" stroke="var(--border-op)" strokeWidth="1" strokeDasharray="3 4" />
            </g>
          );
        })()}

        {/* Next stage */}
        <g transform={`translate(${cols[5].x}, 170)`}>
          <rect x="-24" y="-16" width="48" height="32" rx="6"
            fill="transparent"
            stroke="var(--border-op)" strokeDasharray="3 3" />
          <text textAnchor="middle" y="4" fill="var(--muted-foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>Build</text>
          <text y="34" textAnchor="middle" fill="var(--muted-foreground)" style={{ font: "10px var(--font-mono, JetBrains Mono)" }}>advance</text>
        </g>
      </svg>

      {/* legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {[
          { c: "var(--operational)", l: "dispatched / running" },
          { c: "var(--info)", l: "produced / validating" },
          { c: "var(--warning)", l: "awaiting review" },
          { c: "var(--muted-foreground)", l: "queued" },
        ].map((x) => (
          <span key={x.l} className="text-code inline-flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 10 }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: x.c }} />
            {x.l}
          </span>
        ))}
        <span className="text-code ml-auto text-muted-foreground" style={{ fontSize: 10 }}>
          maps to journey_runs → agent_runs → artifact_versions → validation → decision log
        </span>
      </div>
    </div>
  );
}

function SystemRail({ now }: { now: Date }) {
  const uptime = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const s = Math.floor((now.getTime() - start.getTime()) / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    return `${h}h ${m}m`;
  }, [now]);
  return (
    <div
      className="sticky bottom-0 z-20 flex h-9 items-center gap-4 border-t px-8"
      style={{
        background: "color-mix(in oklab, var(--surface-op-sunken) 90%, transparent)",
        borderColor: "var(--border-op)",
        backdropFilter: "blur(10px)",
      }}
    >
      <RailChip label="status" value="nominal" tone="op" />
      <RailChip label="agents" value="4/6 live" />
      <RailChip label="queue" value="1" />
      <RailChip label="latency" value="128ms" />
      <RailChip label="tokens · 1m" value="32.7k" />
      <div className="ml-auto flex items-center gap-4">
        <RailChip label="uptime" value={uptime} />
        <RailChip label="build" value="mc.2026.07.25" />
      </div>
    </div>
  );
}

function RailChip({ label, value, tone }: { label: string; value: string; tone?: "op" }) {
  return (
    <span className="text-code inline-flex items-center gap-2" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
      <span>{label}</span>
      <span
        className="tabular-nums"
        style={{ color: tone === "op" ? "var(--operational)" : "var(--foreground)" }}
      >
        {value}
      </span>
    </span>
  );
}

/* ─────────────────────────── Command Palette ─────────────────────────── */

const PALETTE_ITEMS = [
  { group: "Navigate", label: "Go to Journeys", hint: "G J" },
  { group: "Navigate", label: "Go to Artifacts", hint: "G A" },
  { group: "Navigate", label: "Go to Decisions", hint: "G D" },
  { group: "Create", label: "New journey…", hint: "N J" },
  { group: "Create", label: "New artifact from prompt…", hint: "N A" },
  { group: "Ask", label: "Ask the coordinator…", hint: "?" },
  { group: "Ask", label: "Summarise today", hint: "S T" },
  { group: "Workspace", label: "Toggle theme", hint: "⇧ T" },
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = PALETTE_ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
  const groups = filtered.reduce<Record<string, typeof PALETTE_ITEMS>>((acc, i) => {
    (acc[i.group] ||= []).push(i);
    return acc;
  }, {});

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered.length, onClose]);

  if (!open) return null;

  let flatIndex = -1;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]"
      style={{ background: "color-mix(in oklab, black 55%, transparent)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="animate-in-up w-full max-w-[640px] overflow-hidden rounded-2xl border"
        style={{
          background: "var(--surface-op-elevated)",
          borderColor: "var(--border-op)",
          boxShadow: "0 24px 60px -20px black, 0 0 0 1px color-mix(in oklab, var(--operational) 30%, transparent)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
          <span className="text-code text-muted-foreground" style={{ fontSize: 12 }}>
            ⌘
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            placeholder="Command anything…"
            className="text-ui flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            style={{ fontSize: 14 }}
          />
          <span className="kbd-key">esc</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.entries(groups).map(([g, items]) => (
            <div key={g} className="mb-2">
              <div className="text-label px-3 pb-1 pt-2 text-muted-foreground" style={{ fontSize: 10 }}>
                {g}
              </div>
              <ul>
                {items.map((it) => {
                  flatIndex++;
                  const active = flatIndex === idx;
                  return (
                    <li key={it.label}>
                      <button
                        onMouseEnter={() => setIdx(flatIndex)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left"
                        style={{
                          background: active
                            ? "color-mix(in oklab, var(--operational) 12%, transparent)"
                            : "transparent",
                          color: active ? "var(--foreground)" : "var(--muted-foreground)",
                        }}
                      >
                        <span className="text-ui" style={{ fontSize: 13 }}>
                          {it.label}
                        </span>
                        <span className="text-code" style={{ fontSize: 10 }}>
                          {it.hint}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-caption text-muted-foreground">No matches</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
