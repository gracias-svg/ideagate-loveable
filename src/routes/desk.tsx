import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AGENTS, ARTIFACTS, CATEGORIES, CATEGORY_COLOR, CONFIDENCE_SCORE, MODELS, PRESETS,
  PROJECT_NAME, WORKSPACE_PATH, categoryOf, bodyOf,
  type Artifact, type Category,
} from "@/lib/desk-data";

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: [
      { title: "Desk — IdeaGate artifact library" },
      { name: "description", content: "Desk is where you read every artifact your IdeaGate agents produce across the 15-stage product lifecycle. Browse, filter, and open any artifact." },
      { property: "og:title", content: "Desk — IdeaGate artifact library" },
      { property: "og:description", content: "Read every artifact your agents have produced across the 15-stage product lifecycle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeskPage,
});

/* ═════════════════════════════════════════════════════════════════════════
 *  DESK — read · discover · navigate.   Studio edits. Mission Control watches.
 *
 *  Backend mapping:
 *    IdeaComposer     → lifecycle runner (starts a journey)
 *    Initializing     → journey_events (lifecycle.init.*)
 *    WorkspaceSidebar → workspace filesystem (artifact markdown files)
 *    ArtifactGrid     → artifacts + journey.json stages[N]
 *    Tabs / filters   → derived lifecycle category + stages[N].agent
 *    ReadingView      → persisted artifact markdown
 *    CommandPalette   → artifact index (future: full-text search)
 * ══════════════════════════════════════════════════════════════════════ */

type Origin = { top: number; left: number; width: number; height: number } | null;
const ReaderContext = createContext<{ open: (id: string, origin?: Origin) => void }>({ open: () => {} });
const useReader = () => useContext(ReaderContext);

type Phase = "empty" | "initializing" | "populated";

function DeskPage() {
  const [phase, setPhase] = useState<Phase>("empty");
  const [idea, setIdea] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [readerId, setReaderId] = useState<string | null>(null);
  const [readerOrigin, setReaderOrigin] = useState<Origin>(null);
  const openReader = (id: string, origin: Origin = null) => { setReaderOrigin(origin); setReaderId(id); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      else if (e.key === "Escape") { setPaletteOpen(false); setReaderId(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ReaderContext.Provider value={{ open: openReader }}>
      <div className="dark relative min-h-screen overflow-x-hidden" style={{ background: "var(--surface-op-sunken)", color: "var(--foreground)" }}>
        <DeskBackdrop />
        <div className="relative z-10 flex min-h-screen">
          <DeskSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DeskTopbar phase={phase} onOpenPalette={() => setPaletteOpen(true)} onNewIdea={() => { setIdea(""); setPhase("empty"); }} />
            {phase === "empty" ? (
              <EmptyDesk idea={idea} onIdeaChange={setIdea} onRun={() => setPhase("initializing")} onSkip={() => setPhase("populated")} />
            ) : phase === "initializing" ? (
              <Initializing idea={idea} onDone={() => setPhase("populated")} />
            ) : (
              <PopulatedDesk />
            )}
          </div>
        </div>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenArtifact={(id) => { setPaletteOpen(false); openReader(id); }} />
        <ArtifactReader id={readerId} origin={readerOrigin} onClose={() => setReaderId(null)} />
      </div>
    </ReaderContext.Provider>
  );
}

/** Static grid only — no particles, no decorative motion. */
function DeskBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 78%)" }} />
    </div>
  );
}

/* ─── LEFT NAV RAIL (unchanged) ──────────────────────────────────────── */

type NavItem = { id: string; label: string; kbd?: string; href?: string; active?: boolean; disabled?: boolean };
const DESK_NAV: NavItem[] = [
  { id: "desk", label: "Desk", kbd: "D", href: "/desk", active: true },
  { id: "studio", label: "Studio", kbd: "S", href: "/studio" },
  { id: "mc", label: "Mission Control", kbd: "M", href: "/mission-control" },
  { id: "settings", label: "Settings", kbd: "," },
  { id: "profile", label: "Profile", kbd: "P" },
];

function DeskSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r lg:flex" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--surface-op) 92%, transparent), color-mix(in oklab, var(--surface-op-sunken) 92%, transparent))", borderColor: "var(--border-op)" }}>
      <Link to="/" className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <LogoGlyph />
        <div className="flex flex-col leading-none">
          <span className="text-ui text-foreground">IdeaGate</span>
          <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>product os · v0.3</span>
        </div>
      </Link>
      <div className="mx-4 my-2 h-px" style={{ background: "var(--border-op)" }} />
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-5">
          <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>workspace</div>
          <ul className="space-y-0.5">{DESK_NAV.map((it) => (<li key={it.id}><SidebarNavRow item={it} /></li>))}</ul>
        </div>
        <div className="mb-5">
          <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>project</div>
          <div className="rounded-md px-2 py-1.5" style={{ background: "color-mix(in oklab, var(--operational) 8%, transparent)" }}>
            <div className="text-ui truncate text-foreground" style={{ fontSize: 12 }}>{PROJECT_NAME}</div>
            <div className="text-code truncate text-muted-foreground" style={{ fontSize: 10 }}>{WORKSPACE_PATH}</div>
          </div>
          <div className="text-code mt-2 px-2 text-muted-foreground" style={{ fontSize: 10, lineHeight: 1.5 }}>
            one active journey per workspace
          </div>
        </div>
      </div>
      <div className="border-t px-3 py-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--operational), color-mix(in oklab, var(--info) 60%, var(--operational)))" }}>
            <span className="text-ui" style={{ fontSize: 11 }}>EA</span>
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-ui truncate text-foreground" style={{ fontSize: 12 }}>Elena Aoki</div>
            <div className="text-code truncate text-muted-foreground" style={{ fontSize: 10 }}>product lead · nimbus</div>
          </div>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
        </div>
      </div>
    </aside>
  );
}

function SidebarNavRow({ item }: { item: NavItem }) {
  const className = `group relative flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"} ${item.disabled ? "opacity-45" : ""}`;
  const style = { background: item.active ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent" } as const;
  const inner = (<>
    {item.active ? (<span aria-hidden className="absolute inset-y-1 left-0 w-[2px] rounded-full" style={{ background: "var(--operational)", boxShadow: "0 0 8px var(--operational)" }} />) : null}
    <span className="text-ui truncate pl-2">{item.label}</span>
    <span className="flex items-center gap-1.5">
      {item.disabled ? (<span className="text-code" style={{ fontSize: 9 }}>soon</span>) : null}
      {item.kbd ? (<span className="text-code opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ fontSize: 10 }}>{item.kbd}</span>) : null}
    </span>
  </>);
  if (item.disabled) return <div className={className} style={style}>{inner}</div>;
  return item.href ? <Link to={item.href} className={className} style={style}>{inner}</Link> : <button className={className} style={style}>{inner}</button>;
}

function LogoGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="20" height="20" rx="5" stroke="var(--border-strong)" />
      <path d="M6 11h6M12 7l4 4-4 4" stroke="var(--operational)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeskTopbar({ phase, onOpenPalette, onNewIdea }: { phase: Phase; onOpenPalette: () => void; onNewIdea: () => void }) {
  const status = phase === "empty" ? "READY" : phase === "initializing" ? "INITIALISING" : "RUNNING";
  const statusColor = phase === "empty" ? "var(--info)" : "var(--operational)";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-8" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-code" style={{ fontSize: 11 }}>workspace</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui text-foreground" style={{ fontSize: 13 }}>{PROJECT_NAME}</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui" style={{ fontSize: 13 }}>Desk</span>
        <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5" style={{ borderColor: "var(--border-op)", background: `color-mix(in oklab, ${statusColor} 8%, transparent)` }}>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
          <span className="text-code" style={{ fontSize: 10, color: statusColor }}>{status}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {phase !== "empty" ? (
          <button onClick={onNewIdea} className="text-code rounded-md border px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>new idea</button>
        ) : null}
        <button onClick={onOpenPalette} className="group inline-flex items-center gap-3 rounded-md border px-3 py-1.5 transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", color: "var(--muted-foreground)" }}>
          <span className="text-ui" style={{ fontSize: 12 }}>Search artifacts</span>
          <span className="flex items-center gap-1"><span className="kbd-key">⌘</span><span className="kbd-key">K</span></span>
        </button>
        <Link to="/" className="text-ui rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">← Exit</Link>
      </div>
    </header>
  );
}

/* ─── STATE 1 · EMPTY ────────────────────────────────────────────────── */

function EmptyDesk({ idea, onIdeaChange, onRun, onSkip }: { idea: string; onIdeaChange: (v: string) => void; onRun: () => void; onSkip: () => void }) {
  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-6 pb-24 pt-16">
      <h1 className="mb-3 max-w-3xl text-balance text-center" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.75rem, 5vw, 4.25rem)", lineHeight: 1.02, letterSpacing: "-0.02em", animation: "ig-fade-up 800ms var(--ease-out) 120ms both" }}>
        What are we building today?
      </h1>
      <p className="mb-12 max-w-xl text-center text-muted-foreground" style={{ fontSize: 15, lineHeight: 1.55, animation: "ig-fade-up 800ms var(--ease-out) 240ms both" }}>
        Describe one idea. Six specialist agents run a 15-stage product lifecycle and write every artifact — from discovery to prototype prompt.
      </p>
      <div className="w-full max-w-3xl" style={{ animation: "ig-fade-up 900ms var(--ease-out) 360ms both" }}>
        <IdeaComposer value={idea} onChange={onIdeaChange} onRun={onRun} />
      </div>
      <div className="mt-10 flex flex-col items-center gap-3" style={{ animation: "ig-fade-up 900ms var(--ease-out) 520ms both" }}>
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>or start from a preset</div>
        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => onIdeaChange(p.idea)} className="text-ui rounded-full border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op) 60%, transparent)", fontSize: 12 }}>{p.label}</button>
          ))}
        </div>
        <button onClick={onSkip} className="text-code mt-6 text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" style={{ fontSize: 10 }}>open the existing library →</button>
      </div>
    </main>
  );
}

function IdeaComposer({ value, onChange, onRun }: { value: string; onChange: (v: string) => void; onRun: () => void }) {
  const [focused, setFocused] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const expanded = focused || value.length > 0;
  const canRun = value.trim().length > 4;

  return (
    <div className="relative rounded-2xl border transition-all duration-300 ease-out" style={{ borderColor: expanded ? "color-mix(in oklab, var(--operational) 45%, var(--border-op))" : "var(--border-op)", background: "var(--surface-op-elevated)", boxShadow: expanded ? "0 30px 80px -44px color-mix(in oklab, var(--operational) 55%, transparent)" : "0 18px 50px -32px rgba(0,0,0,0.5)" }}>
      <div className="flex items-start gap-3 px-5 pt-4">
        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: "color-mix(in oklab, var(--operational) 14%, transparent)", color: "var(--operational)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canRun) { e.preventDefault(); onRun(); } }}
          rows={expanded ? 3 : 1}
          placeholder="Describe your idea…"
          className="w-full resize-none bg-transparent py-2 pr-4 text-foreground outline-none placeholder:text-muted-foreground/70"
          style={{ fontFamily: "var(--font-serif)", fontSize: expanded ? 22 : 18, lineHeight: 1.35, transition: "font-size 240ms var(--ease-out)" }}
        />
      </div>
      <div className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
        <div className="min-h-0">
          <div className="mx-5 mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 pb-4" style={{ borderColor: "var(--border-op)" }}>
            <div className="flex items-center gap-3">
              <SmallSelect label="model" value={model} options={MODELS.map((m) => ({ value: m, label: m }))} onChange={setModel} />
              <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>15 stages · 6 agents</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>a full lifecycle typically completes in 8–14 min</span>
              <button onClick={onRun} disabled={!canRun} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed" style={{ background: canRun ? "var(--operational)" : "color-mix(in oklab, var(--operational) 25%, transparent)", color: "#0a1a12" }}>
                Run lifecycle
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STATE 1.5 · INITIALIZING ───────────────────────────────────────── */

const INIT_STEPS = [
  { t: 400, label: "provisioning workspace", detail: WORKSPACE_PATH },
  { t: 900, label: "resolving prompt preset", detail: "full-lifecycle" },
  { t: 1400, label: "waking coordinator", detail: "C-01 online" },
  { t: 1900, label: "dispatching agents", detail: "R-01 · S-01 · U-01 · A-01 · Q-01" },
  { t: 2500, label: "seeding artifact scaffolds", detail: "15 placeholders written" },
  { t: 3100, label: "opening event stream", detail: "journey_events → live" },
];

function Initializing({ idea, onDone }: { idea: string; onDone: () => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => { setTick(now - start); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
      <div className="mb-8 w-full max-w-2xl rounded-2xl border px-5 py-3" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}>
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>initialising lifecycle · {PROJECT_NAME.toLowerCase()}</div>
        <div className="mt-1 text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 20, lineHeight: 1.3 }}>{idea || "a calm cross-timezone standup for distributed product teams"}</div>
      </div>
      <AgentGraph tick={tick} />
      <ol className="mt-8 w-full max-w-xl space-y-1.5">
        {INIT_STEPS.map((s, i) => {
          const active = tick >= s.t;
          const current = active && (i === INIT_STEPS.length - 1 || tick < INIT_STEPS[i + 1].t);
          return (
            <li key={s.label} className="flex items-baseline gap-3 rounded-md px-3 py-1.5 transition-colors" style={{ background: current ? "color-mix(in oklab, var(--operational) 8%, transparent)" : "transparent", opacity: active ? 1 : 0.32 }}>
              <span className="text-code tabular-nums" style={{ fontSize: 10, color: active ? "var(--operational)" : "var(--muted-foreground)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="text-ui text-foreground" style={{ fontSize: 13 }}>{s.label}{current ? <span className="cli-caret ml-1 align-baseline" /> : null}</span>
              <span className="text-code ml-auto text-muted-foreground" style={{ fontSize: 10 }}>{s.detail}</span>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

/** 6 agent nodes — C-01 at the core, the five specialists around it. */
function AgentGraph({ tick }: { tick: number }) {
  const cx = 210, cy = 140, R = 105;
  const ring = AGENTS.filter((a) => a.code !== "C-01").map((a, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return { code: a.code, x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R, wakeAt: 1900 + i * 180 };
  });
  const coreOn = tick >= 1400;
  return (
    <svg viewBox="0 0 420 280" className="h-[280px] w-[420px]" role="img" aria-label="Agent cluster initialising">
      {[45, 78, 108].map((r, i) => (<circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-op)" strokeWidth={0.7} strokeDasharray="2 5" opacity={0.55 - i * 0.12} />))}
      {ring.map((a) => {
        const on = tick >= a.wakeAt;
        return <line key={`l-${a.code}`} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="var(--operational)" strokeWidth={1.1} strokeDasharray="140" strokeDashoffset={on ? 0 : 140} opacity={on ? 0.6 : 0.12} style={{ transition: "stroke-dashoffset 520ms var(--ease-out), opacity 520ms" }} />;
      })}
      <circle cx={cx} cy={cy} r={13} fill={coreOn ? "var(--operational)" : "var(--muted-foreground)"} style={{ transition: "fill 400ms" }} />
      <text x={cx} y={cy + 30} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--muted-foreground)" }}>C-01</text>
      {ring.map((a) => {
        const on = tick >= a.wakeAt;
        return (
          <g key={a.code} style={{ transition: "opacity 400ms", opacity: on ? 1 : 0.32 }}>
            <circle cx={a.x} cy={a.y} r={on ? 8 : 4} fill={on ? "var(--operational)" : "var(--muted-foreground)"} style={{ transition: "r 480ms var(--ease-out), fill 480ms" }} />
            <text x={a.x} y={a.y - 14} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{a.code}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── STATE 2 · POPULATED LIBRARY ────────────────────────────────────── */

type Tab = "All" | Category | "needs review";
const TABS: Tab[] = ["All", ...CATEGORIES, "needs review"];
type Sort = "recent" | "confidence" | "stage";

function needsReview(a: Artifact) {
  return a.state === "generated" && (a.status === "warnings" || a.status === "changes" || a.status === "pending");
}

function PopulatedDesk() {
  const [tab, setTab] = useState<Tab>("All");
  const [agent, setAgent] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("stage");
  const [density, setDensity] = useState<"cozy" | "dense">("cozy");

  const filtered = useMemo(() => {
    let out = ARTIFACTS.slice();
    if (tab === "needs review") out = out.filter(needsReview);
    else if (tab !== "All") out = out.filter((a) => categoryOf(a.stage) === tab);
    if (agent !== "all") out = out.filter((a) => a.agent === agent);
    if (sort === "recent") out.sort((a, b) => (a.updatedMin ?? 1e6) - (b.updatedMin ?? 1e6));
    if (sort === "confidence") out.sort((a, b) => (b.confidence ? CONFIDENCE_SCORE[b.confidence] : -1) - (a.confidence ? CONFIDENCE_SCORE[a.confidence] : -1));
    if (sort === "stage") out.sort((a, b) => a.stage - b.stage);
    return out;
  }, [tab, agent, sort]);

  return (
    <div className="flex flex-1">
      <WorkspaceSidebar />
      <main className="min-w-0 flex-1 px-8 pb-24 pt-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="pb-6">
            <div className="text-code mb-3 text-muted-foreground" style={{ fontSize: 10 }}>{WORKSPACE_PATH}</div>
            <h1 className="text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>The library</h1>
            <p className="mt-2 max-w-xl text-muted-foreground" style={{ fontSize: 14, lineHeight: 1.55 }}>
              Every artifact your agents have produced. Open any one to read it. Editing lives in Studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border-op)", background: "var(--surface-op)" }}>
            <div className="flex flex-wrap items-center gap-1">
              {TABS.map((t) => {
                const on = tab === t;
                return (
                  <button key={t} onClick={() => setTab(t)} className="text-ui rounded-md px-2.5 py-1 transition-colors" style={{ fontSize: 12, color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "color-mix(in oklab, var(--operational) 12%, transparent)" : "transparent", boxShadow: on ? "inset 0 0 0 1px color-mix(in oklab, var(--operational) 35%, transparent)" : "none" }}>{t}</button>
                );
              })}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{filtered.length} of {ARTIFACTS.length}</span>
              <SmallSelect label="sort" value={sort} options={[{ value: "recent", label: "recently updated" }, { value: "confidence", label: "confidence" }, { value: "stage", label: "stage order" }]} onChange={(v) => setSort(v as Sort)} />
              <div className="flex items-center rounded-md border p-0.5" style={{ borderColor: "var(--border-op)" }}>
                {(["cozy", "dense"] as const).map((d) => {
                  const on = density === d;
                  return <button key={d} onClick={() => setDensity(d)} className="text-code rounded-sm px-2 py-1 transition-colors" style={{ fontSize: 10, color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "color-mix(in oklab, var(--foreground) 6%, transparent)" : "transparent" }}>{d}</button>;
                })}
              </div>
            </div>
          </div>

          <div className={`mt-8 grid gap-6 ${density === "cozy" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}>
            {filtered.map((a, i) => (<ArtifactCard key={a.id} artifact={a} index={i} density={density} />))}
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl border py-16 text-center" style={{ borderColor: "var(--border-op)", borderStyle: "dashed" }}>
                <div className="text-code text-muted-foreground" style={{ fontSize: 11 }}>no artifacts match this filter</div>
              </div>
            ) : null}
          </div>

          {/* agent filter → journey.json stages[N] agent attribution */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-6" style={{ borderColor: "var(--border-op)" }}>
            <span className="text-label mr-1 text-muted-foreground" style={{ fontSize: 10 }}>filter by agent</span>
            {["all", ...AGENTS.map((a) => a.code)].map((code) => {
              const on = agent === code;
              const count = code === "all" ? ARTIFACTS.length : ARTIFACTS.filter((a) => a.agent === code).length;
              return (
                <button key={code} onClick={() => setAgent(code)} className="text-code inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors" style={{ fontSize: 10, borderColor: on ? "color-mix(in oklab, var(--operational) 45%, transparent)" : "var(--border-op)", background: on ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {code}<span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* honest empty states — capabilities that need data we do not have yet */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <FutureNote title="Run history & trends" body="Comparing confidence across multiple lifecycle runs needs historical data. Available in a future version." />
            <FutureNote title="Review & comments" body="Assigning artifacts and leaving review notes requires team features." />
          </div>
        </div>
      </main>
    </div>
  );
}

function FutureNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border px-4 py-3" style={{ borderColor: "var(--border-op)", borderStyle: "dashed" }}>
      <div className="text-ui text-muted-foreground" style={{ fontSize: 12 }}>{title}</div>
      <div className="text-code mt-1 text-muted-foreground" style={{ fontSize: 10, lineHeight: 1.6, opacity: 0.75 }}>{body}</div>
    </div>
  );
}

/* ─── WORKSPACE SIDEBAR → workspace filesystem ───────────────────────── */

function WorkspaceSidebar() {
  const reader = useReader();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(CATEGORIES.map((c) => [c, true])));

  if (collapsed) {
    return (
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[44px] shrink-0 flex-col items-center border-r py-3 md:flex" style={{ background: "color-mix(in oklab, var(--surface-op-sunken) 55%, transparent)", borderColor: "var(--border-op)" }}>
        <button onClick={() => setCollapsed(false)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground" title="Expand workspace">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] shrink-0 flex-col border-r md:flex" style={{ background: "color-mix(in oklab, var(--surface-op-sunken) 55%, transparent)", borderColor: "var(--border-op)" }}>
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
        <div>
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>workspace</div>
          <div className="text-ui text-foreground" style={{ fontSize: 13 }}>{PROJECT_NAME}</div>
        </div>
        <button onClick={() => setCollapsed(true)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground" title="Collapse">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {CATEGORIES.map((c) => {
          const items = ARTIFACTS.filter((a) => categoryOf(a.stage) === c);
          const done = items.filter((a) => a.state === "generated").length;
          const isOpen = open[c];
          return (
            <div key={c} className="mb-1">
              <button onClick={() => setOpen((p) => ({ ...p, [c]: !p[c] }))} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:text-foreground">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 160ms" }}><path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                <span className="text-ui" style={{ fontSize: 12 }}>{c}</span>
                <span className="text-code ml-auto tabular-nums" style={{ fontSize: 10 }}>{done}/{items.length}</span>
              </button>
              <div className="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                <div className="min-h-0">
                  <ul className="pl-5 pt-0.5">
                    {items.map((a) => (
                      <li key={a.id}>
                        <button
                          onClick={() => a.state === "generated" && reader.open(a.id)}
                          disabled={a.state !== "generated"}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-white/[0.03] disabled:cursor-default"
                          style={{ color: a.state === "generated" ? "var(--muted-foreground)" : "color-mix(in oklab, var(--muted-foreground) 55%, transparent)" }}
                        >
                          <StatusDot state={a.state} />
                          <span className="truncate text-ui" style={{ fontSize: 11.5 }}>{a.name}</span>
                          <span className="text-code ml-auto tabular-nums opacity-50" style={{ fontSize: 9 }}>{a.stage}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t px-3 py-2 text-muted-foreground" style={{ borderColor: "var(--border-op)" }}>
        <div className="text-code flex items-center justify-between" style={{ fontSize: 10 }}>
          <span>{WORKSPACE_PATH}</span>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
        </div>
      </div>
    </aside>
  );
}

function StatusDot({ state }: { state: Artifact["state"] }) {
  if (state === "generated") return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />;
  if (state === "stale") return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--warning)" }} />;
  if (state === "generating") return <span className="pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />;
  return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full border" style={{ borderColor: "var(--border-strong)" }} />;
}

/* ─── ARTIFACT CARD → artifact file + journey.json stages[N] ─────────── */

function ArtifactCard({ artifact, index, density }: { artifact: Artifact; index: number; density: "cozy" | "dense" }) {
  const reader = useReader();
  const [hover, setHover] = useState(false);
  const cat = categoryOf(artifact.stage);
  const pending = artifact.state !== "generated";
  const dense = density === "dense";

  if (pending) {
    return (
      <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-op)", borderStyle: "dashed", animation: `ig-fade-up 400ms var(--ease-out) ${Math.min(index * 40, 400)}ms both` }}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-code rounded-full border px-2 py-0.5" style={{ fontSize: 10, borderColor: "var(--border-op)", color: "var(--muted-foreground)" }}>{cat}</span>
          <span className="text-code text-muted-foreground tabular-nums opacity-60" style={{ fontSize: 10 }}>{artifact.id}</span>
        </div>
        <h3 className="mt-3" style={{ fontFamily: "var(--font-serif)", fontSize: dense ? 17 : 20, lineHeight: 1.2, color: "color-mix(in oklab, var(--muted-foreground) 80%, transparent)" }}>{artifact.name}</h3>
        <div className="mt-4 flex items-center gap-3 text-muted-foreground">
          <StatusDot state={artifact.state} />
          <span className="text-code" style={{ fontSize: 10 }}>{artifact.state === "generating" ? "generating…" : "queued"}</span>
          <span className="text-code ml-auto opacity-60" style={{ fontSize: 10 }}>{artifact.agent} · stage {artifact.stage}</span>
        </div>
      </div>
    );
  }

  const statusTone: Record<string, string> = { passing: "var(--operational)", approved: "var(--operational)", warnings: "var(--warning)", changes: "var(--warning)", pending: "var(--info)" };
  const tone = statusTone[artifact.status ?? "pending"];
  const conf = artifact.confidence ? CONFIDENCE_SCORE[artifact.confidence] : 0;

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300 ease-out"
      style={{ borderColor: hover ? "color-mix(in oklab, var(--operational) 35%, var(--border-op))" : "var(--border-op)", background: "var(--surface-op-elevated)", transform: hover ? "translateY(-2px)" : "translateY(0)", boxShadow: hover ? "0 26px 54px -32px rgba(0,0,0,0.6)" : "0 12px 32px -24px rgba(0,0,0,0.45)", animation: `ig-fade-up 480ms var(--ease-out) ${Math.min(index * 50, 450)}ms both` }}
    >
      <span aria-hidden className="absolute inset-y-3 left-0 w-[2px] rounded-full" style={{ background: CATEGORY_COLOR[cat], opacity: hover ? 1 : 0.5 }} />
      <div className="flex items-center justify-between gap-3 pl-2">
        <div className="flex items-center gap-2">
          <span className="text-code inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5" style={{ fontSize: 10, borderColor: "var(--border-op)", background: `color-mix(in oklab, ${CATEGORY_COLOR[cat]} 10%, transparent)`, color: CATEGORY_COLOR[cat] }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLOR[cat] }} />{cat}
          </span>
          <span className="text-code rounded-md px-1.5 py-0.5" style={{ fontSize: 10, background: "color-mix(in oklab, var(--foreground) 5%, transparent)", color: "var(--muted-foreground)" }}>{artifact.docType}</span>
        </div>
        <span className="text-code text-muted-foreground tabular-nums" style={{ fontSize: 10 }}>{artifact.id}</span>
      </div>

      <button onClick={() => reader.open(artifact.id)} className="mt-3 pl-2 text-left text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: dense ? 18 : 22, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{artifact.title}</button>
      {!dense ? (<p className="mt-3 pl-2 text-muted-foreground" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{artifact.summary}</p>) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pl-2 text-muted-foreground">
        <span className="text-code inline-flex items-center gap-1.5" style={{ fontSize: 10 }}>
          <span className="text-code inline-block rounded px-1 py-px" style={{ fontSize: 9, background: "color-mix(in oklab, var(--operational) 14%, transparent)", color: "var(--operational)" }}>{artifact.agent}</span>
        </span>
        <span className="text-code" style={{ fontSize: 10 }}>{(artifact.updatedMin ?? 0) < 60 ? `${artifact.updatedMin}m ago` : `${Math.floor((artifact.updatedMin ?? 0) / 60)}h ago`}</span>
        <span className="text-code" style={{ fontSize: 10 }}>{artifact.readMin} min read</span>
        <span className="text-code inline-flex items-center gap-1" style={{ fontSize: 10, color: tone }}><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: tone }} />{artifact.status}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t pl-2 pt-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <MiniMeter label="confidence" value={conf} tone="op" suffix={artifact.confidence} />
          <span className="text-code inline-flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 9 }}>ai<span style={{ color: "var(--info)" }}>v{artifact.version}</span></span>
        </div>
        <button onClick={() => reader.open(artifact.id)} className="text-ui inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground" style={{ fontSize: 12 }}>
          Open
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: hover ? "translateX(2px)" : "translateX(0)", transition: "transform 200ms var(--ease-out)" }}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

function MiniMeter({ label, value, tone, suffix }: { label: string; value: number; tone: "op" | "info"; suffix?: string }) {
  const color = tone === "op" ? "var(--operational)" : "var(--info)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-code text-muted-foreground" style={{ fontSize: 9 }}>{label}</span>
      <div className="relative h-1 w-16 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}>
        <div className="absolute inset-y-0 left-0" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-code tabular-nums" style={{ fontSize: 9, color }}>{value}{suffix ? ` · ${suffix}` : ""}</span>
    </div>
  );
}

function SmallSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 120)} className="text-ui inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 12 }}>
        <span className="text-code" style={{ fontSize: 10 }}>{label}</span>
        <span className="text-foreground">{current?.label}</span>
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[180px] overflow-hidden rounded-lg border py-1 shadow-2xl" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)", animation: "ig-fade-up 180ms var(--ease-out) both" }}>
          {options.map((o) => (
            <button key={o.value} onMouseDown={() => { onChange(o.value); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-1.5 text-left text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground">
              <span className="text-ui" style={{ fontSize: 12 }}>{o.label}</span>
              {o.value === value ? <span className="text-code" style={{ color: "var(--operational)", fontSize: 10 }}>✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ─── READING VIEW → persisted artifact markdown ─────────────────────── */

function ReadingView({ id, onClose }: { id: string | null; onClose: () => void }) {
  const open = id !== null;
  const artifact = id ? ARTIFACTS.find((a) => a.id === id) : null;
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <div onClick={onClose} aria-hidden className="fixed inset-0 z-50 transition-opacity duration-300" style={{ background: "color-mix(in oklab, #000 62%, transparent)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} />
      <div role="dialog" aria-modal="true" className="fixed inset-y-0 right-0 z-50 w-full max-w-[760px] overflow-y-auto border-l transition-transform duration-400" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)", transform: open ? "translateX(0)" : "translateX(100%)", transitionTimingFunction: "var(--ease-out)" }}>
        {artifact ? (
          <div>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-4" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-code" style={{ fontSize: 10 }}>{WORKSPACE_PATH}{artifact.outputFile}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-code rounded-md border px-2 py-1 text-muted-foreground" style={{ fontSize: 10, borderColor: "var(--border-op)", opacity: 0.6 }}>Open in Studio · soon</span>
                <button onClick={onClose} className="text-code rounded-md border px-2 py-1 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>esc</button>
              </div>
            </div>
            <article className="px-8 py-10 sm:px-14">
              <div className="text-code mb-4 flex flex-wrap items-center gap-3 text-muted-foreground" style={{ fontSize: 10 }}>
                <span style={{ color: CATEGORY_COLOR[categoryOf(artifact.stage)] }}>{categoryOf(artifact.stage)}</span>
                <span>stage {artifact.stage}</span>
                <span>{artifact.agent}</span>
                <span>v{artifact.version}</span>
                <span>{artifact.readMin} min read</span>
              </div>
              <h1 className="text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 38, lineHeight: 1.12, letterSpacing: "-0.02em" }}>{artifact.title}</h1>
              <p className="mt-6 text-foreground/85" style={{ fontSize: 17, lineHeight: 1.75 }}>{artifact.summary}</p>
              <div className="mt-10 rounded-xl border p-5" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}>
                <div className="text-label mb-2 text-muted-foreground" style={{ fontSize: 10 }}>agent reasoning · journey.json</div>
                <p className="text-muted-foreground" style={{ fontSize: 14, lineHeight: 1.7 }}>{artifact.reasoning}</p>
                <div className="text-code mt-4 flex items-center gap-4 text-muted-foreground" style={{ fontSize: 10 }}>
                  <span>confidence · <span style={{ color: "var(--operational)" }}>{artifact.confidence}</span></span>
                  <span>status · {artifact.status}</span>
                </div>
              </div>
              <div className="mt-8 rounded-xl border px-5 py-4" style={{ borderColor: "var(--border-op)", borderStyle: "dashed" }}>
                <div className="text-code text-muted-foreground" style={{ fontSize: 10, lineHeight: 1.7 }}>
                  Full artifact body renders from {artifact.outputFile} once the workspace filesystem is connected. Reading only — editing lives in Studio.
                </div>
              </div>
            </article>
          </div>
        ) : null}
      </div>
    </>
  );
}

/* ─── COMMAND PALETTE → artifact index ───────────────────────────────── */

function CommandPalette({ open, onClose, onOpenArtifact }: { open: boolean; onClose: () => void; onOpenArtifact: (id: string) => void }) {
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ARTIFACTS.filter((a) => a.state === "generated" && (!needle || `${a.title} ${a.name} ${a.id} ${a.agent}`.toLowerCase().includes(needle)));
  }, [q]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[14vh]" onClick={onClose} style={{ background: "color-mix(in oklab, #000 58%, transparent)" }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)", animation: "ig-fade-up 180ms var(--ease-out) both" }}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--muted-foreground)" }}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search artifacts…" className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70" style={{ fontSize: 14 }} />
          <span className="kbd-key">esc</span>
        </div>
        <div className="max-h-[46vh] overflow-y-auto py-2">
          {results.map((a) => (
            <button key={a.id} onClick={() => onOpenArtifact(a.id)} className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-white/[0.04]">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLOR[categoryOf(a.stage)] }} />
              <span className="min-w-0 flex-1 truncate text-ui text-foreground" style={{ fontSize: 13 }}>{a.title}</span>
              <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{a.agent} · {a.id}</span>
            </button>
          ))}
          {results.length === 0 ? (<div className="text-code px-4 py-6 text-center text-muted-foreground" style={{ fontSize: 11 }}>no artifacts match "{q}"</div>) : null}
        </div>
        <div className="text-code border-t px-4 py-2 text-muted-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>
          full-text search across artifact bodies · available in a future version
        </div>
      </div>
    </div>
  );
}
