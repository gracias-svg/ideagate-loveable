import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AGENTS, ARTIFACTS, CATEGORIES, CATEGORY_COLOR, CONFIDENCE_SCORE, MODELS, PRESETS,
  PROJECT_NAME, WORKSPACE_PATH, categoryOf, bodyOf, ATTENTION, type AttentionIssue, downstreamCount,
  type Artifact, type Category,
} from "@/lib/desk-data";
import { WorkspaceExplorer } from "@/components/workspace-explorer";
import { ArtifactInspector } from "@/components/artifact-inspector";
import { OrchestrationStream } from "@/components/orchestration-stream";
import { LIFECYCLE_SCRIPT, useOrchestrationRun, type RunStatus } from "@/lib/orchestration";
import { Boxes, Clock, FileText, Lightbulb, ListChecks, PenLine, Search, ShieldCheck } from "lucide-react";

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

/* ─── MISSION CONFIGURATION PANEL ────────────────────────────────────────
 *  Backend mapping:
 *    goal            → journey_config.goal (prompt preset)
 *    executionMode   → journey_config.mode (reasoning budget)
 *    outputFormat    → journey_config.output_format
 *    strategy        → orchestration_strategy (only "standard" implemented)
 *    modules[]       → journey_config.modules (optional agent capabilities)
 *    estimate        → derived client-side preview of journey_runs.estimate
 * ─────────────────────────────────────────────────────────────────────── */

const GOALS = [
  { id: "lifecycle", label: "End-to-end Lifecycle", hint: "15 stages", consequence: "15 stages · 6 agents · all PM artifacts", icon: "M4 12h16M4 6h16M4 18h10", stages: 15, agents: 6, min: [12, 18] },
  { id: "discovery", label: "Discovery Only", hint: "stages 0–1", consequence: "Idea → research → problem definition · 3 artifacts", icon: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3", stages: 2, agents: 2, min: [3, 5] },
  { id: "prd", label: "PRD Fast Track", hint: "stages 0,2,7", consequence: "Discovery + PRD · 4 artifacts · ~8 min", icon: "M7 3h7l5 5v13H7zM14 3v5h5", stages: 3, agents: 3, min: [4, 7] },
  { id: "mvp", label: "MVP Definition", hint: "stages 2–6", consequence: "Discovery through prioritization · 7 artifacts", icon: "M12 3l8 5v8l-8 5-8-5V8z", stages: 5, agents: 3, min: [5, 9] },
  { id: "ux", label: "UX Sprint", hint: "stages 8–9", consequence: "Design + usability · 3 artifacts · design-focused", icon: "M4 5h16v11H4zM9 20h6", stages: 2, agents: 2, min: [3, 6] },
  { id: "interview", label: "Interview Prep", hint: "stage 1", consequence: "Portfolio-quality output · structured for PM interviews", icon: "M20 15a3 3 0 01-3 3H8l-4 3V6a3 3 0 013-3h10a3 3 0 013 3z", stages: 1, agents: 1, min: [2, 4] },
] as const;

const MODES = ["Explore", "Balanced", "Portfolio Quality", "Evidence First", "Speed"] as const;
const MODE_FACTOR: Record<string, number> = { Explore: 1.1, Balanced: 1, "Portfolio Quality": 1.45, "Evidence First": 1.3, Speed: 0.65 };
const MODE_CONSEQUENCE: Record<string, string> = {
  Explore: "Wide option space · divergent thinking · fewer commitments",
  Balanced: "Default reasoning budget · pragmatic depth · steady pace",
  "Portfolio Quality": "Deep reasoning · citation required · slower · more thorough",
  "Evidence First": "Every claim sourced · research-heavy · conservative confidence",
  Speed: "Shortest viable reasoning · draft quality · fastest run",
};
const FORMATS = ["Markdown", "Structured PRD", "Executive Summary", "Developer Handoff"] as const;

const STRATEGIES = [
  { id: "standard", label: "Standard Lifecycle", locked: false, consequence: "Sequential stages · one agent owns each artifact" },
  { id: "debate", label: "Debate: Red vs Blue", locked: true, consequence: "Two opposing agents challenge assumptions before finalizing" },
  { id: "council", label: "Council Review", locked: true, consequence: "All agents vote on key decisions. Slower. More robust." },
  { id: "parallel", label: "Parallel Specialists", locked: true, consequence: "Agents work simultaneously on the same stage" },
  { id: "research", label: "Research First", locked: true, consequence: "Evidence gathering completes before any spec is written" },
] as const;

const MODULES = [
  { id: "competitive", label: "Competitive Research", agent: "R-01", family: "research" },
  { id: "assumption", label: "Assumption Audit", agent: "Q-01", family: "research" },
  { id: "risk", label: "Risk Assessment", agent: "S-01", family: "quality" },
  { id: "feasibility", label: "Technical Feasibility", agent: "A-01", family: "quality" },
  { id: "uxcritique", label: "UX Critique", agent: "U-01", family: "design" },
] as const;

const MODULE_FAMILIES = [
  { id: "research", label: "Research" },
  { id: "quality", label: "Quality & Risk" },
  { id: "design", label: "Design" },
] as const;

/** preset chip → intelligent pre-selection of goal + execution mode */
const PRESET_INTENT: Record<string, { goal: string; mode: string }> = {
  "Retail SaaS": { goal: "lifecycle", mode: "Balanced" },
  "Mobile app": { goal: "ux", mode: "Explore" },
  "Internal tool": { goal: "prd", mode: "Balanced" },
  "AI feature": { goal: "mvp", mode: "Portfolio Quality" },
  Marketplace: { goal: "lifecycle", mode: "Evidence First" },
};

function EmptyDesk({ idea, onIdeaChange, onRun, onSkip }: { idea: string; onIdeaChange: (v: string) => void; onRun: () => void; onSkip: () => void }) {
  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-6 pb-20 pt-14">
      <MissionConfigPanel idea={idea} onIdeaChange={onIdeaChange} onRun={onRun} />
      <button onClick={onSkip} className="text-code mt-8 text-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline" style={{ fontSize: 10 }}>open the existing library →</button>
    </main>
  );
}

function MissionConfigPanel({ idea, onIdeaChange, onRun }: { idea: string; onIdeaChange: (v: string) => void; onRun: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [goal, setGoal] = useState<string>("lifecycle");
  const [mode, setMode] = useState<string>("Portfolio Quality");
  const [format, setFormat] = useState<string>("Markdown");
  const [strategy] = useState<string>("standard");
  const [modules, setModules] = useState<string[]>(["competitive", "risk"]);
  const [preset, setPreset] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canRun = idea.trim().length > 4;

  const expand = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const applyPreset = (p: { label: string; idea: string }) => {
    onIdeaChange(p.idea);
    setPreset(p.label);
    const intent = PRESET_INTENT[p.label];
    if (intent) { setGoal(intent.goal); setMode(intent.mode); }
    setFlash(true);
    window.setTimeout(() => setFlash(false), 400);
  };

  const est = useMemo(() => {
    const g = GOALS.find((x) => x.id === goal)!;
    const words = idea.trim() ? idea.trim().split(/\s+/).length : 0;
    const scale = words > 40 ? 1.25 : words > 18 ? 1.1 : 1;
    const f = MODE_FACTOR[mode] * scale;
    const lo = Math.max(1, Math.round(g.min[0] * f + modules.length * 0.8));
    const hi = Math.max(lo + 1, Math.round(g.min[1] * f + modules.length * 1.4));
    const size = words > 40 || goal === "lifecycle" ? "Platform" : words > 18 ? "Product" : "Feature";
    const agents = Math.min(6, g.agents + new Set(modules.map((m) => MODULES.find((x) => x.id === m)!.agent)).size);
    return { size, lo, hi, agents, stages: g.stages, goalLabel: g.label };
  }, [goal, mode, modules, idea]);

  const estimate = `Estimated: ${est.size} · ~${est.lo}–${est.hi} min · ${est.agents} agent${est.agents === 1 ? "" : "s"}`;

  const brief = `Running a ${mode} lifecycle for a ${est.goalLabel} build. ${est.agents} agents · ${est.stages} stages · ${format} output. Estimated ${est.lo}–${est.hi} minutes. ${STRATEGIES.find((s) => s.id === strategy)!.label} orchestration${modules.length ? ` with ${modules.length} intelligence module${modules.length === 1 ? "" : "s"} enabled` : ""}.`;

  return (
    <div
      className="w-full transition-[max-width] duration-500"
      style={{ maxWidth: expanded ? 720 : 620, transitionTimingFunction: "var(--ease-out)" }}
    >
      <div
        onClick={expanded ? undefined : expand}
        className={`relative overflow-hidden border transition-all duration-500 ${expanded ? "rounded-2xl" : "cursor-text rounded-full hover:border-[color-mix(in_oklab,var(--operational)_40%,var(--border-op))]"}`}
        style={{
          borderColor: expanded ? "color-mix(in oklab, var(--operational) 32%, var(--border-op))" : "var(--border-op)",
          background: "var(--surface-op-elevated)",
          boxShadow: expanded ? "0 40px 90px -50px rgba(0,0,0,0.85)" : "0 18px 50px -34px rgba(0,0,0,0.6)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        {/* input row */}
        <div className={`flex items-start gap-3 ${expanded ? "px-6 pt-6" : "px-5 py-3.5"}`} style={{ transition: "padding 400ms var(--ease-out)" }}>
          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: "color-mix(in oklab, var(--operational) 12%, transparent)", color: "var(--operational)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </div>
          <textarea
            ref={inputRef}
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            onFocus={expand}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canRun) { e.preventDefault(); onRun(); } }}
            rows={expanded ? 2 : 1}
            placeholder="Describe what you want to build..."
            className="w-full resize-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
            style={{ fontFamily: "var(--font-serif)", fontSize: expanded ? 22 : 17, lineHeight: 1.35, transition: "font-size 300ms var(--ease-out)" }}
          />
          {!expanded ? (
            <button onClick={(e) => { e.stopPropagation(); expand(); }} className="text-ui shrink-0 whitespace-nowrap rounded-full px-4 py-1.5" style={{ background: "var(--operational)", color: "#0a1a12", fontSize: 12 }}>
              Configure &amp; Run →
            </button>
          ) : null}
        </div>

        {/* unfolding body */}
        <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: expanded ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out)" }}>
          <div className="min-h-0 overflow-hidden">
            <div className="px-6 pb-6 pt-2" style={{ opacity: expanded ? 1 : 0, transition: "opacity 300ms var(--ease-out) 120ms" }}>
              <div className="mb-5 flex flex-wrap items-center gap-1.5 border-b pb-4" style={{ borderColor: "var(--border-op)" }}>
                {PRESETS.map((p) => {
                  const on = preset === p.label;
                  return (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className="text-code rounded-full border px-2.5 py-1 transition-colors duration-150"
                      style={{
                        borderColor: on ? "color-mix(in oklab, var(--operational) 45%, transparent)" : "var(--border-op)",
                        background: on ? "color-mix(in oklab, var(--operational) 14%, transparent)" : "transparent",
                        color: on ? "var(--operational)" : "var(--muted-foreground)",
                        fontSize: 10,
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
                {/* LEFT */}
                <div className="space-y-7">
                  {/* PRIMARY TIER */}
                  <ConfigSection title="goal" note="what to produce" tier="primary">
                    <div className="space-y-1" style={{ transition: "opacity 150ms var(--ease-out)", opacity: flash ? 0.55 : 1 }}>
                      {GOALS.map((g) => (
                        <GoalRow key={g.id} selected={goal === g.id} onSelect={() => setGoal(g.id)} label={g.label} consequence={g.consequence} icon={g.icon} />
                      ))}
                    </div>
                  </ConfigSection>

                  <ConfigSection title="execution mode" note="how to think">
                    <div className="flex flex-wrap gap-1 rounded-lg border p-1" style={{ borderColor: "var(--border-op)", transition: "opacity 150ms var(--ease-out)", opacity: flash ? 0.55 : 1 }}>
                      {MODES.map((m) => (
                        <button key={m} onClick={() => setMode(m)} className="text-ui rounded-md px-2.5 py-1.5 transition-colors" style={{ fontSize: 12, background: mode === m ? "color-mix(in oklab, var(--operational) 16%, transparent)" : "transparent", color: mode === m ? "var(--operational)" : "var(--muted-foreground)" }}>{m}</button>
                      ))}
                    </div>
                    <p className="text-ui mt-2 px-0.5" style={{ fontSize: 11, opacity: 0.6 }}>{MODE_CONSEQUENCE[mode]}</p>
                  </ConfigSection>

                  <ConfigSection title="output format" tier="tertiary">
                    <div className="flex flex-wrap gap-1">
                      {FORMATS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className="text-ui rounded-md border px-2 py-1 transition-colors duration-150"
                          style={{
                            fontSize: 11,
                            borderColor: format === f ? "color-mix(in oklab, var(--operational) 38%, transparent)" : "var(--border-op)",
                            color: format === f ? "var(--foreground)" : "var(--muted-foreground)",
                            opacity: format === f ? 0.95 : 0.6,
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </ConfigSection>
                </div>

                {/* RIGHT */}
                <div className="space-y-7">
                  <ConfigSection title="orchestration strategy" note="how agents coordinate">
                    <div className="space-y-1">
                      {STRATEGIES.map((s) => (
                        <GoalRow key={s.id} selected={!s.locked && strategy === s.id} onSelect={() => {}} label={s.label} consequence={s.consequence} locked={s.locked} dense />
                      ))}
                    </div>
                  </ConfigSection>

                  <ConfigSection title="intelligence modules" note="optional capabilities" tier="tertiary">
                    <div className="space-y-3">
                      {MODULE_FAMILIES.map((fam) => (
                        <div key={fam.id}>
                          <div className="text-code mb-0.5 px-1.5 uppercase text-muted-foreground/40" style={{ fontSize: 10, letterSpacing: "0.12em" }}>{fam.label}</div>
                          {MODULES.filter((m) => m.family === fam.id).map((m) => {
                        const on = modules.includes(m.id);
                        return (
                          <button key={m.id} onClick={() => setModules((prev) => on ? prev.filter((x) => x !== m.id) : [...prev, m.id])} className="flex w-full items-center justify-between rounded-md px-1.5 py-1 text-left transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]">
                            <span className="flex items-center gap-2">
                              <span className="text-ui" style={{ fontSize: 12, color: on ? "var(--foreground)" : "var(--muted-foreground)", opacity: on ? 0.95 : 0.7 }}>{m.label}</span>
                              <span className="text-code text-muted-foreground/60" style={{ fontSize: 10 }}>{m.agent}</span>
                            </span>
                            <span className="relative inline-flex h-[16px] w-[28px] shrink-0 items-center rounded-full transition-colors duration-150" style={{ background: on ? "var(--operational)" : "color-mix(in oklab, var(--foreground) 12%, transparent)" }}>
                              <span className="absolute h-[11px] w-[11px] rounded-full transition-all duration-150" style={{ left: on ? 14 : 3, background: on ? "#0a1a12" : "var(--muted-foreground)" }} />
                            </span>
                          </button>
                        );
                          })}
                        </div>
                      ))}
                    </div>
                  </ConfigSection>

                  <ConfigSection title="complexity estimate" tier="tertiary">
                    <div className="text-code text-muted-foreground/50" style={{ fontSize: 10, lineHeight: 1.6 }}>
                      {estimate}
                      <div className="mt-0.5 text-muted-foreground/35" style={{ fontSize: 10 }}>updates as you describe the idea</div>
                    </div>
                  </ConfigSection>
                </div>
              </div>

              {/* footer */}
              <div className="mt-8 border-t pt-5" style={{ borderColor: "var(--border-op)" }}>
                {/* MISSION BRIEF → derived confirmation of journey_config */}
                <div
                  className="mb-4 rounded-r-md px-4 py-3"
                  style={{
                    background: "color-mix(in oklab, #000 22%, var(--surface-op-elevated))",
                    borderLeft: "2px solid var(--operational)",
                  }}
                >
                  <div className="text-code mb-1 uppercase text-muted-foreground/45" style={{ fontSize: 10, letterSpacing: "0.12em" }}>mission brief</div>
                  <p className="text-ui text-foreground" style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>{brief}</p>
                </div>
                <button onClick={onRun} disabled={!canRun} className="text-ui flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium transition-all disabled:cursor-not-allowed" style={{ background: canRun ? "var(--operational)" : "color-mix(in oklab, var(--operational) 22%, transparent)", color: canRun ? "#0a1a12" : "color-mix(in oklab, var(--foreground) 40%, transparent)", fontSize: 14 }}>
                  Run Lifecycle
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <SmallSelect label="model" value={model} options={MODELS.map((m) => ({ value: m, label: m }))} onChange={setModel} />
                    <span className="text-code text-muted-foreground/60" style={{ fontSize: 10 }}>⌘↵ to run</span>
                  </div>
                  <button onClick={onRun} disabled={!canRun} className="text-ui text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-40" style={{ fontSize: 12 }}>Quick Run · last settings</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSection({ title, note, children, tier = "secondary" }: { title: string; note?: string; children: React.ReactNode; tier?: "primary" | "secondary" | "tertiary" }) {
  const size = tier === "primary" ? 12 : tier === "tertiary" ? 10 : 11;
  const op = tier === "primary" ? 0.85 : tier === "tertiary" ? 0.4 : 0.7;
  return (
    <section>
      <div className="mb-2.5 flex items-baseline gap-2">
        <h3 className="text-code uppercase" style={{ fontSize: size, letterSpacing: "0.1em", color: "var(--muted-foreground)", opacity: op }}>{title}</h3>
        {note ? <span className="text-ui text-muted-foreground/45" style={{ fontSize: tier === "tertiary" ? 10 : 11 }}>{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

/* GoalRow → journey_config.goal / orchestration_strategy — option + inline consequence */
function GoalRow({ selected, onSelect, label, consequence, icon, locked, dense }: { selected: boolean; onSelect: () => void; label: string; consequence?: string; icon?: string; locked?: boolean; dense?: boolean }) {
  return (
    <button
      onClick={locked ? undefined : onSelect}
      disabled={locked}
      className={`group flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-150 ${locked ? "cursor-not-allowed" : "hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]"}`}
      style={{
        opacity: locked ? 0.4 : 1,
        background: selected ? "color-mix(in oklab, var(--operational) 8%, transparent)" : undefined,
        boxShadow: selected ? "inset 0 0 0 1px color-mix(in oklab, var(--operational) 26%, transparent)" : undefined,
      }}
    >
      <span className="mt-[3px] grid h-[14px] w-[14px] shrink-0 place-items-center rounded-full border transition-colors duration-150" style={{ borderColor: selected ? "var(--operational)" : "color-mix(in oklab, var(--foreground) 22%, transparent)" }}>
        {selected ? <span className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--operational)" }} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {icon ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: selected ? "var(--operational)" : "var(--muted-foreground)" }}>
              <path d={icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
          <span className="text-ui truncate" style={{ fontSize: dense ? 13 : selected ? 15 : 14, fontWeight: selected ? 500 : 400, color: selected ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
          {locked ? (
            <span className="ml-auto flex shrink-0 items-center gap-1 text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 11V8a5 5 0 0110 0v3M5 11h14v10H5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-code" style={{ fontSize: 10 }}>Coming Soon</span>
            </span>
          ) : null}
        </span>
        {consequence ? (
          <span
            className={`text-code leading-snug transition-opacity duration-150 ${selected || locked ? "mt-0.5 block opacity-60" : "mt-0.5 hidden opacity-50 group-hover:block"}`}
            style={{ fontSize: 11, color: "var(--muted-foreground)" }}
          >
            {consequence}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/* ─── STATE 1.5 · INITIALIZING ───────────────────────────────────────── */

function Initializing({ idea, onDone }: { idea: string; onDone: () => void }) {
  /* → journey_runs.status — the run stays live until the library is ready */
  const [status, setStatus] = useState<RunStatus>("running");
  const { events, elapsed } = useOrchestrationRun(LIFECYCLE_SCRIPT, { status, intervalMs: 1400 });

  useEffect(() => {
    const t = setTimeout(() => setStatus("complete"), LIFECYCLE_SCRIPT.length * 1400 + 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
      <div className="mb-8 w-full max-w-2xl rounded-2xl border px-5 py-3" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}>
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>building your product · {PROJECT_NAME.toLowerCase()}</div>
        <div className="mt-1 text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 20, lineHeight: 1.3 }}>{idea || "a calm cross-timezone standup for distributed product teams"}</div>
      </div>

      {/* the one reusable orchestration surface → journey_events */}
      <div className="w-full" style={{ maxWidth: 460 }}>
        <OrchestrationStream events={events} status={status} elapsed={elapsed} completeLabel="Lifecycle complete" />
      </div>

      {status === "complete" ? (
        <button
          onClick={onDone}
          className="spring-in mt-6 rounded-lg px-4 py-2.5 font-medium transition-transform duration-150 hover:-translate-y-px"
          style={{ background: "var(--operational)", color: "#0a1a12", fontSize: 13.5 }}
        >
          Open artifact library →
        </button>
      ) : null}
    </main>
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
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [resolved, setResolved] = useState<string[]>([]);
  const reader = useReader();
  const issues = ATTENTION.filter((i) => !resolved.includes(i.id)).slice(0, 3);

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
      <WorkspaceExplorer activeId={inspectId} onSelect={(id) => setInspectId((p) => (p === id ? null : id))} />
      <main className="min-w-0 flex-1 px-8 pb-24 pt-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="pb-6">
            <div className="text-code mb-3 text-muted-foreground" style={{ fontSize: 10 }}>{WORKSPACE_PATH}</div>
            <h1 className="text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>The library</h1>
          </div>

          <DailyBrief issueCount={issues.length} />
          <AttentionDrawer
            issues={issues}
            onReview={(artifactId) => reader.open(artifactId)}
            onResolve={(issueId) => setResolved((p) => [...p, issueId])}
          />

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

          <div
            className={`mt-8 grid gap-0 overflow-hidden rounded-xl ${density === "cozy" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
            style={{ borderTop: "1px dashed color-mix(in oklab, var(--foreground) 10%, transparent)", borderLeft: "1px dashed color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          >
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
      <ArtifactInspector id={inspectId} onClose={() => setInspectId(null)} />
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

function StatusDot({ state }: { state: Artifact["state"] }) {
  if (state === "generated") return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />;
  if (state === "stale") return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--warning)" }} />;
  if (state === "generating") return <span className="pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />;
  return <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full border" style={{ borderColor: "var(--border-strong)" }} />;
}

/* ─── ARTIFACT CARD → artifact file + journey.json stages[N] ─────────── */


/* ─── DAILY BRIEF → journey.json head state, above the library ────────
 *  What changed since the user last looked. Reads, never asks.
 * ──────────────────────────────────────────────────────────────────── */

function DailyBrief({ issueCount }: { issueCount: number }) {
  const generated = ARTIFACTS.filter((a) => a.state === "generated").length;
  const worst = ATTENTION[0] ? ARTIFACTS.find((a) => a.id === ATTENTION[0].artifactId) : undefined;
  return (
    <p
      className="mb-7 max-w-[62ch] text-foreground/85"
      style={{ fontSize: 17.5, lineHeight: 1.6, animation: "ig-fade-up 420ms var(--ease-out) both" }}
    >
      {issueCount === 0
        ? `Your product thinking is holding together. ${generated} artifacts written, nothing waiting on you.`
        : `Your product thinking is mostly solid. ${issueCount === 1 ? "One artifact" : `${issueCount} artifacts`}${worst ? ` — starting with the ${worst.name}` : ""} — need${issueCount === 1 ? "s" : ""} review before continuing.`}
    </p>
  );
}

/* ─── ATTENTION DRAWER → attention_queue (derived) ────────────────────
 *  Exists only while something needs a decision. Springs down, springs up.
 * ──────────────────────────────────────────────────────────────────── */

function AttentionDrawer({ issues, onReview, onResolve }: { issues: AttentionIssue[]; onReview: (artifactId: string) => void; onResolve: (issueId: string) => void }) {
  const [shown, setShown] = useState(false);
  const has = issues.length > 0;
  useEffect(() => {
    if (has) { const r = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(r); }
    setShown(false);
  }, [has]);

  return (
    <div
      className="grid overflow-hidden"
      style={{ gridTemplateRows: has && shown ? "1fr" : "0fr", transition: "grid-template-rows 300ms cubic-bezier(0.22, 1.3, 0.36, 1)" }}
      aria-live="polite"
    >
      <div className="min-h-0">
        <section
          className="mb-7 rounded-xl border-l-2 py-4 pl-5 pr-4"
          style={{
            borderLeftColor: "var(--warning)",
            background: "color-mix(in oklab, var(--warning) 5%, transparent)",
            transform: has && shown ? "translateY(0)" : "translateY(-8px)",
            opacity: has && shown ? 1 : 0,
            transition: "transform 300ms cubic-bezier(0.22, 1.3, 0.36, 1), opacity 200ms ease-out",
          }}
          aria-label="Needs attention"
        >
          <div className="text-label text-muted-foreground" style={{ fontSize: 9.5 }}>needs attention</div>
          <ul className="mt-3 space-y-3">
            {issues.map((i) => {
              const a = ARTIFACTS.find((x) => x.id === i.artifactId);
              if (!a) return null;
              return (
                <li key={i.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-foreground" style={{ fontSize: 14.5 }}>{a.name}</span>
                  <span className="text-code" style={{ fontSize: 10, color: "var(--warning)" }}>{i.kind}</span>
                  <span className="text-muted-foreground" style={{ fontSize: 13 }}>
                    affects {downstreamCount(a.id)} downstream artifact{downstreamCount(a.id) === 1 ? "" : "s"}
                  </span>
                  <div className="ml-auto flex items-center gap-4">
                    <button onClick={() => onResolve(i.id)} className="text-code text-muted-foreground transition-colors hover:text-foreground" style={{ fontSize: 10 }}>dismiss</button>
                    <button onClick={() => onReview(a.id)} className="text-ui inline-flex items-center gap-1 transition-colors" style={{ fontSize: 13, color: "var(--operational)" }}>
                      Review →
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** artifact type → lucide icon (visual taxonomy only) */
function iconFor(artifact: Artifact) {
  const n = `${artifact.docType ?? ""} ${artifact.name}`.toLowerCase();
  if (n.includes("research") || n.includes("discovery")) return Search;
  if (n.includes("prd") || n.includes("requirement")) return FileText;
  if (n.includes("ux") || n.includes("design") || n.includes("flow")) return PenLine;
  if (n.includes("architect") || n.includes("system")) return Boxes;
  if (n.includes("qa") || n.includes("valid") || n.includes("test")) return ShieldCheck;
  if (n.includes("backlog") || n.includes("release") || n.includes("priorit")) return ListChecks;
  if (n.includes("problem") || n.includes("hypothes")) return Lightbulb;
  return FileText;
}

function ArtifactCard({ artifact, index, density }: { artifact: Artifact; index: number; density: "cozy" | "dense" }) {
  const reader = useReader();
  const cardRef = useRef<HTMLDivElement>(null);
  const openHere = () => {
    const r = cardRef.current?.getBoundingClientRect();
    reader.open(artifact.id, r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
  };
  const [hover, setHover] = useState(false);
  const pending = artifact.state !== "generated";
  const dense = density === "dense";
  const dash = (o: number) => `1px dashed color-mix(in oklab, var(--foreground) ${o}%, transparent)`;
  const stagger = `${Math.min(index * 40, 480)}ms`;

  if (pending) {
    return (
      <div
        className="card-blur-in flex min-h-[168px] flex-col px-5 py-5"
        style={{ borderRight: dash(4), borderBottom: dash(4), animationDelay: stagger }}
      >
        <div className="flex items-start justify-between gap-3">
          <Clock size={15} style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full border" style={{ borderColor: "var(--border-strong)" }} />
        </div>
        <h3 className="mt-3" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: "color-mix(in oklab, var(--muted-foreground) 70%, transparent)" }}>{artifact.name}</h3>
        <div className="text-code mt-auto pt-4" style={{ fontSize: 10, color: "color-mix(in oklab, var(--muted-foreground) 60%, transparent)" }}>Not yet generated</div>
      </div>
    );
  }

  const statusTone: Record<string, string> = { passing: "var(--operational)", approved: "var(--operational)", warnings: "var(--warning)", changes: "var(--warning)", pending: "var(--info)" };
  const tone = statusTone[artifact.status ?? "pending"];
  const Icon = iconFor(artifact);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={openHere}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") openHere(); }}
      className="card-blur-in relative flex min-h-[168px] cursor-pointer flex-col px-5 py-5 transition-colors duration-300 ease-out"
      style={{
        borderRight: hover ? "1px dashed color-mix(in oklab, var(--operational) 42%, transparent)" : dash(10),
        borderBottom: hover ? "1px dashed color-mix(in oklab, var(--operational) 42%, transparent)" : dash(10),
        background: hover ? "color-mix(in oklab, var(--operational) 4%, transparent)" : "transparent",
        animationDelay: stagger,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon size={15} style={{ color: hover ? "var(--operational)" : "var(--muted-foreground)", transition: "color 200ms var(--ease-out)" }} />
        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tone }} />
      </div>

      <h3 className="mt-3 text-foreground" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.005em" }}>{artifact.name}</h3>
      {!dense ? (
        <p className="mt-2 text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{artifact.summary}</p>
      ) : null}

      <div className="text-code mt-auto pt-4 text-muted-foreground" style={{ fontSize: 10 }}>
        v{artifact.version} · {artifact.confidence === "high" ? "High" : artifact.confidence === "medium" ? "Moderate" : "Low"} confidence
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

/* ─── ARTIFACT READER → persisted artifact markdown (read-only) ──────
 *  Expand-in-place: the card's rect is the animation origin, so the card
 *  appears to unfold into the reading surface rather than a modal appearing.
 * ──────────────────────────────────────────────────────────────────── */

function ArtifactReader({ id, origin, onClose }: { id: string | null; origin: Origin; onClose: () => void }) {
  const artifact = id ? ARTIFACTS.find((a) => a.id === id) ?? null : null;
  const [mounted, setMounted] = useState<Artifact | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (artifact) {
      setMounted(artifact);
      setEntered(false);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(null), 220);
    return () => clearTimeout(t);
  }, [artifact]);

  useEffect(() => {
    if (!artifact) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [artifact]);

  if (!mounted) return null;

  const collapsed = origin
    ? { top: origin.top, left: origin.left, width: origin.width, height: origin.height }
    : { top: "48%", left: "50%", width: 420, height: 260, transform: "translate(-50%,-50%)" as const };

  const expandedStyle: React.CSSProperties = {
    top: "5vh",
    left: "50%",
    width: "min(920px, calc(100vw - 48px))",
    height: "90vh",
    transform: "translateX(-50%)",
  };

  const cat = categoryOf(mounted.stage);
  const sections = bodyOf(mounted);
  const downstream = (mounted.downstream ?? []).map((d) => ARTIFACTS.find((a) => a.id === d)).filter(Boolean) as Artifact[];

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 z-50"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(3px)",
          opacity: entered ? 1 : 0,
          transition: "opacity 200ms var(--ease-out)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mounted.title}
        className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border"
        style={{
          ...(entered ? expandedStyle : collapsed),
          background: "var(--surface-op-elevated)",
          borderColor: entered ? "color-mix(in oklab, var(--operational) 24%, var(--border-op))" : "var(--border-op)",
          boxShadow: "0 40px 90px -40px rgba(0,0,0,0.75)",
          opacity: entered ? 1 : 0.6,
          transition: "top 200ms cubic-bezier(0.22,1,0.32,1), left 200ms cubic-bezier(0.22,1,0.32,1), width 200ms cubic-bezier(0.22,1,0.32,1), height 200ms cubic-bezier(0.22,1,0.32,1), transform 200ms cubic-bezier(0.22,1,0.32,1), opacity 160ms ease-out, border-color 200ms",
        }}
      >
        {/* header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b px-8 py-4" style={{ borderColor: "var(--border-op)" }}>
          <span className="text-code truncate text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>
            {WORKSPACE_PATH}{mounted.outputFile}
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/studio"
              search={{ artifact: mounted.id }}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-transform duration-150 hover:-translate-y-px"
              style={{ background: "var(--operational)", color: "#0a1a12", fontSize: 13 }}
            >
              Open in Studio
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <button onClick={onClose} className="text-code rounded-md border px-2 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>esc</button>
          </div>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto" style={{ opacity: entered ? 1 : 0, transition: "opacity 180ms ease-out 80ms" }}>
          <article className="mx-auto max-w-[720px] px-10 py-10">
            <div className="text-code mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>
              <span style={{ color: CATEGORY_COLOR[cat] }}>{cat}</span>
              <span>stage {mounted.stage}</span>
              <span>{mounted.agent}</span>
              <span>v{mounted.version}</span>
              <span>{mounted.confidence} confidence</span>
              <span>{mounted.readMin} min read</span>
            </div>

            <h1 className="text-foreground" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.015em" }}>{mounted.title}</h1>

            {sections.map((sec) => (
              <section key={sec.heading} className="mt-8">
                <h2 className="text-foreground" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{sec.heading}</h2>
                {sec.blocks.map((b, i) => {
                  if (b.kind === "p") return <p key={i} className="mt-3 text-foreground/80" style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.75 }}>{b.text}</p>;
                  if (b.kind === "ul") return (
                    <ul key={i} className="mt-3 space-y-2">
                      {b.items.map((it) => (
                        <li key={it} className="flex gap-3 text-foreground/80" style={{ fontSize: 15, lineHeight: 1.75 }}>
                          <span aria-hidden className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  );
                  return (
                    <div key={i} className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-op)" }}>
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr>{b.head.map((h) => (<th key={h} className="text-label px-4 py-2 text-muted-foreground" style={{ fontSize: 10, borderBottom: "1px solid var(--border-op)" }}>{h}</th>))}</tr>
                        </thead>
                        <tbody>
                          {b.rows.map((r, ri) => (
                            <tr key={ri}>{r.map((c, ci) => (<td key={ci} className="px-4 py-2 text-foreground/80" style={{ fontSize: 14, lineHeight: 1.6, borderTop: ri ? "1px solid var(--border-op)" : "none" }}>{c}</td>))}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </section>
            ))}

            {/* metadata tier → journey.json stages[N] */}
            <div className="mt-10 border-t pt-6" style={{ borderColor: "var(--border-op)" }}>
              <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>metadata</div>
              <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                {[
                  ["agent", `${mounted.agent} · ${AGENTS.find((a) => a.code === mounted.agent)?.name ?? ""}`],
                  ["confidence", mounted.confidence ?? "—"],
                  ["version", `v${mounted.version}`],
                  ["validation", mounted.status ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-code text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>{k}</dt>
                    <dd className="text-ui mt-1 text-foreground" style={{ fontSize: 13 }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <div className="text-code text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>downstream dependencies</div>
                {downstream.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {downstream.map((d) => (
                      <span key={d.id} className="text-ui rounded-md border px-2.5 py-1 text-muted-foreground" style={{ fontSize: 12, borderColor: "var(--border-op)" }}>{d.name}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-ui mt-2 text-muted-foreground" style={{ fontSize: 13 }}>No artifact consumes this one yet.</div>
                )}
              </div>
            </div>
          </article>
        </div>
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
