import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: [
      { title: "Desk — IdeaGate" },
      { name: "description", content: "Desk is the reading and discovery surface of IdeaGate. Browse artifacts, launch journeys, and search everything your agents have produced." },
      { property: "og:title", content: "Desk — IdeaGate" },
      { property: "og:description", content: "The library and workspace home of the IdeaGate Product Operating System." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeskPage,
});

/* ═════════════════════════════════════════════════════════════════════════
 *  DESK — reading · discovery · organisation
 *  Mission Control: "what is happening" · Desk: "what exists" · Studio: "improve"
 *
 *  Backend mapping:
 *    IdeaComposer       → lifecycle runner (POST /journeys)
 *    LaunchChoreography → journey_events (lifecycle.init.*)
 *    WorkspaceSidebar   → workspace filesystem
 *    ArtifactGrid       → artifact_versions (latest per artifact_id)
 *    FilterBar          → artifact_versions.metadata
 *    ReadingView        → persisted artifact (workspace/.../*.md)
 *    CommandPalette     → artifact_index
 * ══════════════════════════════════════════════════════════════════════ */

const ReaderContext = createContext<{ open: (id: string) => void }>({ open: () => {} });
const useReader = () => useContext(ReaderContext);

function DeskPage() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [readerId, setReaderId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"empty" | "launching" | "populated">("empty");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      else if (e.key === "Escape") { setPaletteOpen(false); setReaderId(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (phase !== "launching") return;
    const t = setTimeout(() => setPhase("populated"), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <ReaderContext.Provider value={{ open: setReaderId }}>
      <div className="dark relative min-h-screen overflow-x-hidden" style={{ background: "var(--surface-op-sunken)", color: "var(--foreground)" }}>
        <DeskAtmosphere />
        <div className="relative z-10 flex min-h-screen">
          <DeskSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DeskTopbar phase={phase} onOpenPalette={() => setPaletteOpen(true)} onReset={() => setPhase("empty")} />
            {phase === "empty" ? (
              <EmptyDesk onLaunch={() => setPhase("launching")} onSkip={() => setPhase("populated")} />
            ) : phase === "launching" ? (
              <LaunchChoreography />
            ) : (
              <PopulatedDesk />
            )}
          </div>
        </div>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenArtifact={(id) => { setPaletteOpen(false); setReaderId(id); }} />
        <ReadingView id={readerId} onClose={() => setReaderId(null)} />
      </div>
    </ReaderContext.Provider>
  );
}

function DeskAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-[15%] -top-[25%] h-[70vh] w-[70vh] rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--operational) 14%, transparent), transparent 70%)", filter: "blur(90px)", animation: "ig-aurora-a 46s ease-in-out infinite alternate" }} />
      <div className="absolute -right-[12%] top-[15%] h-[55vh] w-[55vh] rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--info) 10%, transparent), transparent 70%)", filter: "blur(100px)", animation: "ig-aurora-a 62s ease-in-out infinite alternate-reverse" }} />
      <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 78%)" }} />
    </div>
  );
}

type NavItem = { id: string; label: string; kbd?: string; href?: string; active?: boolean; disabled?: boolean };
const DESK_NAV: NavItem[] = [
  { id: "desk", label: "Desk", kbd: "D", href: "/desk", active: true },
  { id: "studio", label: "Studio", kbd: "S", disabled: true },
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
          <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>journeys</div>
          <ul className="space-y-0.5">
            {[{ code: "J-014", label: "Nimbus Atlas", stage: "define" }, { code: "J-013", label: "Onboarding Reforge", stage: "design" }, { code: "J-011", label: "Pricing v3", stage: "ship" }].map((j) => (
              <li key={j.code}>
                <button className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:text-foreground">
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-code inline-block rounded px-1 py-px" style={{ fontSize: 9, background: "var(--surface-op-sunken)" }}>{j.code}</span>
                    <span className="text-ui truncate" style={{ fontSize: 12 }}>{j.label}</span>
                  </span>
                  <span className="text-code" style={{ fontSize: 9 }}>{j.stage}</span>
                </button>
              </li>
            ))}
          </ul>
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

function DeskTopbar({ phase, onOpenPalette, onReset }: { phase: "empty" | "launching" | "populated"; onOpenPalette: () => void; onReset: () => void }) {
  const status = phase === "empty" ? "READY" : phase === "launching" ? "INITIALISING" : "LIVE";
  const statusColor = phase === "empty" ? "var(--info)" : "var(--operational)";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-8" style={{ background: "color-mix(in oklab, var(--surface-op) 78%, transparent)", backdropFilter: "saturate(140%) blur(14px)", borderColor: "var(--border-op)" }}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-code" style={{ fontSize: 11 }}>workspace</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui text-foreground" style={{ fontSize: 13 }}>Nimbus Atlas</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui" style={{ fontSize: 13 }}>Desk</span>
        <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5" style={{ borderColor: "var(--border-op)", background: `color-mix(in oklab, ${statusColor} 8%, transparent)` }}>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
          <span className="text-code" style={{ fontSize: 10, color: statusColor }}>{status}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {phase !== "empty" ? (
          <button onClick={onReset} className="text-code rounded-md border px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>new desk</button>
        ) : null}
        <button onClick={onOpenPalette} className="group inline-flex items-center gap-3 rounded-md border px-3 py-1.5 transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", color: "var(--muted-foreground)" }}>
          <span className="text-ui" style={{ fontSize: 12 }}>Search everything</span>
          <span className="flex items-center gap-1"><span className="kbd-key">⌘</span><span className="kbd-key">K</span></span>
        </button>
        <Link to="/" className="text-ui rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">← Exit</Link>
      </div>
    </header>
  );
}

/* ─── EMPTY DESK ─────────────────────────────────────────────────────── */

function EmptyDesk({ onLaunch, onSkip }: { onLaunch: () => void; onSkip: () => void }) {
  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-6 pb-24 pt-16">
      <div className="mb-10" style={{ animation: "ig-fade-up 700ms var(--ease-out) 150ms both" }}>
        <span className="text-code inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--operational) 8%, transparent)", color: "var(--operational)", fontSize: 10 }}>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
          new workspace · nothing here yet
        </span>
      </div>
      <h1 className="mb-3 max-w-3xl text-balance text-center" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.75rem, 5vw, 4.25rem)", lineHeight: 1.02, letterSpacing: "-0.02em", animation: "ig-fade-up 800ms var(--ease-out) 260ms both" }}>
        What are we thinking about today?
      </h1>
      <p className="mb-12 max-w-xl text-center text-muted-foreground" style={{ fontSize: 15, lineHeight: 1.55, animation: "ig-fade-up 800ms var(--ease-out) 380ms both" }}>
        Describe a raw idea. IdeaGate coordinates a team of specialised agents to research, shape, and build it into a full set of production-ready product artifacts.
      </p>
      <div className="w-full max-w-3xl" style={{ animation: "ig-fade-up 900ms var(--ease-out) 520ms both" }}>
        <IdeaComposer onRun={onLaunch} />
      </div>
      <div className="mt-14 flex flex-col items-center gap-3" style={{ animation: "ig-fade-up 900ms var(--ease-out) 720ms both" }}>
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>or start from a preset</div>
        <div className="flex flex-wrap justify-center gap-2">
          {["SaaS product", "Mobile app", "Internal tool", "Marketplace", "AI feature"].map((p) => (
            <button key={p} className="text-ui rounded-full border px-3 py-1.5 text-muted-foreground transition-all hover:text-foreground" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op) 60%, transparent)", fontSize: 12 }}>{p}</button>
          ))}
        </div>
        <button onClick={onSkip} className="text-code mt-6 text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" style={{ fontSize: 10 }}>peek populated desk →</button>
      </div>
    </main>
  );
}

/* ─── IDEA COMPOSER ──────────────────────────────────────────────────── */

function IdeaComposer({ onRun, compact = false }: { onRun: () => void; compact?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const [productType, setProductType] = useState("SaaS product");
  const [priority, setPriority] = useState("normal");
  const [preset, setPreset] = useState("Full lifecycle");
  const [target, setTarget] = useState("New journey");
  const expanded = focused || value.length > 0;
  const canRun = value.trim().length > 4;

  return (
    <div className="group relative rounded-2xl border transition-all duration-300 ease-out" style={{ borderColor: expanded ? "color-mix(in oklab, var(--operational) 45%, var(--border-op))" : "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-elevated) 92%, transparent)", boxShadow: expanded ? "0 30px 80px -40px color-mix(in oklab, var(--operational) 55%, transparent), 0 1px 0 color-mix(in oklab, var(--foreground) 6%, transparent) inset" : "0 20px 60px -30px rgba(0,0,0,0.35), 0 1px 0 color-mix(in oklab, var(--foreground) 5%, transparent) inset" }}>
      {expanded ? (
        <div className="execution-bar pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden rounded-t-2xl">
          <div className="execution-bar-scan" />
        </div>
      ) : null}
      <div className="flex items-start gap-3 px-5 pt-4">
        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: "color-mix(in oklab, var(--operational) 14%, transparent)", color: "var(--operational)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canRun) { e.preventDefault(); onRun(); } }}
          rows={expanded ? 3 : (compact ? 1 : 2)}
          placeholder="Describe your idea… e.g. a calm cross-timezone standup for distributed product teams"
          className="w-full resize-none bg-transparent py-2 pr-4 text-foreground outline-none placeholder:text-muted-foreground/70"
          style={{ fontFamily: "var(--font-serif)", fontSize: expanded ? 22 : 18, lineHeight: 1.35, letterSpacing: "-0.005em", transition: "font-size 240ms var(--ease-out)" }}
        />
      </div>
      <div className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
        <div className="min-h-0">
          <div className="mx-5 mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "var(--border-op)" }}>
            <ComposerChip label="type" value={productType} options={["SaaS product", "Mobile app", "Internal tool", "Marketplace", "AI feature"]} onChange={setProductType} />
            <ComposerChip label="priority" value={priority} options={["low", "normal", "high"]} onChange={setPriority} tone={priority === "high" ? "warn" : "op"} />
            <ComposerChip label="preset" value={preset} options={["Full lifecycle", "Discovery only", "Design only", "Build sprint"]} onChange={setPreset} />
            <div className="mx-1 h-4 w-px" style={{ background: "var(--border-op)" }} />
            <ComposerChip label="target" value={target} options={["New journey", "Continue current"]} onChange={setTarget} />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{value.length} chars · 6 agents will be dispatched</span>
            </div>
          </div>
          <div className="mx-5 mt-3 flex items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <span className="text-code" style={{ fontSize: 10 }}>a full journey typically completes in 8–14 min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}><span className="kbd-key">⌘</span> <span className="kbd-key">↵</span> to run</span>
              <button onClick={onRun} disabled={!canRun} className="group relative overflow-hidden rounded-md px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed" style={{ background: canRun ? "var(--operational)" : "color-mix(in oklab, var(--operational) 25%, transparent)", color: "#0a1a12", boxShadow: canRun ? "0 8px 24px -8px color-mix(in oklab, var(--operational) 60%, transparent)" : "none" }}>
                <span className="relative z-10 inline-flex items-center gap-2">
                  Run journey
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {canRun ? (<span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 opacity-70" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", animation: "ig-scan 2.4s var(--ease-standard) infinite" }} />) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerChip({ label, value, options, onChange, tone = "muted" }: { label: string; value: string; options: string[]; onChange: (v: string) => void; tone?: "muted" | "op" | "warn" }) {
  const [open, setOpen] = useState(false);
  const toneColor = tone === "op" ? "var(--operational)" : tone === "warn" ? "var(--warning)" : "var(--muted-foreground)";
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 120)} className="text-ui inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 12 }}>
        <span className="text-code" style={{ fontSize: 10 }}>{label}</span>
        <span style={{ color: toneColor }}>{value}</span>
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 min-w-[160px] overflow-hidden rounded-lg border py-1 shadow-2xl" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-elevated) 96%, transparent)", backdropFilter: "blur(12px)", animation: "ig-fade-up 180ms var(--ease-out) both" }}>
          {options.map((o) => (
            <button key={o} onMouseDown={() => { onChange(o); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-1.5 text-left text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground">
              <span className="text-ui" style={{ fontSize: 12 }}>{o}</span>
              {o === value ? <span className="text-code" style={{ color: "var(--operational)", fontSize: 10 }}>✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ─── LAUNCH CHOREOGRAPHY ────────────────────────────────────────────── */

const INIT_STEPS = [
  { t: 320, label: "provisioning workspace", detail: "workspace/nimbus-atlas/…" },
  { t: 720, label: "resolving prompt preset", detail: "preset: full-lifecycle" },
  { t: 1150, label: "waking coordinator", detail: "C-01 online · 12 msg/s" },
  { t: 1550, label: "dispatching agents", detail: "R-01 · S-01 · U-01 · A-01 · Q-01" },
  { t: 2050, label: "seeding artifact scaffolds", detail: "6 placeholders written" },
  { t: 2550, label: "opening event stream", detail: "journey_events → live" },
];

function LaunchChoreography() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => { setTick(now - start); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
      <div className="mb-10 w-full max-w-2xl opacity-80" style={{ transform: "scale(0.94)" }}>
        <div className="rounded-2xl border px-5 py-3" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-elevated) 90%, transparent)" }}>
          <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>initialising journey · J-014 · nimbus atlas</div>
          <div className="mt-1 truncate text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 20, lineHeight: 1.3 }}>a calm cross-timezone standup for distributed product teams</div>
        </div>
      </div>
      <InitConstellation tick={tick} />
      <ol className="mt-10 w-full max-w-lg space-y-1.5">
        {INIT_STEPS.map((s, i) => {
          const active = tick >= s.t;
          const current = active && (i === INIT_STEPS.length - 1 || tick < INIT_STEPS[i + 1].t);
          return (
            <li key={s.label} className="flex items-baseline gap-3 rounded-md px-3 py-1.5 transition-colors" style={{ background: current ? "color-mix(in oklab, var(--operational) 8%, transparent)" : "transparent", opacity: active ? 1 : 0.35 }}>
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

function InitConstellation({ tick }: { tick: number }) {
  const R = 110;
  const cx = 200, cy = 130;
  const agents = [
    { code: "R-01", angle: -Math.PI / 2, wakeAt: 1150 },
    { code: "S-01", angle: 0, wakeAt: 1400 },
    { code: "U-01", angle: Math.PI / 2, wakeAt: 1650 },
    { code: "A-01", angle: Math.PI, wakeAt: 1900 },
  ].map((a) => ({ ...a, x: cx + Math.cos(a.angle) * R, y: cy + Math.sin(a.angle) * R }));
  return (
    <svg viewBox="0 0 400 260" className="h-[260px] w-[400px]">
      <defs><radialGradient id="core-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="var(--operational)" stopOpacity="0.55" /><stop offset="100%" stopColor="var(--operational)" stopOpacity="0" /></radialGradient></defs>
      {[40, 80, 120].map((r, i) => (<circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-op)" strokeWidth={0.7} strokeDasharray="2 4" opacity={0.6 - i * 0.15} />))}
      {agents.map((a) => {
        const on = tick >= a.wakeAt;
        return <line key={`l-${a.code}`} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="var(--operational)" strokeWidth={1.2} strokeDasharray="140" strokeDashoffset={on ? 0 : 140} opacity={on ? 0.7 : 0.15} style={{ transition: "stroke-dashoffset 500ms var(--ease-out), opacity 500ms" }} />;
      })}
      <circle cx={cx} cy={cy} r={48} fill="url(#core-glow)" />
      <circle cx={cx} cy={cy} r={14} fill="var(--operational)" style={{ transformOrigin: `${cx}px ${cy}px`, animation: "ig-heartbeat 2s var(--ease-standard) infinite" }} />
      <text x={cx} y={cy + 32} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--muted-foreground)" }}>C-01</text>
      {agents.map((a) => {
        const on = tick >= a.wakeAt;
        return (
          <g key={a.code} style={{ transition: "opacity 400ms", opacity: on ? 1 : 0.3 }}>
            <circle cx={a.x} cy={a.y} r={on ? 8 : 4} fill={on ? "var(--operational)" : "var(--muted-foreground)"} style={{ transition: "r 500ms var(--ease-out), fill 500ms" }} />
            {on ? (<circle cx={a.x} cy={a.y} r={14} fill="none" stroke="var(--operational)" strokeOpacity={0.35} style={{ transformOrigin: `${a.x}px ${a.y}px`, animation: "ig-heartbeat 2.4s var(--ease-standard) infinite" }} />) : null}
            <text x={a.x} y={a.y - 14} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{a.code}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── POPULATED DESK ─────────────────────────────────────────────────── */

type Artifact = {
  id: string; title: string; stage: "signal" | "shape" | "define" | "design" | "build" | "ship";
  agent: string; agentCode: string; updatedMin: number; confidence: number;
  validation: "passing" | "warnings" | "blocked" | "pending"; review: "approved" | "pending" | "changes";
  docType: string; readMin: number; aiContribution: number; excerpt: string; pinned?: boolean;
};

const ARTIFACTS: Artifact[] = [
  { id: "res-041", title: "How distributed product teams actually run standups", stage: "signal", agent: "Researcher", agentCode: "R-01", updatedMin: 3, confidence: 0.88, validation: "passing", review: "approved", docType: "Research", readMin: 12, aiContribution: 0.72, excerpt: "Twelve interviews and seven public postmortems converge on a single insight: standups fail not because of timezone spread, but because they optimise for presence over context. Teams need an artifact, not a meeting.", pinned: true },
  { id: "spec-014", title: "Nimbus Atlas — product specification v0.3", stage: "define", agent: "Strategist", agentCode: "S-01", updatedMin: 8, confidence: 0.81, validation: "warnings", review: "pending", docType: "Spec", readMin: 22, aiContribution: 0.65, excerpt: "A calm, async-first standup surface. Teams write into a shared context timeline; Atlas summarises overnight, surfaces blockers, and produces a morning brief that reads like a newsletter, not a status report.", pinned: true },
  { id: "dec-020", title: "Adopt tokens over hard-coded values for stage color language", stage: "shape", agent: "Architect", agentCode: "A-01", updatedMin: 14, confidence: 0.94, validation: "passing", review: "approved", docType: "Decision", readMin: 5, aiContribution: 0.4, excerpt: "Every lifecycle stage now maps to a semantic token. Emerald remains operational; blue for info; amber for attention; red for failure. No stage color is ever inlined into a component." },
  { id: "ux-009", title: "Design brief — morning brief reading surface", stage: "design", agent: "UX", agentCode: "U-01", updatedMin: 21, confidence: 0.76, validation: "pending", review: "changes", docType: "Design brief", readMin: 8, aiContribution: 0.58, excerpt: "Reads like an editorial. Wide typographic rhythm, a subtle stage rail on the left, and a running context strip at the top. No sidebar. The reader is here to catch up in three minutes, not to navigate." },
  { id: "arch-007", title: "Event stream shape for lifecycle telemetry", stage: "build", agent: "Architect", agentCode: "A-01", updatedMin: 34, confidence: 0.83, validation: "passing", review: "pending", docType: "Architecture", readMin: 14, aiContribution: 0.61, excerpt: "A single append-only stream (journey_events) keyed by journey_id, indexed by (agent, kind, ts). Every downstream surface — Mission Log, Orchestration, Insights — reads from the same source of truth." },
  { id: "qa-003", title: "QA plan — first ship of Nimbus Atlas", stage: "ship", agent: "QA", agentCode: "Q-01", updatedMin: 55, confidence: 0.7, validation: "warnings", review: "pending", docType: "QA plan", readMin: 10, aiContribution: 0.5, excerpt: "Contract tests against the event stream, snapshot tests for the reading surface, and a small set of live-mode acceptance checks that watch the agent orchestration graph for state divergence." },
];

const STAGES = ["signal", "shape", "define", "design", "build", "ship"] as const;
const STAGE_COLOR: Record<(typeof STAGES)[number], string> = {
  signal: "var(--info)", shape: "var(--info)", define: "var(--operational)",
  design: "var(--operational)", build: "var(--warning)", ship: "var(--operational)",
};

type StageFilter = "all" | (typeof STAGES)[number];

function PopulatedDesk() {
  const [stage, setStage] = useState<StageFilter>("all");
  const [agent, setAgent] = useState<string>("all");
  const [needsReview, setNeedsReview] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [sort, setSort] = useState<"recent" | "confidence" | "stage">("recent");
  const [composerOpen, setComposerOpen] = useState(false);

  const filtered = useMemo(() => {
    let out = ARTIFACTS.slice();
    if (stage !== "all") out = out.filter((a) => a.stage === stage);
    if (agent !== "all") out = out.filter((a) => a.agentCode === agent);
    if (needsReview) out = out.filter((a) => a.review !== "approved" || a.validation !== "passing");
    if (sort === "recent") out.sort((a, b) => a.updatedMin - b.updatedMin);
    if (sort === "confidence") out.sort((a, b) => b.confidence - a.confidence);
    if (sort === "stage") out.sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage));
    return out;
  }, [stage, agent, needsReview, sort]);

  return (
    <div className="flex flex-1">
      <WorkspaceSidebar stage={stage} onStageChange={setStage} agent={agent} onAgentChange={setAgent} />
      <main className="min-w-0 flex-1 px-8 pb-24 pt-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex items-end justify-between gap-6 pb-8">
            <div>
              <div className="text-code mb-3 text-muted-foreground" style={{ fontSize: 10 }}>nimbus atlas · j-014 · workspace</div>
              <h1 className="text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>The library</h1>
              <p className="mt-2 max-w-xl text-muted-foreground" style={{ fontSize: 14, lineHeight: 1.55 }}>
                Every artifact your agents have produced, grouped by lifecycle. Open any one to read it. Editing lives in Studio.
              </p>
            </div>
            <button onClick={() => setComposerOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all" style={{ background: "var(--operational)", color: "#0a1a12", boxShadow: "0 10px 26px -10px color-mix(in oklab, var(--operational) 60%, transparent)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
              New idea
            </button>
          </div>
          <div className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: composerOpen ? "1fr" : "0fr" }}>
            <div className="min-h-0 pb-8"><IdeaComposer onRun={() => setComposerOpen(false)} compact /></div>
          </div>
          <FilterBar stage={stage} onStageChange={setStage} agent={agent} onAgentChange={setAgent} needsReview={needsReview} onNeedsReviewChange={setNeedsReview} sort={sort} onSortChange={setSort} density={density} onDensityChange={setDensity} count={filtered.length} />
          <div className={`mt-8 grid gap-6 ${density === "comfortable" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}>
            {filtered.map((a, i) => (<ArtifactCard key={a.id} artifact={a} index={i} density={density} />))}
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl border py-16 text-center" style={{ borderColor: "var(--border-op)", borderStyle: "dashed", background: "color-mix(in oklab, var(--surface-op) 40%, transparent)" }}>
                <div className="text-code text-muted-foreground" style={{ fontSize: 11 }}>no artifacts match this filter</div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function WorkspaceSidebar({ stage, onStageChange, agent, onAgentChange }: { stage: StageFilter; onStageChange: (s: StageFilter) => void; agent: string; onAgentChange: (a: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const grouped = useMemo(() => {
    const g: Record<string, Artifact[]> = {};
    STAGES.forEach((s) => (g[s] = []));
    ARTIFACTS.forEach((a) => g[a.stage].push(a));
    return g;
  }, []);
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => Object.fromEntries(STAGES.map((s) => [s, true])));
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
          <div className="text-ui text-foreground" style={{ fontSize: 13 }}>Nimbus Atlas</div>
        </div>
        <button onClick={() => setCollapsed(true)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground" title="Collapse">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <button onClick={() => onStageChange("all")} className={`mb-2 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${stage === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`} style={{ background: stage === "all" ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent" }}>
          <span className="text-ui" style={{ fontSize: 12 }}>All artifacts</span>
          <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{ARTIFACTS.length}</span>
        </button>
        <div className="mt-3">
          {STAGES.map((s) => {
            const items = grouped[s];
            const open = openStages[s];
            const isActive = stage === s;
            return (
              <div key={s} className="mb-1">
                <button onClick={() => { onStageChange(s); setOpenStages((p) => ({ ...p, [s]: !p[s] })); }} className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:text-foreground" style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)", background: isActive ? "color-mix(in oklab, var(--operational) 8%, transparent)" : "transparent" }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 160ms" }}><path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: STAGE_COLOR[s] }} />
                  <span className="text-ui capitalize" style={{ fontSize: 12 }}>{s}</span>
                  <span className="text-code ml-auto text-muted-foreground" style={{ fontSize: 10 }}>{items.length}</span>
                </button>
                <div className="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                  <div className="min-h-0">
                    <ul className="pl-6 pt-0.5">
                      {items.map((a) => (<li key={a.id}><WorkspaceRow artifact={a} /></li>))}
                      {items.length === 0 ? (<li className="text-code px-2 py-1 text-muted-foreground" style={{ fontSize: 10 }}>empty</li>) : null}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 border-t pt-3" style={{ borderColor: "var(--border-op)" }}>
          <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>filter by agent</div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {["all", "R-01", "S-01", "U-01", "A-01", "Q-01"].map((code) => {
              const on = agent === code;
              return (
                <button key={code} onClick={() => onAgentChange(code)} className="text-code rounded-md border px-2 py-1 transition-colors" style={{ fontSize: 10, borderColor: on ? "color-mix(in oklab, var(--operational) 40%, transparent)" : "var(--border-op)", background: on ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{code}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t px-3 py-2 text-muted-foreground" style={{ borderColor: "var(--border-op)" }}>
        <div className="text-code flex items-center justify-between" style={{ fontSize: 10 }}>
          <span>workspace/nimbus-atlas/</span>
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
        </div>
      </div>
    </aside>
  );
}

function WorkspaceRow({ artifact }: { artifact: Artifact }) {
  const reader = useReader();
  const [pinned, setPinned] = useState(!!artifact.pinned);
  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.03]">
      <button onClick={() => reader.open(artifact.id)} className="min-w-0 flex-1 truncate text-left text-ui text-muted-foreground transition-colors hover:text-foreground" style={{ fontSize: 11.5 }}>
        <span className="text-code mr-2 tabular-nums" style={{ fontSize: 9 }}>{artifact.id}</span>
        {artifact.title}
      </button>
      <button onClick={(e) => { e.stopPropagation(); setPinned((p) => !p); }} className={pinned ? "" : "opacity-0 transition-opacity group-hover:opacity-100"} title={pinned ? "Unpin" : "Pin"} style={{ color: pinned ? "var(--operational)" : "var(--muted-foreground)" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.8 7.1 18.2 8 12.7 4 8.8l5.5-.8L12 3z" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

function FilterBar({ stage, onStageChange, agent, onAgentChange, needsReview, onNeedsReviewChange, sort, onSortChange, density, onDensityChange, count }: { stage: StageFilter; onStageChange: (s: StageFilter) => void; agent: string; onAgentChange: (a: string) => void; needsReview: boolean; onNeedsReviewChange: (b: boolean) => void; sort: "recent" | "confidence" | "stage"; onSortChange: (s: "recent" | "confidence" | "stage") => void; density: "comfortable" | "compact"; onDensityChange: (d: "comfortable" | "compact") => void; count: number }) {
  const stagesUi: StageFilter[] = ["all", ...STAGES];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op) 65%, transparent)", backdropFilter: "blur(10px)" }}>
      <div className="flex flex-wrap items-center gap-1">
        {stagesUi.map((s) => {
          const on = stage === s;
          return (
            <button key={s} onClick={() => onStageChange(s)} className="text-ui rounded-md px-2.5 py-1 capitalize transition-colors" style={{ fontSize: 12, color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "color-mix(in oklab, var(--operational) 12%, transparent)" : "transparent", boxShadow: on ? "inset 0 0 0 1px color-mix(in oklab, var(--operational) 35%, transparent)" : "none" }}>{s}</button>
          );
        })}
      </div>
      <div className="h-4 w-px" style={{ background: "var(--border-op)" }} />
      <button onClick={() => onNeedsReviewChange(!needsReview)} className="text-ui inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors" style={{ fontSize: 12, borderColor: needsReview ? "color-mix(in oklab, var(--warning) 45%, transparent)" : "var(--border-op)", background: needsReview ? "color-mix(in oklab, var(--warning) 10%, transparent)" : "transparent", color: needsReview ? "var(--warning)" : "var(--muted-foreground)" }}>
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: needsReview ? "var(--warning)" : "var(--muted-foreground)" }} />
        needs review
      </button>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{count} artifact{count === 1 ? "" : "s"}</div>
        <SmallSelect label="sort" value={sort} options={[{ value: "recent", label: "recently updated" }, { value: "confidence", label: "confidence" }, { value: "stage", label: "stage" }]} onChange={(v) => onSortChange(v as "recent" | "confidence" | "stage")} />
        <div className="flex items-center rounded-md border p-0.5" style={{ borderColor: "var(--border-op)" }}>
          {(["comfortable", "compact"] as const).map((d) => {
            const on = density === d;
            return (
              <button key={d} onClick={() => onDensityChange(d)} className="text-code rounded-sm px-2 py-1 transition-colors" style={{ fontSize: 10, color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "color-mix(in oklab, var(--foreground) 6%, transparent)" : "transparent" }}>{d === "comfortable" ? "cozy" : "dense"}</button>
            );
          })}
        </div>
        {agent !== "all" ? (
          <button onClick={() => onAgentChange("all")} className="text-code inline-flex items-center gap-1 rounded-md border px-2 py-1 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>agent: {agent} ✕</button>
        ) : null}
      </div>
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
        <div className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[180px] overflow-hidden rounded-lg border py-1 shadow-2xl" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-elevated) 96%, transparent)", backdropFilter: "blur(12px)", animation: "ig-fade-up 180ms var(--ease-out) both" }}>
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

function ArtifactCard({ artifact, index, density }: { artifact: Artifact; index: number; density: "comfortable" | "compact" }) {
  const reader = useReader();
  const [hover, setHover] = useState(false);
  const compact = density === "compact";
  const validationTone = { passing: "var(--operational)", warnings: "var(--warning)", blocked: "var(--destructive)", pending: "var(--muted-foreground)" }[artifact.validation];
  const reviewTone = { approved: "var(--operational)", pending: "var(--info)", changes: "var(--warning)" }[artifact.review];
  return (
    <button onClick={() => reader.open(artifact.id)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ease-out" style={{ borderColor: hover ? "color-mix(in oklab, var(--operational) 35%, var(--border-op))" : "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)", boxShadow: hover ? "0 30px 60px -30px rgba(0,0,0,0.55), 0 0 0 1px color-mix(in oklab, var(--operational) 20%, transparent) inset" : "0 12px 32px -20px rgba(0,0,0,0.4)", transform: hover ? "translateY(-2px)" : "translateY(0)", animation: `ig-fade-up 500ms var(--ease-out) ${Math.min(index * 60, 500)}ms both` }}>
      <span aria-hidden className="absolute inset-y-3 left-0 w-[2px] rounded-full transition-opacity" style={{ background: STAGE_COLOR[artifact.stage], opacity: hover ? 1 : 0.55, boxShadow: hover ? `0 0 12px ${STAGE_COLOR[artifact.stage]}` : "none" }} />
      <div className="flex items-center justify-between gap-3 pl-2">
        <div className="flex items-center gap-2">
          <span className="text-code inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 capitalize" style={{ fontSize: 10, borderColor: "var(--border-op)", background: `color-mix(in oklab, ${STAGE_COLOR[artifact.stage]} 10%, transparent)`, color: STAGE_COLOR[artifact.stage] }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: STAGE_COLOR[artifact.stage] }} />
            {artifact.stage}
          </span>
          <span className="text-code rounded-md px-1.5 py-0.5" style={{ fontSize: 10, background: "color-mix(in oklab, var(--foreground) 5%, transparent)", color: "var(--muted-foreground)" }}>{artifact.docType}</span>
        </div>
        <span className="text-code text-muted-foreground tabular-nums" style={{ fontSize: 10 }}>{artifact.id}</span>
      </div>
      <h3 className="mt-3 pl-2 text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: compact ? 18 : 22, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{artifact.title}</h3>
      {!compact ? (<p className="mt-3 pl-2 text-muted-foreground" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{artifact.excerpt}</p>) : null}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pl-2 text-muted-foreground">
        <span className="text-code inline-flex items-center gap-1.5" style={{ fontSize: 10 }}>
          <span className="text-code inline-block rounded px-1 py-px" style={{ fontSize: 9, background: "color-mix(in oklab, var(--operational) 14%, transparent)", color: "var(--operational)" }}>{artifact.agentCode}</span>
          {artifact.agent}
        </span>
        <span className="text-code" style={{ fontSize: 10 }}>{artifact.updatedMin < 60 ? `${artifact.updatedMin}m ago` : `${Math.floor(artifact.updatedMin / 60)}h ago`}</span>
        <span className="text-code" style={{ fontSize: 10 }}>{artifact.readMin} min read</span>
        <span className="text-code inline-flex items-center gap-1" style={{ fontSize: 10, color: validationTone }}><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: validationTone }} />{artifact.validation}</span>
        <span className="text-code inline-flex items-center gap-1" style={{ fontSize: 10, color: reviewTone }}><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: reviewTone }} />{artifact.review}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t pt-3 pl-2" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex flex-1 items-center gap-4">
          <MiniMeter label="confidence" value={artifact.confidence} tone="op" />
          <MiniMeter label="ai" value={artifact.aiContribution} tone="info" />
        </div>
        <span className="text-ui inline-flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground" style={{ fontSize: 12 }}>
          Open
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: hover ? "translateX(2px)" : "translateX(0)", transition: "transform 200ms var(--ease-out)" }}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </button>
  );
}

function MiniMeter({ label, value, tone }: { label: string; value: number; tone: "op" | "info" }) {
  const color = tone === "op" ? "var(--operational)" : "var(--info)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-code text-muted-foreground" style={{ fontSize: 9 }}>{label}</span>
      <div className="relative h-1 w-16 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}>
        <div className="absolute inset-y-0 left-0" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className="text-code tabular-nums" style={{ fontSize: 9, color }}>{Math.round(value * 100)}</span>
    </div>
  );
}

/* ─── READING VIEW ───────────────────────────────────────────────────── */

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
      <div onClick={onClose} aria-hidden className="fixed inset-0 z-50 transition-opacity duration-300" style={{ background: "color-mix(in oklab, #000 55%, transparent)", backdropFilter: "blur(6px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} />
      <aside role="dialog" aria-hidden={!open} className="fixed inset-y-0 right-0 z-[60] flex w-full flex-col border-l md:w-[820px]" style={{ background: "color-mix(in oklab, var(--surface-op) 98%, transparent)", borderColor: "var(--border-op)", transform: open ? "translateX(0)" : "translateX(24px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "transform 320ms var(--ease-out), opacity 320ms", boxShadow: "-40px 0 80px -30px rgba(0,0,0,0.6)" }}>
        {artifact ? (
          <>
            <div className="flex items-center justify-between border-b px-8 py-4" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op) 92%, transparent)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-3 text-muted-foreground">
                <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground" title="Close (Esc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
                </button>
                <span className="text-code" style={{ fontSize: 10 }}>reading · {artifact.id}</span>
                <span className="text-code inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 capitalize" style={{ fontSize: 10, borderColor: "var(--border-op)", background: `color-mix(in oklab, ${STAGE_COLOR[artifact.stage]} 10%, transparent)`, color: STAGE_COLOR[artifact.stage] }}>{artifact.stage}</span>
              </div>
              <button className="text-code rounded-md border px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }} title="Studio owns editing">open in studio →</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-12 md:px-14">
              <article className="mx-auto max-w-[640px]">
                <div className="text-code mb-6 text-muted-foreground" style={{ fontSize: 10 }}>{artifact.docType} · {artifact.agent} ({artifact.agentCode}) · updated {artifact.updatedMin}m ago · {artifact.readMin} min read</div>
                <h1 className="mb-6 text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.25rem, 3.5vw, 3rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>{artifact.title}</h1>
                <p className="mb-8 text-muted-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 20, lineHeight: 1.5, fontStyle: "italic" }}>{artifact.excerpt}</p>
                <div className="mb-10 grid grid-cols-3 gap-3 rounded-xl border p-4" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-sunken) 55%, transparent)" }}>
                  <ReadingStat label="confidence" value={`${Math.round(artifact.confidence * 100)}%`} tone="op" />
                  <ReadingStat label="ai contribution" value={`${Math.round(artifact.aiContribution * 100)}%`} tone="info" />
                  <ReadingStat label="validation" value={artifact.validation} tone={artifact.validation === "passing" ? "op" : "warn"} />
                </div>
                <div className="text-foreground/90" style={{ fontSize: 16.5, lineHeight: 1.75 }}>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, letterSpacing: "-0.01em", marginTop: 8, marginBottom: 12 }}>The core observation</h2>
                  <p style={{ marginBottom: 18 }}>Distributed teams treat standups as a scheduling problem. Every discussion of asynchronous work returns to the same complaint — the timezones. But the interviews reveal a different failure mode: teams have plenty of <em>presence</em>, and almost no <em>context</em>.</p>
                  <p style={{ marginBottom: 18 }}>People show up to standups; they simply arrive without the shape of the day already assembled. The meeting becomes the assembler, which is why it drags. If the assembly happens overnight — as an artifact, not a meeting — the entire ritual collapses down to a two-minute read.</p>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, letterSpacing: "-0.01em", marginTop: 28, marginBottom: 12 }}>What the product should feel like</h2>
                  <ul style={{ marginBottom: 18, paddingLeft: 20, listStyle: "disc" }}>
                    <li style={{ marginBottom: 6 }}>A morning brief that reads like an editorial, not a status report.</li>
                    <li style={{ marginBottom: 6 }}>Blockers surfaced by name, with the decision required and the owner.</li>
                    <li style={{ marginBottom: 6 }}>A running context strip that shows what shifted while you were asleep.</li>
                  </ul>
                  <blockquote style={{ margin: "24px 0", padding: "14px 20px", borderLeft: "2px solid var(--operational)", background: "color-mix(in oklab, var(--operational) 6%, transparent)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "var(--foreground)" }}>
                    "The best async standup is one you don't have to attend and don't have to write."
                    <div className="text-code mt-2" style={{ fontSize: 10, color: "var(--muted-foreground)", fontStyle: "normal" }}>— interview 07, staff engineer, 4-timezone team</div>
                  </blockquote>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, letterSpacing: "-0.01em", marginTop: 28, marginBottom: 12 }}>Next steps</h2>
                  <p style={{ marginBottom: 12 }}>The Strategist will use these observations to draft the product specification. The UX agent will translate the reading-first stance into a design brief. Anything blocking should be raised as a decision.</p>
                </div>
                <div className="mt-16 border-t pt-6 text-muted-foreground" style={{ borderColor: "var(--border-op)" }}>
                  <div className="text-code" style={{ fontSize: 10 }}>end of artifact · workspace/nimbus-atlas/{artifact.docType.toLowerCase().replace(/\s/g, "-")}/{artifact.id}.md</div>
                </div>
              </article>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

function ReadingStat({ label, value, tone }: { label: string; value: string; tone: "op" | "info" | "warn" }) {
  const c = tone === "op" ? "var(--operational)" : tone === "info" ? "var(--info)" : "var(--warning)";
  return (
    <div>
      <div className="text-code text-muted-foreground" style={{ fontSize: 9 }}>{label}</div>
      <div className="mt-1 capitalize" style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: c, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

/* ─── COMMAND PALETTE ────────────────────────────────────────────────── */

type PKind = "artifact" | "journey" | "agent" | "stage" | "action";
type PaletteItem = { kind: PKind; id: string; label: string; hint: string };

function CommandPalette({ open, onClose, onOpenArtifact }: { open: boolean; onClose: () => void; onOpenArtifact: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
    else setQuery("");
  }, [open]);

  const all = useMemo<PaletteItem[]>(() => [
    ...ARTIFACTS.map((a): PaletteItem => ({ kind: "artifact", id: a.id, label: a.title, hint: `${a.docType} · ${a.agentCode} · ${a.stage}` })),
    { kind: "journey", id: "J-014", label: "Nimbus Atlas", hint: "current · define" },
    { kind: "journey", id: "J-013", label: "Onboarding Reforge", hint: "design" },
    { kind: "journey", id: "J-011", label: "Pricing v3", hint: "ship" },
    { kind: "agent", id: "C-01", label: "Coordinator", hint: "running · 12 msg/s" },
    { kind: "agent", id: "R-01", label: "Researcher", hint: "running" },
    { kind: "agent", id: "S-01", label: "Strategist", hint: "reviewing" },
    { kind: "agent", id: "U-01", label: "UX", hint: "running" },
    { kind: "agent", id: "A-01", label: "Architect", hint: "queued" },
    { kind: "agent", id: "Q-01", label: "QA", hint: "idle" },
    ...STAGES.map((s): PaletteItem => ({ kind: "stage", id: s, label: `Filter · ${s}`, hint: "lifecycle stage" })),
    { kind: "action", id: "go-mc", label: "Go to Mission Control", hint: "live orchestration" },
    { kind: "action", id: "new-idea", label: "Compose new idea", hint: "return to empty desk" },
  ], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q));
  }, [all, query]);

  useEffect(() => { setCursor(0); }, [query]);

  const groups = useMemo(() => {
    const order: PKind[] = ["artifact", "journey", "agent", "stage", "action"];
    const labels: Record<PKind, string> = { artifact: "Artifacts", journey: "Journeys", agent: "Agents", stage: "Filters", action: "Quick actions" };
    return order.map((k) => ({ key: k, label: labels[k], items: filtered.filter((i) => i.kind === k) })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const flat = groups.flatMap((g) => g.items);

  function activate(it: PaletteItem) {
    if (it.kind === "artifact") onOpenArtifact(it.id);
    else onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const it = flat[cursor]; if (it) activate(it); }
  }

  return (
    <>
      <div onClick={onClose} aria-hidden className="fixed inset-0 z-[70] transition-opacity duration-200" style={{ background: "color-mix(in oklab, #000 45%, transparent)", backdropFilter: "blur(4px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} />
      <div role="dialog" aria-hidden={!open} className="fixed left-1/2 top-[14vh] z-[80] w-[92%] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl" style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--surface-op-elevated) 96%, transparent)", backdropFilter: "saturate(140%) blur(18px)", transform: open ? "translate(-50%, 0) scale(1)" : "translate(-50%, -12px) scale(0.98)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 200ms var(--ease-out), transform 220ms var(--ease-out)" }}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--muted-foreground)" }}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKey} placeholder="Search artifacts, journeys, agents, actions…" className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70" style={{ fontFamily: "var(--font-sans)", fontSize: 15 }} />
          <span className="kbd-key">esc</span>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-2">
          {flat.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <div className="text-code" style={{ fontSize: 11 }}>nothing matches "{query}"</div>
            </div>
          ) : (
            groups.map((g) => {
              let base = 0;
              for (const gg of groups) { if (gg.key === g.key) break; base += gg.items.length; }
              return (
                <div key={g.key} className="mb-2">
                  <div className="text-label px-4 pb-1 pt-2 text-muted-foreground" style={{ fontSize: 9 }}>{g.label}</div>
                  {g.items.map((it, i) => {
                    const idx = base + i;
                    const active = idx === cursor;
                    return (
                      <button key={`${g.key}-${i}`} onMouseEnter={() => setCursor(idx)} onClick={() => activate(it)} className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors" style={{ background: active ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent" }}>
                        <div className="flex min-w-0 items-center gap-3">
                          <PaletteIcon kind={it.kind} />
                          <div className="min-w-0">
                            <div className="truncate text-foreground" style={{ fontSize: 14 }}>{it.label}</div>
                            <div className="text-code truncate text-muted-foreground" style={{ fontSize: 10 }}>{it.hint}</div>
                          </div>
                        </div>
                        <span className="text-code text-muted-foreground" style={{ fontSize: 10, opacity: active ? 1 : 0 }}>↵</span>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-2 text-muted-foreground" style={{ borderColor: "var(--border-op)" }}>
          <div className="text-code flex items-center gap-3" style={{ fontSize: 10 }}>
            <span className="inline-flex items-center gap-1"><span className="kbd-key">↑</span><span className="kbd-key">↓</span> navigate</span>
            <span className="inline-flex items-center gap-1"><span className="kbd-key">↵</span> open</span>
          </div>
          <div className="text-code" style={{ fontSize: 10 }}>artifact_index · v0.1</div>
        </div>
      </div>
    </>
  );
}

function PaletteIcon({ kind }: { kind: PKind }) {
  const map: Record<PKind, ReactNode> = {
    artifact: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
    journey: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 18l6-12 4 8 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    agent: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></svg>),
    stage: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M8 6h12M8 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
    action: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 3l-8 12h6l-1 6 8-12h-6l1-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>),
  };
  return (<span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: "color-mix(in oklab, var(--foreground) 6%, transparent)", color: "var(--muted-foreground)" }}>{map[kind]}</span>);
}
