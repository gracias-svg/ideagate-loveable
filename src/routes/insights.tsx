import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights & Performance — IdeaGate" },
      {
        name: "description",
        content:
          "Operational analytics for the IdeaGate Product Operating System — lifecycle duration, agent utilization, model economy and cost efficiency.",
      },
      { property: "og:title", content: "Insights & Performance — IdeaGate" },
      {
        property: "og:description",
        content:
          "How efficiently the operating system runs. Journey duration, bottlenecks, model economy, cost and cache.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Insights,
});

/* ────────────────────────────────────────────────────────────────
 *  Insights & Performance — the third flagship of Mission Control
 *  "How efficiently is the operating system performing?"
 * ──────────────────────────────────────────────────────────────── */

function Insights() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");

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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="dark relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--surface-op-sunken)", color: "var(--foreground)" }}
    >
      <AmbientAtmosphere />

      <div className="relative z-10 flex min-h-screen">
        <InsightsSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <InsightsTopbar now={now} range={range} setRange={setRange} onOpenPalette={() => setPaletteOpen(true)} />

          <main className="mx-auto w-full max-w-[1400px] px-8 pb-24 pt-8">
            <HeaderBlock range={range} />

            <div className="mt-10 grid grid-cols-12 gap-6">
              <section className="col-span-12">
                <KpiRibbon />
              </section>

              <section className="col-span-12 xl:col-span-8">
                <LifecycleTrend range={range} />
              </section>
              <section className="col-span-12 xl:col-span-4">
                <StageBottlenecks />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <AgentUtilization />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <CoordinatorEfficiency />
              </section>

              <section className="col-span-12 xl:col-span-6">
                <ModelEconomy />
              </section>
              <section className="col-span-12 xl:col-span-6">
                <ModelComparison />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <HistoricalRuns />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <CostAndCache />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <RetryFailureAnalysis />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <WorkspaceGrowth />
              </section>

              <section className="col-span-12">
                <Recommendations />
              </section>
            </div>
          </main>

          <SystemRail now={now} />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
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
            "radial-gradient(closest-side, color-mix(in oklab, var(--operational) 16%, transparent), transparent 70%)",
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
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 75%)",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
        <filter id="ig-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ig-noise)" />
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
      { id: "control", label: "Mission Control", kbd: "M", href: "/mission-control" },
      { id: "intelligence", label: "Intelligence & Quality", kbd: "I", href: "/intelligence", badge: "7" },
      { id: "insights", label: "Insights & Performance", kbd: "P", href: "/insights", active: true },
      { id: "journey", label: "Journeys", kbd: "J" },
      { id: "artifacts", label: "Artifacts", kbd: "A", badge: "12" },
      { id: "decisions", label: "Decisions", kbd: "D", badge: "3" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { id: "runs", label: "Historical runs" },
      { id: "cost", label: "Cost & tokens" },
      { id: "models", label: "Model economy" },
    ],
  },
  {
    label: "Product",
    items: [
      { id: "atlas", label: "Nimbus Atlas" },
      { id: "sprint", label: "Q3 Reforge" },
    ],
  },
];

function InsightsSidebar() {
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
              {s.items.map((it) => {
                const className = `group relative flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                  it.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`;
                const style = {
                  background: it.active
                    ? "color-mix(in oklab, var(--operational) 10%, transparent)"
                    : "transparent",
                } as const;
                const inner = (
                  <>
                    {it.active ? (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r"
                        style={{ background: "var(--operational)" }}
                      />
                    ) : null}
                    <span className="flex items-center gap-2 text-ui" style={{ fontSize: 13 }}>
                      {it.label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {it.badge ? (
                        <span
                          className="text-code rounded px-1.5 py-0.5"
                          style={{
                            fontSize: 10,
                            background: "color-mix(in oklab, var(--operational) 15%, transparent)",
                            color: "var(--operational)",
                          }}
                        >
                          {it.badge}
                        </span>
                      ) : null}
                      {it.kbd ? (
                        <span
                          className="text-code opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          style={{ fontSize: 10, color: "var(--muted-foreground)" }}
                        >
                          {it.kbd}
                        </span>
                      ) : null}
                    </span>
                  </>
                );
                return (
                  <li key={it.id}>
                    {it.href ? (
                      <Link to={it.href} className={className} style={style}>
                        {inner}
                      </Link>
                    ) : (
                      <button className={className} style={style}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-code"
            style={{
              background: "color-mix(in oklab, var(--operational) 20%, var(--surface-op))",
              color: "var(--operational)",
              fontSize: 11,
            }}
          >
            EM
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full"
              style={{ background: "var(--operational)", boxShadow: "0 0 0 2px var(--surface-op)" }}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-ui" style={{ fontSize: 12 }}>Elena Marek</span>
            <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
              staff pm · online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────── Topbar ─────────────────────────── */

function InsightsTopbar({
  now,
  range,
  setRange,
  onOpenPalette,
}: {
  now: Date;
  range: "24h" | "7d" | "30d";
  setRange: (r: "24h" | "7d" | "30d") => void;
  onOpenPalette: () => void;
}) {
  const time = now.toISOString().slice(11, 19);
  const ranges: ("24h" | "7d" | "30d")[] = ["24h", "7d", "30d"];
  return (
    <div
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur"
      style={{
        background: "color-mix(in oklab, var(--surface-op) 78%, transparent)",
        borderColor: "var(--border-op)",
      }}
    >
      <div className="flex items-center gap-2 text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        <Link to="/" className="hover:text-foreground">workspace</Link>
        <span className="opacity-40">/</span>
        <span>Nimbus Atlas</span>
        <span className="opacity-40">/</span>
        <span className="text-foreground">Insights & Performance</span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border-op)" }}
        >
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="text-code px-2.5 py-1 transition-colors duration-150"
              style={{
                fontSize: 11,
                background:
                  range === r ? "color-mix(in oklab, var(--operational) 14%, transparent)" : "transparent",
                color: range === r ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-1.5 rounded-md border px-2 py-1"
          style={{ borderColor: "var(--border-op)", background: "var(--surface-op)" }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--operational)", animation: "ig-pulse-dot 2.6s ease-in-out infinite" }}
          />
          <span className="text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            nominal
          </span>
        </div>
        <span className="text-code hidden sm:inline" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          UTC {time}
        </span>
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 rounded-md border px-2 py-1 transition-colors duration-150 hover:text-foreground"
          style={{
            borderColor: "var(--border-op)",
            background: "var(--surface-op)",
            color: "var(--muted-foreground)",
          }}
        >
          <span className="text-ui" style={{ fontSize: 12 }}>Search or run</span>
          <span className="text-code rounded px-1" style={{ fontSize: 10, background: "var(--surface-op-elevated)" }}>
            ⌘K
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Header ─────────────────────────── */

function HeaderBlock({ range }: { range: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
        <span
          className="rounded px-1.5 py-0.5"
          style={{
            background: "color-mix(in oklab, var(--operational) 14%, transparent)",
            color: "var(--operational)",
          }}
        >
          03 · insights
        </span>
        <span>window · {range}</span>
        <span>·</span>
        <span>system efficiency report</span>
      </div>
      <h1
        className="text-foreground"
        style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 1.05, letterSpacing: -0.5 }}
      >
        How efficiently the operating system ran.
      </h1>
      <p className="max-w-[720px] text-ui text-muted-foreground" style={{ fontSize: 14 }}>
        Every stage, every agent, every model call — instrumented. Historical runs, coordinator throughput, model
        economy and cost. The layer that answers <span className="text-foreground">how well</span>, not what.
      </p>
    </div>
  );
}

/* ─────────────────────────── KPI Ribbon ─────────────────────────── */

const KPIS: { label: string; value: string; delta: string; deltaTone: "good" | "bad" | "flat"; foot: string }[] = [
  { label: "median journey duration", value: "6h 24m", delta: "−11%", deltaTone: "good", foot: "vs prior 7d" },
  { label: "coordinator throughput", value: "142/h", delta: "+8%", deltaTone: "good", foot: "decisions per hour" },
  { label: "avg latency · agent call", value: "1.42s", delta: "−4%", deltaTone: "good", foot: "p50 across agents" },
  { label: "token spend", value: "3.8M", delta: "+3%", deltaTone: "flat", foot: "input+output · 7d" },
  { label: "cache hit rate", value: "71.4%", delta: "+2.1%", deltaTone: "good", foot: "semantic + kv" },
  { label: "run success rate", value: "94.6%", delta: "−0.8%", deltaTone: "bad", foot: "of 218 runs" },
];

function KpiRibbon() {
  return (
    <div
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border md:grid-cols-3 xl:grid-cols-6"
      style={{ borderColor: "var(--border-op)", background: "var(--border-op)" }}
    >
      {KPIS.map((k) => (
        <div key={k.label} className="p-4" style={{ background: "var(--surface-op)" }}>
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>
            {k.label}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="text-foreground"
              style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: -0.4 }}
            >
              {k.value}
            </span>
            <DeltaBadge tone={k.deltaTone} value={k.delta} />
          </div>
          <div className="text-code mt-1 text-muted-foreground" style={{ fontSize: 10 }}>
            {k.foot}
          </div>
          <Sparkline tone={k.deltaTone} />
        </div>
      ))}
    </div>
  );
}

function DeltaBadge({ tone, value }: { tone: "good" | "bad" | "flat"; value: string }) {
  const color =
    tone === "good" ? "var(--operational)" : tone === "bad" ? "var(--danger, #e5484d)" : "var(--muted-foreground)";
  return (
    <span
      className="text-code rounded px-1 py-0.5"
      style={{
        fontSize: 10,
        color,
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      {value}
    </span>
  );
}

function Sparkline({ tone }: { tone: "good" | "bad" | "flat" }) {
  const pts = useMemo(() => {
    const rand = seeded(tone.length * 7 + 3);
    return Array.from({ length: 24 }, (_, i) => 12 + Math.sin(i / 3) * 4 + rand() * 6);
  }, [tone]);
  const w = 120;
  const h = 24;
  const path = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - v}`)
    .join(" ");
  const stroke =
    tone === "good" ? "var(--operational)" : tone === "bad" ? "#e5484d" : "var(--muted-foreground)";
  return (
    <svg className="mt-2 h-6 w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={stroke} strokeWidth="1" opacity="0.85" />
    </svg>
  );
}

/* ─────────────────────────── Lifecycle trend ─────────────────────────── */

function LifecycleTrend({ range }: { range: string }) {
  const series = useMemo(() => generateSeries(range), [range]);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Panel
      eyebrow="lifecycle · trend"
      title="Journey duration & throughput"
      hint="Median completion time overlaid with journeys/hour. Backend: journey_runs.duration_ms, coordinator.throughput"
    >
      <div className="mt-4">
        <div className="flex items-center gap-4 text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
          <LegendDot color="var(--operational)" label="duration (median)" />
          <LegendDot color="var(--info)" label="journeys · per hour" />
          <span className="ml-auto">window · {range}</span>
        </div>

        <div className="relative mt-3">
          <AreaChart series={series} onHover={setHover} hover={hover} />
        </div>
      </div>
    </Panel>
  );
}

function generateSeries(range: string) {
  const n = range === "24h" ? 24 : range === "7d" ? 28 : 30;
  const rand = seeded(range.length * 11);
  return Array.from({ length: n }, (_, i) => ({
    label: range === "24h" ? `${i.toString().padStart(2, "0")}:00` : `d${i + 1}`,
    a: 18 + Math.sin(i / 3) * 5 + rand() * 6,
    b: 8 + Math.cos(i / 2.4) * 3 + rand() * 4,
  }));
}

function AreaChart({
  series,
  onHover,
  hover,
}: {
  series: { label: string; a: number; b: number }[];
  onHover: (i: number | null) => void;
  hover: number | null;
}) {
  const w = 800;
  const h = 220;
  const pad = 24;
  const maxA = Math.max(...series.map((s) => s.a));
  const maxB = Math.max(...series.map((s) => s.b));
  const x = (i: number) => pad + (i / (series.length - 1)) * (w - pad * 2);
  const yA = (v: number) => h - pad - (v / maxA) * (h - pad * 2);
  const yB = (v: number) => h - pad - (v / maxB) * (h - pad * 2);
  const pathA = series.map((s, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yA(s.a)}`).join(" ");
  const pathB = series.map((s, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yB(s.b)}`).join(" ");
  const areaA = `${pathA} L ${x(series.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-[260px] w-full"
      onMouseLeave={() => onHover(null)}
      onMouseMove={(e) => {
        const rect = (e.target as SVGElement).getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * w;
        const idx = Math.round(((px - pad) / (w - pad * 2)) * (series.length - 1));
        if (idx >= 0 && idx < series.length) onHover(idx);
      }}
    >
      <defs>
        <linearGradient id="ig-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--operational)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--operational)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={pad + ((h - pad * 2) / 3) * g}
          y2={pad + ((h - pad * 2) / 3) * g}
          stroke="var(--border-op)"
          strokeDasharray="2 4"
          opacity="0.6"
        />
      ))}
      <path d={areaA} fill="url(#ig-area)" />
      <path d={pathA} stroke="var(--operational)" strokeWidth="1.5" fill="none" />
      <path d={pathB} stroke="var(--info)" strokeWidth="1.25" fill="none" opacity="0.85" strokeDasharray="4 3" />
      {hover !== null ? (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={pad} y2={h - pad} stroke="var(--foreground)" opacity="0.2" />
          <circle cx={x(hover)} cy={yA(series[hover].a)} r="3" fill="var(--operational)" />
          <circle cx={x(hover)} cy={yB(series[hover].b)} r="2.5" fill="var(--info)" />
        </g>
      ) : null}
    </svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ─────────────────────────── Stage bottlenecks ─────────────────────────── */

const STAGES = [
  { id: "signal", label: "Signal", avg: 12, delta: "−4%", tone: "good" as const },
  { id: "research", label: "Research", avg: 84, delta: "+18%", tone: "bad" as const },
  { id: "spec", label: "Spec", avg: 46, delta: "−7%", tone: "good" as const },
  { id: "ux", label: "UX", avg: 62, delta: "+3%", tone: "flat" as const },
  { id: "arch", label: "Architect", avg: 38, delta: "−9%", tone: "good" as const },
  { id: "qa", label: "QA", avg: 22, delta: "+1%", tone: "flat" as const },
  { id: "ship", label: "Ship", avg: 14, delta: "0%", tone: "flat" as const },
];

function StageBottlenecks() {
  const max = Math.max(...STAGES.map((s) => s.avg));
  return (
    <Panel eyebrow="stage · bottlenecks" title="Where journeys wait" hint="Median minutes per stage. Backend: stage_runs.p50">
      <ul className="mt-4 space-y-3">
        {STAGES.map((s) => (
          <li key={s.id} className="flex items-center gap-3">
            <div className="w-16 shrink-0 text-ui text-muted-foreground" style={{ fontSize: 12 }}>
              {s.label}
            </div>
            <div
              className="relative h-2 flex-1 overflow-hidden rounded-full"
              style={{ background: "var(--surface-op-elevated)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${(s.avg / max) * 100}%`,
                  background:
                    s.tone === "bad"
                      ? "linear-gradient(90deg, color-mix(in oklab, #e5484d 60%, transparent), #e5484d)"
                      : "linear-gradient(90deg, color-mix(in oklab, var(--operational) 50%, transparent), var(--operational))",
                }}
              />
            </div>
            <div
              className="w-14 shrink-0 text-right text-code"
              style={{ fontSize: 11, color: "var(--muted-foreground)" }}
            >
              {s.avg}m
            </div>
            <DeltaBadge tone={s.tone} value={s.delta} />
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-md border p-3 text-code" style={{ borderColor: "var(--border-op)", fontSize: 11, color: "var(--muted-foreground)" }}>
        <span style={{ color: "#e5484d" }}>bottleneck</span> · Research stage p50 rose <span className="text-foreground">+18%</span> — driven by external source rate limits (R-01).
      </div>
    </Panel>
  );
}

/* ─────────────────────────── Agent utilization ─────────────────────────── */

const AGENTS = [
  { id: "coord", label: "Coordinator", util: 78, calls: 4820, latency: 0.34 },
  { id: "res", label: "Researcher · R-01", util: 91, calls: 3120, latency: 2.12 },
  { id: "strat", label: "Strategist · S-01", util: 62, calls: 1840, latency: 1.24 },
  { id: "ux", label: "UX · U-01", util: 71, calls: 2560, latency: 1.61 },
  { id: "arch", label: "Architect · A-01", util: 58, calls: 1420, latency: 1.98 },
  { id: "qa", label: "QA · Q-01", util: 44, calls: 980, latency: 0.82 },
];

function AgentUtilization() {
  return (
    <Panel eyebrow="agents · utilization" title="Agent workload & response" hint="Backend: agent_runs.count, agent_runs.p50_latency">
      <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-op)" }}>
        <table className="w-full text-ui" style={{ fontSize: 12 }}>
          <thead>
            <tr className="text-left text-label text-muted-foreground" style={{ fontSize: 10 }}>
              <th className="px-3 py-2 font-normal">agent</th>
              <th className="px-3 py-2 font-normal">utilization</th>
              <th className="px-3 py-2 text-right font-normal">calls · 7d</th>
              <th className="px-3 py-2 text-right font-normal">p50 latency</th>
            </tr>
          </thead>
          <tbody>
            {AGENTS.map((a) => (
              <tr
                key={a.id}
                className="border-t transition-colors hover:bg-[color:color-mix(in_oklab,var(--operational)_5%,transparent)]"
                style={{ borderColor: "var(--border-op)" }}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          a.util > 85 ? "#e5484d" : a.util > 60 ? "var(--operational)" : "var(--muted-foreground)",
                      }}
                    />
                    <span>{a.label}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative h-1.5 w-32 overflow-hidden rounded-full" style={{ background: "var(--surface-op-elevated)" }}>
                      <div
                        className="absolute inset-y-0 left-0"
                        style={{
                          width: `${a.util}%`,
                          background: a.util > 85 ? "#e5484d" : "var(--operational)",
                        }}
                      />
                    </div>
                    <span className="text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {a.util}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                  {a.calls.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-code" style={{ fontSize: 11 }}>
                  {a.latency.toFixed(2)}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ─────────────────────────── Coordinator efficiency ─────────────────────────── */

function CoordinatorEfficiency() {
  const bars = useMemo(() => {
    const rand = seeded(3);
    return Array.from({ length: 24 }, () => Math.max(6, Math.round(20 + rand() * 60)));
  }, []);
  const max = Math.max(...bars);
  return (
    <Panel
      eyebrow="coordinator · efficiency"
      title="Decisions per hour"
      hint="Coordinator dispatches over 24h. Backend: coordinator_events"
    >
      <div className="mt-4 flex items-end gap-1.5" style={{ height: 128 }}>
        {bars.map((v, i) => (
          <div
            key={i}
            className="group relative flex-1 rounded-t-sm"
            style={{
              height: `${(v / max) * 100}%`,
              background:
                "linear-gradient(180deg, var(--operational), color-mix(in oklab, var(--operational) 20%, transparent))",
            }}
          >
            <span
              className="text-code pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded px-1 opacity-0 group-hover:opacity-100"
              style={{ fontSize: 9, background: "var(--surface-op-elevated)" }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
        <span>00:00</span>
        <span>12:00</span>
        <span>now</span>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border" style={{ borderColor: "var(--border-op)", background: "var(--border-op)" }}>
        {[
          { l: "peak / hr", v: "182" },
          { l: "queue depth", v: "3" },
          { l: "avg dispatch", v: "142ms" },
        ].map((c) => (
          <div key={c.l} className="p-2.5" style={{ background: "var(--surface-op)" }}>
            <div className="text-label text-muted-foreground" style={{ fontSize: 9 }}>
              {c.l}
            </div>
            <div className="mt-0.5 text-ui" style={{ fontSize: 14 }}>
              {c.v}
            </div>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/* ─────────────────────────── Model economy ─────────────────────────── */

const MODELS = [
  { id: "sonnet", label: "claude-sonnet-4.5", tokens: 1_820_000, cost: 42.16, share: 48 },
  { id: "gpt5", label: "gpt-5-mini", tokens: 940_000, cost: 12.44, share: 25 },
  { id: "gemini", label: "gemini-2.5-pro", tokens: 620_000, cost: 18.02, share: 16 },
  { id: "haiku", label: "claude-haiku-4", tokens: 420_000, cost: 3.18, share: 11 },
];

function ModelEconomy() {
  return (
    <Panel eyebrow="llm · economy" title="Token spend by model" hint="Backend: llm_calls.tokens, llm_calls.cost_usd">
      <div className="mt-4 h-3 overflow-hidden rounded-full border" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex h-full w-full">
          {MODELS.map((m, i) => (
            <div
              key={m.id}
              style={{
                width: `${m.share}%`,
                background: [
                  "var(--operational)",
                  "var(--info)",
                  "color-mix(in oklab, var(--operational) 50%, var(--info))",
                  "color-mix(in oklab, var(--muted-foreground) 60%, transparent)",
                ][i],
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {MODELS.map((m, i) => (
          <li key={m.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-[color:color-mix(in_oklab,var(--operational)_6%,transparent)]">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-sm"
                style={{
                  background: [
                    "var(--operational)",
                    "var(--info)",
                    "color-mix(in oklab, var(--operational) 50%, var(--info))",
                    "var(--muted-foreground)",
                  ][i],
                }}
              />
              <span className="text-ui" style={{ fontSize: 12 }}>{m.label}</span>
            </div>
            <div className="flex items-center gap-4 text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              <span>{(m.tokens / 1000).toFixed(0)}k tok</span>
              <span className="text-foreground">${m.cost.toFixed(2)}</span>
              <span className="w-8 text-right">{m.share}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ─────────────────────────── Model comparison ─────────────────────────── */

function ModelComparison() {
  const rows = [
    { model: "claude-sonnet-4.5", quality: 92, latency: 1.42, cost: 0.023, wins: "reasoning · long context" },
    { model: "gpt-5-mini", quality: 84, latency: 0.62, cost: 0.008, wins: "throughput · structured" },
    { model: "gemini-2.5-pro", quality: 88, latency: 1.98, cost: 0.019, wins: "multimodal · research" },
    { model: "claude-haiku-4", quality: 74, latency: 0.34, cost: 0.003, wins: "fast dispatch · summary" },
  ];
  return (
    <Panel eyebrow="models · comparison" title="Where each model earns its keep" hint="Backend: eval_runs.model_scores">
      <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-op)" }}>
        <table className="w-full text-ui" style={{ fontSize: 12 }}>
          <thead>
            <tr className="text-left text-label text-muted-foreground" style={{ fontSize: 10 }}>
              <th className="px-3 py-2 font-normal">model</th>
              <th className="px-3 py-2 font-normal">quality</th>
              <th className="px-3 py-2 text-right font-normal">latency</th>
              <th className="px-3 py-2 text-right font-normal">$ / 1k tok</th>
              <th className="px-3 py-2 font-normal">strong at</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.model} className="border-t" style={{ borderColor: "var(--border-op)" }}>
                <td className="px-3 py-2.5 text-code" style={{ fontSize: 11 }}>{r.model}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "var(--surface-op-elevated)" }}>
                      <div className="absolute inset-y-0 left-0" style={{ width: `${r.quality}%`, background: "var(--operational)" }} />
                    </div>
                    <span className="text-code" style={{ fontSize: 11 }}>{r.quality}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-code" style={{ fontSize: 11 }}>{r.latency.toFixed(2)}s</td>
                <td className="px-3 py-2.5 text-right text-code" style={{ fontSize: 11 }}>${r.cost.toFixed(3)}</td>
                <td className="px-3 py-2.5 text-ui text-muted-foreground" style={{ fontSize: 12 }}>{r.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ─────────────────────────── Historical runs ─────────────────────────── */

const RUNS = [
  { id: "run_a92f", journey: "Nimbus Atlas · onboarding reforge", started: "2h ago", duration: "6h 04m", stages: "6/7", tokens: "412k", cost: "$8.24", status: "running" as const },
  { id: "run_a91e", journey: "Enterprise SSO scoping", started: "yesterday", duration: "4h 51m", stages: "7/7", tokens: "302k", cost: "$5.98", status: "shipped" as const },
  { id: "run_a908", journey: "Billing tier redesign", started: "2d ago", duration: "9h 12m", stages: "7/7", tokens: "621k", cost: "$14.20", status: "shipped" as const },
  { id: "run_a8f2", journey: "Team invites lifecycle", started: "3d ago", duration: "3h 18m", stages: "4/7", tokens: "184k", cost: "$3.42", status: "blocked" as const },
  { id: "run_a8c1", journey: "Public API v2", started: "5d ago", duration: "12h 44m", stages: "7/7", tokens: "982k", cost: "$22.10", status: "shipped" as const },
  { id: "run_a8a0", journey: "Mobile capture flow", started: "6d ago", duration: "5h 02m", stages: "6/7", tokens: "266k", cost: "$4.88", status: "failed" as const },
];

function HistoricalRuns() {
  return (
    <Panel
      eyebrow="runs · history"
      title="Recent journey runs"
      hint="Backend: journey_runs joined with stage_runs, llm_calls"
      trailing={
        <button
          className="text-code rounded-md border px-2 py-1"
          style={{ borderColor: "var(--border-op)", fontSize: 11, color: "var(--muted-foreground)" }}
        >
          all runs
        </button>
      }
    >
      <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-op)" }}>
        <table className="w-full text-ui" style={{ fontSize: 12 }}>
          <thead>
            <tr className="text-left text-label text-muted-foreground" style={{ fontSize: 10 }}>
              <th className="px-3 py-2 font-normal">run</th>
              <th className="px-3 py-2 font-normal">journey</th>
              <th className="px-3 py-2 font-normal">started</th>
              <th className="px-3 py-2 font-normal">duration</th>
              <th className="px-3 py-2 font-normal">stages</th>
              <th className="px-3 py-2 text-right font-normal">tokens</th>
              <th className="px-3 py-2 text-right font-normal">cost</th>
              <th className="px-3 py-2 font-normal">status</th>
            </tr>
          </thead>
          <tbody>
            {RUNS.map((r) => (
              <tr
                key={r.id}
                className="border-t transition-colors hover:bg-[color:color-mix(in_oklab,var(--operational)_5%,transparent)]"
                style={{ borderColor: "var(--border-op)" }}
              >
                <td className="px-3 py-2.5 text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                  {r.id}
                </td>
                <td className="px-3 py-2.5">{r.journey}</td>
                <td className="px-3 py-2.5 text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{r.started}</td>
                <td className="px-3 py-2.5 text-code" style={{ fontSize: 11 }}>{r.duration}</td>
                <td className="px-3 py-2.5 text-code" style={{ fontSize: 11 }}>{r.stages}</td>
                <td className="px-3 py-2.5 text-right text-code" style={{ fontSize: 11 }}>{r.tokens}</td>
                <td className="px-3 py-2.5 text-right text-code" style={{ fontSize: 11 }}>{r.cost}</td>
                <td className="px-3 py-2.5">
                  <StatusPill status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function StatusPill({ status }: { status: "running" | "shipped" | "blocked" | "failed" }) {
  const map = {
    running: { c: "var(--operational)", l: "running", pulse: true },
    shipped: { c: "var(--operational)", l: "shipped", pulse: false },
    blocked: { c: "#f5a524", l: "blocked", pulse: false },
    failed: { c: "#e5484d", l: "failed", pulse: false },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-code"
      style={{
        fontSize: 10,
        color: map.c,
        background: `color-mix(in oklab, ${map.c} 12%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: map.c, animation: map.pulse ? "ig-pulse-dot 2.6s ease-in-out infinite" : undefined }}
      />
      {map.l}
    </span>
  );
}

/* ─────────────────────────── Cost + Cache ─────────────────────────── */

function CostAndCache() {
  return (
    <Panel eyebrow="cost · cache" title="Execution economy" hint="Backend: cost_ledger, cache_events">
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}>
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>total spend · 7d</div>
          <div className="mt-2 text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: -0.4 }}>
            $184.62
          </div>
          <div className="text-code mt-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            $0.85 · median journey
          </div>
          <StackedBar
            parts={[
              { label: "input tok", v: 62, color: "var(--operational)" },
              { label: "output tok", v: 28, color: "var(--info)" },
              { label: "tools", v: 10, color: "var(--muted-foreground)" },
            ]}
          />
        </div>

        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}>
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>cache · effectiveness</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: -0.4 }}>
              71.4%
            </span>
            <DeltaBadge tone="good" value="+2.1%" />
          </div>
          <div className="text-code mt-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            saved · $61.20 · 7d
          </div>
          <StackedBar
            parts={[
              { label: "semantic", v: 46, color: "var(--operational)" },
              { label: "kv", v: 25, color: "var(--info)" },
              { label: "miss", v: 29, color: "var(--muted-foreground)" },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}

function StackedBar({ parts }: { parts: { label: string; v: number; color: string }[] }) {
  return (
    <div className="mt-4">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-op-sunken)" }}>
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${p.v}%`, background: p.color, opacity: 0.9 }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-sm" style={{ background: p.color }} />
            {p.label} · {p.v}%
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────── Retry / Failure ─────────────────────────── */

const FAILURES = [
  { code: "429", agent: "R-01", reason: "external source rate limit · perplexity", count: 12, tone: "bad" as const },
  { code: "TIMEOUT", agent: "A-01", reason: "diagram generation exceeded 30s", count: 4, tone: "bad" as const },
  { code: "VALIDATION", agent: "coordinator", reason: "spec.acceptance schema mismatch", count: 3, tone: "flat" as const },
  { code: "RETRY", agent: "U-01", reason: "successful on second attempt", count: 9, tone: "good" as const },
];

function RetryFailureAnalysis() {
  return (
    <Panel eyebrow="retries · failures" title="Where the system stumbled" hint="Backend: agent_runs.error_code, retry_events">
      <ul className="mt-4 space-y-2">
        {FAILURES.map((f) => (
          <li
            key={f.code + f.agent}
            className="flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors hover:bg-[color:color-mix(in_oklab,var(--operational)_5%,transparent)]"
            style={{ borderColor: "var(--border-op)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-code rounded px-1.5 py-0.5"
                style={{
                  fontSize: 10,
                  color: f.tone === "bad" ? "#e5484d" : f.tone === "good" ? "var(--operational)" : "var(--muted-foreground)",
                  background: `color-mix(in oklab, ${
                    f.tone === "bad" ? "#e5484d" : f.tone === "good" ? "var(--operational)" : "var(--muted-foreground)"
                  } 12%, transparent)`,
                }}
              >
                {f.code}
              </span>
              <span className="text-code text-muted-foreground" style={{ fontSize: 11 }}>
                {f.agent}
              </span>
              <span className="text-ui" style={{ fontSize: 12 }}>
                {f.reason}
              </span>
            </div>
            <span className="text-code text-muted-foreground" style={{ fontSize: 11 }}>
              ×{f.count}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ─────────────────────────── Workspace growth ─────────────────────────── */

function WorkspaceGrowth() {
  const rows = [
    { l: "artifacts", v: "1,204", d: "+64" },
    { l: "journeys", v: "38", d: "+3" },
    { l: "decisions", v: "182", d: "+11" },
    { l: "sources", v: "612", d: "+42" },
    { l: "reviews", v: "94", d: "+7" },
    { l: "memory · rows", v: "18.2k", d: "+820" },
  ];
  return (
    <Panel eyebrow="workspace · growth" title="What the system produced" hint="Backend: workspace_totals(7d)">
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border" style={{ borderColor: "var(--border-op)", background: "var(--border-op)" }}>
        {rows.map((r) => (
          <div key={r.l} className="p-3" style={{ background: "var(--surface-op)" }}>
            <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>{r.l}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{r.v}</span>
              <span className="text-code" style={{ fontSize: 10, color: "var(--operational)" }}>{r.d}</span>
            </div>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/* ─────────────────────────── Recommendations ─────────────────────────── */

const RECS = [
  {
    tag: "cost",
    title: "Route summary calls to claude-haiku-4",
    body: "68% of coordinator dispatches are short summaries currently served by sonnet-4.5. Estimated saving: $32/wk.",
    impact: "high",
  },
  {
    tag: "latency",
    title: "Warm cache for research sources on Nimbus Atlas",
    body: "R-01 sees a 71% semantic cache hit but a 22% cold-start rate on first source fetches. Pre-warming reduces p50 by ~18%.",
    impact: "medium",
  },
  {
    tag: "quality",
    title: "Enable second reviewer on Architect artifacts",
    body: "A-01 contradictions rose above threshold last week. A second-pass critic reduces disagreement by 34% historically.",
    impact: "medium",
  },
];

function Recommendations() {
  return (
    <Panel eyebrow="optimizer · recommendations" title="What to change next" hint="Backend: optimizer.suggestions()">
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {RECS.map((r) => (
          <article
            key={r.title}
            className="group relative overflow-hidden rounded-lg border p-4 transition-colors"
            style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--operational), transparent)" }}
            />
            <div className="flex items-center justify-between">
              <span
                className="text-code rounded px-1.5 py-0.5"
                style={{
                  fontSize: 10,
                  color: "var(--operational)",
                  background: "color-mix(in oklab, var(--operational) 14%, transparent)",
                }}
              >
                {r.tag}
              </span>
              <span className="text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                impact · {r.impact}
              </span>
            </div>
            <h3 className="mt-3 text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.2, letterSpacing: -0.2 }}>
              {r.title}
            </h3>
            <p className="mt-2 text-ui text-muted-foreground" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              {r.body}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                className="rounded-md px-2.5 py-1 text-code transition-colors"
                style={{
                  fontSize: 11,
                  color: "var(--surface-op-sunken)",
                  background: "var(--operational)",
                }}
              >
                apply
              </button>
              <button
                className="rounded-md border px-2.5 py-1 text-code"
                style={{ fontSize: 11, borderColor: "var(--border-op)", color: "var(--muted-foreground)" }}
              >
                inspect
              </button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

/* ─────────────────────────── Panel + primitives ─────────────────────────── */

function Panel({
  eyebrow,
  title,
  hint,
  trailing,
  children,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border p-5"
      style={{
        background: "color-mix(in oklab, var(--surface-op) 96%, transparent)",
        borderColor: "var(--border-op)",
        boxShadow:
          "0 1px 0 0 color-mix(in oklab, var(--foreground) 6%, transparent) inset, 0 20px 40px -30px color-mix(in oklab, #000 60%, transparent)",
      }}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>
            {eyebrow}
          </div>
          <h2
            className="mt-1 text-foreground"
            style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: -0.2, lineHeight: 1.15 }}
          >
            {title}
          </h2>
          {hint ? (
            <p className="mt-1 text-code text-muted-foreground" style={{ fontSize: 10.5 }}>
              {hint}
            </p>
          ) : null}
        </div>
        {trailing}
      </header>
      {children}
    </section>
  );
}

/* ─────────────────────────── System rail ─────────────────────────── */

function SystemRail({ now }: { now: Date }) {
  const cells = [
    { l: "coordinator", v: "nominal", tone: "good" as const },
    { l: "queue", v: "3 dispatched" },
    { l: "lat · p50", v: "1.42s" },
    { l: "tokens · today", v: "612k" },
    { l: "cache hit", v: "71.4%" },
    { l: "uptime", v: "99.982%" },
  ];
  return (
    <div
      className="sticky bottom-0 z-20 flex items-center gap-6 border-t px-6 py-2 backdrop-blur"
      style={{
        background: "color-mix(in oklab, var(--surface-op) 82%, transparent)",
        borderColor: "var(--border-op)",
      }}
    >
      {cells.map((c) => (
        <div key={c.l} className="flex items-center gap-1.5 text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
          {c.tone === "good" ? (
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)", animation: "ig-pulse-dot 2.6s ease-in-out infinite" }} />
          ) : null}
          <span>{c.l}</span>
          <span className="text-foreground">{c.v}</span>
        </div>
      ))}
      <span className="ml-auto text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
        UTC {now.toISOString().slice(11, 19)}
      </span>
    </div>
  );
}

/* ─────────────────────────── Command palette ─────────────────────────── */

const PALETTE = [
  { group: "navigate", items: [
    { id: "control", label: "Go to Mission Control", href: "/mission-control", kbd: "M" },
    { id: "intel", label: "Go to Intelligence & Quality", href: "/intelligence", kbd: "I" },
    { id: "landing", label: "Return to landing", href: "/", kbd: "H" },
  ]},
  { group: "insights", items: [
    { id: "runs", label: "Open historical runs" },
    { id: "models", label: "Compare model economy" },
    { id: "optimizer", label: "Run optimizer · recommendations" },
  ]},
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 20);
  }, [open]);
  const flat = useMemo(
    () =>
      PALETTE.flatMap((g) =>
        g.items
          .map((it) => ({ ...it, group: g.group }))
          .filter((it) => it.label.toLowerCase().includes(q.toLowerCase())),
      ),
    [q],
  );
  useEffect(() => setI(0), [q]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => Math.min(v + 1, flat.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => Math.max(v - 1, 0)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat.length]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] backdrop-blur" style={{ background: "color-mix(in oklab, #000 55%, transparent)" }} onClick={onClose}>
      <div
        className="w-[640px] max-w-[92vw] overflow-hidden rounded-xl border shadow-2xl"
        style={{ borderColor: "var(--border-op)", background: "var(--surface-op)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--border-op)" }}>
          <span className="text-code" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>⌘</span>
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or run an action…"
            className="w-full bg-transparent text-ui outline-none"
            style={{ fontSize: 14 }}
          />
          <span className="text-code rounded px-1.5 py-0.5" style={{ fontSize: 10, color: "var(--muted-foreground)", background: "var(--surface-op-elevated)" }}>esc</span>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto py-2">
          {flat.map((it, idx) => {
            const active = idx === i;
            const inner = (
              <>
                <span className="text-code w-16 shrink-0 uppercase" style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: 1 }}>
                  {it.group}
                </span>
                <span className="flex-1 text-ui" style={{ fontSize: 13 }}>{it.label}</span>
                {"kbd" in it && (it as any).kbd ? (
                  <span className="text-code rounded px-1.5 py-0.5" style={{ fontSize: 10, background: "var(--surface-op-elevated)" }}>
                    {(it as any).kbd}
                  </span>
                ) : null}
              </>
            );
            const cls = `flex w-full items-center gap-3 px-3 py-2`;
            const style = { background: active ? "color-mix(in oklab, var(--operational) 12%, transparent)" : "transparent" } as const;
            return (
              <li key={it.id} onMouseEnter={() => setI(idx)}>
                {(it as any).href ? (
                  <Link to={(it as any).href} className={cls} style={style} onClick={onClose}>{inner}</Link>
                ) : (
                  <button className={cls} style={style}>{inner}</button>
                )}
              </li>
            );
          })}
          {flat.length === 0 ? (
            <li className="px-3 py-6 text-center text-code text-muted-foreground" style={{ fontSize: 11 }}>
              nothing matches — try a different query
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────── Logo ─────────────────────────── */

function LogoGlyph() {
  return (
    <span
      aria-hidden
      className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border"
      style={{
        borderColor: "var(--border-op)",
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--operational) 22%, var(--surface-op)), var(--surface-op))",
      }}
    >
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: "var(--operational)", boxShadow: "0 0 12px color-mix(in oklab, var(--operational) 60%, transparent)" }}
      />
    </span>
  );
}

/* ─────────────────────────── Utils ─────────────────────────── */

function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
