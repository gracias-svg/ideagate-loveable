import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "Intelligence & Quality — IdeaGate" },
      {
        name: "description",
        content:
          "The trust center of your Product Operating System. Confidence, evidence, contradictions and reasoning traces for every decision.",
      },
      { property: "og:title", content: "Intelligence & Quality — IdeaGate" },
      {
        property: "og:description",
        content:
          "Journey trust, agent agreement, evidence coverage and AI reasoning traces — the reasoning layer of IdeaGate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Intelligence,
});

/* ────────────────────────────────────────────────────────────────
 *  Intelligence & Quality — the reasoning layer of IdeaGate
 *  Editorial · Reasoned · Calm · Auditable
 *  Extends the Mission Control visual language exactly.
 * ──────────────────────────────────────────────────────────────── */

function Intelligence() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [inspector, setInspector] = useState<InspectorSubject | null>(null);

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
        setInspector(null);
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
        <MissionSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar now={now} onOpenPalette={() => setPaletteOpen(true)} />

          <main className="mx-auto w-full max-w-[1400px] px-8 pb-24 pt-8">
            <TrustHero />

            <div className="mt-10 grid grid-cols-12 gap-6">
              <section className="col-span-12 xl:col-span-8">
                <ConfidenceEvolution />
              </section>
              <section className="col-span-12 xl:col-span-4">
                <AgreementMatrix />
              </section>

              <section className="col-span-12">
                <LifecycleValidation />
              </section>

              <section className="col-span-12">
                <ArtifactQuality onInspect={(t) => setInspector({ kind: "artifact", title: t })} />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <EvidenceCoverage />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <MissingEvidence />
              </section>

              <section className="col-span-12">
                <Contradictions onInspect={(t) => setInspector({ kind: "contradiction", title: t })} />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <ReasoningTrace />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <RiskAnalysis />
              </section>

              <section className="col-span-12 xl:col-span-7">
                <ReviewQueue onInspect={(t) => setInspector({ kind: "review", title: t })} />
              </section>
              <section className="col-span-12 xl:col-span-5">
                <ReviewerTimeline />
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
      <Inspector subject={inspector} onClose={() => setInspector(null)} />
    </div>
  );
}

/* ─────────────────────────── Shared shell (mirrors Mission Control) ─────────────────────────── */

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
            "radial-gradient(closest-side, color-mix(in oklab, var(--info) 12%, transparent), transparent 70%)",
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
        <filter id="iq-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#iq-noise)" />
      </svg>
    </div>
  );
}

const SIDEBAR_SECTIONS: {
  label: string;
  items: { id: string; label: string; kbd?: string; href?: string; active?: boolean; badge?: string }[];
}[] = [
  {
    label: "Workspace",
    items: [
      { id: "control", label: "Mission Control", kbd: "M", href: "/mission-control" },
      { id: "intelligence", label: "Intelligence & Quality", kbd: "I", href: "/intelligence", active: true, badge: "7" },
      { id: "insights", label: "Insights & Performance", kbd: "P", href: "/insights" },
      { id: "journey", label: "Journeys", kbd: "J" },
      { id: "artifacts", label: "Artifacts", kbd: "A", badge: "12" },
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
      { id: "atlas", label: "Nimbus Atlas" },
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
              {s.items.map((it) => {
                const inner = (
                  <>
                    {it.active ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-1 left-0 w-[2px] rounded-full"
                        style={{ background: "var(--operational)", boxShadow: "0 0 8px var(--operational)" }}
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
                  </>
                );
                const className = `group relative flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                  it.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`;
                const style = {
                  background: it.active
                    ? "color-mix(in oklab, var(--operational) 10%, transparent)"
                    : "transparent",
                } as const;
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

      <div className="border-t px-3 py-3" style={{ borderColor: "var(--border-op)" }}>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-full text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, var(--operational), color-mix(in oklab, var(--info) 60%, var(--operational)))",
            }}
          >
            <span className="text-ui" style={{ fontSize: 11 }}>EA</span>
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-ui truncate text-foreground" style={{ fontSize: 12 }}>Elena Aoki</div>
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

function Topbar({ now, onOpenPalette }: { now: Date; onOpenPalette: () => void }) {
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
        <span className="text-code" style={{ fontSize: 11 }}>workspace</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui text-foreground" style={{ fontSize: 13 }}>Nimbus Atlas</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui" style={{ fontSize: 13 }}>Intelligence & Quality</span>
        <span
          className="ml-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5"
          style={{ borderColor: "var(--border-op)", background: "color-mix(in oklab, var(--info) 8%, transparent)" }}
        >
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--info)" }} />
          <span className="text-code" style={{ fontSize: 10, color: "var(--info)" }}>REASONING</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          className="group inline-flex items-center gap-3 rounded-md border px-3 py-1.5 transition-colors hover:text-foreground"
          style={{ borderColor: "var(--border-op)", color: "var(--muted-foreground)" }}
        >
          <span className="text-ui" style={{ fontSize: 12 }}>Inspect anything</span>
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
          to="/mission-control"
          className="text-ui rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Mission Control
        </Link>
      </div>
    </header>
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
          <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>{eyebrow}</div>
          <h2
            className="mt-1 text-foreground"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", lineHeight: 1.15, letterSpacing: "-0.015em" }}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {meta ? (
            <span className="text-code hidden text-muted-foreground sm:inline" style={{ fontSize: 11 }}>{meta}</span>
          ) : null}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}

function Panel({ children, className = "", elevated = true }: { children: React.ReactNode; className?: string; elevated?: boolean }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{
        borderColor: "var(--border-op)",
        background: elevated
          ? "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)"
          : "color-mix(in oklab, var(--surface-op-sunken) 70%, transparent)",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────── Trust Hero ─────────────────────────── */

function TrustHero() {
  const target = 87;
  const [score, setScore] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1200);
      const eased = 1 - Math.pow(1 - k, 3);
      setScore(Math.round(eased * target));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const breakdown = [
    { label: "Evidence coverage", value: 91, tone: "op" as const },
    { label: "Agent agreement", value: 84, tone: "op" as const },
    { label: "Assumption clarity", value: 78, tone: "warn" as const },
    { label: "Reasoning traceability", value: 96, tone: "op" as const },
    { label: "Human validation", value: 63, tone: "warn" as const },
  ];

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
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--operational) 26%, transparent), transparent 70%)",
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
            <span className="text-label" style={{ fontSize: 10 }}>journey trust score</span>
            <span className="text-code" style={{ fontSize: 10 }}>·</span>
            <span className="text-code" style={{ fontSize: 10 }}>JRN-014 · Enterprise onboarding</span>
          </div>

          <h1
            className="mt-3 text-foreground"
            style={{ fontFamily: "var(--font-serif)", fontSize: "2.75rem", lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            You can trust this journey,
            <br />
            with two open questions.
          </h1>

          <p className="text-body mt-4 max-w-[56ch] text-muted-foreground">
            The reasoning layer has verified <span className="text-foreground">42 artifacts</span>,
            attributed <span className="text-foreground">318 sources</span>, and resolved
            <span className="text-foreground"> 11 contradictions</span>. Two assumptions still
            wait on evidence, one decision awaits your review.
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
              <span className="text-ui" style={{ fontSize: 13 }}>Open review queue</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
            <button
              className="text-ui inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-foreground transition-colors hover:border-foreground/40"
              style={{ borderColor: "var(--border-op)", background: "transparent", fontSize: 13 }}
            >
              Export audit trail
            </button>
            <div className="text-code ml-1 flex items-center gap-2 text-muted-foreground" style={{ fontSize: 11 }}>
              <span>last verified</span>
              <span className="text-foreground tabular-nums">14s ago</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div
            className="relative flex items-center gap-6 rounded-xl border p-5"
            style={{
              borderColor: "var(--border-op)",
              background: "color-mix(in oklab, var(--surface-op-sunken) 60%, transparent)",
            }}
          >
            <TrustRing value={score} />
            <div className="min-w-0 flex-1">
              <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>overall trust</div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span
                  className="tabular-nums text-foreground"
                  style={{ fontFamily: "var(--font-serif)", fontSize: 44, lineHeight: 1 }}
                >
                  {score}
                </span>
                <span className="text-code text-muted-foreground" style={{ fontSize: 11 }}>/ 100</span>
                <span className="text-code" style={{ fontSize: 10, color: "var(--operational)" }}>+3 · 24h</span>
              </div>
              <div className="text-caption mt-2 text-muted-foreground">
                Weighted across evidence, agreement, assumptions, traceability and human validation.
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {breakdown.map((b) => {
              const c = b.tone === "warn" ? "var(--warning)" : "var(--operational)";
              return (
                <div key={b.label} className="flex items-center gap-4">
                  <div className="w-40 text-ui text-foreground/85" style={{ fontSize: 12 }}>{b.label}</div>
                  <div
                    className="h-[3px] flex-1 overflow-hidden rounded-full"
                    style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${b.value}%`,
                        background: `linear-gradient(90deg, color-mix(in oklab, ${c} 55%, transparent), ${c})`,
                        transition: "width 800ms var(--ease-standard)",
                      }}
                    />
                  </div>
                  <span className="text-code tabular-nums" style={{ fontSize: 11, color: c, minWidth: 32, textAlign: "right" }}>
                    {b.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRing({ value }: { value: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <defs>
          <linearGradient id="tr-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--operational)" />
            <stop offset="100%" stopColor="color-mix(in oklab, var(--info) 60%, var(--operational))" />
          </linearGradient>
        </defs>
        <circle cx="56" cy="56" r={r} fill="none" stroke="color-mix(in oklab, var(--foreground) 10%, transparent)" strokeWidth="6" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="url(#tr-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 56 56)"
          style={{ transition: "stroke-dasharray 400ms var(--ease-standard)" }}
        />
        <circle cx="56" cy="56" r={r - 10} fill="none" stroke="color-mix(in oklab, var(--operational) 20%, transparent)" strokeWidth="1" />
      </svg>
      <div
        className="pointer-events-none absolute inset-0 grid place-items-center"
        style={{ filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--operational) 40%, transparent))" }}
      >
        <span className="pulse-dot h-1.5 w-1.5 rounded-full" style={{ background: "var(--operational)" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Confidence Evolution ─────────────────────────── */

const CONF_POINTS = [
  62, 61, 64, 66, 63, 68, 71, 70, 74, 76, 75, 79, 81, 80, 83, 84, 82, 85, 86, 84, 87, 88, 87, 89,
];
const AGREE_POINTS = [
  55, 58, 60, 62, 59, 63, 66, 68, 67, 70, 72, 71, 74, 76, 74, 77, 79, 80, 78, 82, 83, 82, 84, 84,
];

function ConfidenceEvolution() {
  return (
    <SectionShell
      eyebrow="confidence evolution"
      title="How trust grew across this journey"
      meta="last 24h · per hour"
      action={
        <div className="hidden items-center gap-3 md:flex">
          <LegendDot color="var(--operational)" label="confidence" />
          <LegendDot color="var(--info)" label="agreement" />
        </div>
      }
    >
      <Panel className="p-5">
        <div className="relative">
          <TrendChart series={[
            { color: "var(--operational)", data: CONF_POINTS },
            { color: "var(--info)", data: AGREE_POINTS },
          ]} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 border-t pt-4" style={{ borderColor: "var(--border-op)" }}>
          <Statlet label="peak confidence" value="89%" note="02:14 UTC" />
          <Statlet label="lowest dip" value="61%" note="contradiction spike" tone="warn" />
          <Statlet label="mean agreement" value="72%" />
          <Statlet label="stability" value="high" note="σ 4.2" />
        </div>
      </Panel>
    </SectionShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-code inline-flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 10 }}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  );
}

function Statlet({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "warn" }) {
  const c = tone === "warn" ? "var(--warning)" : "var(--foreground)";
  return (
    <div>
      <div className="text-label text-muted-foreground" style={{ fontSize: 9 }}>{label}</div>
      <div className="mt-1 tabular-nums" style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1, color: c }}>
        {value}
      </div>
      {note ? (
        <div className="text-code mt-1 text-muted-foreground" style={{ fontSize: 10 }}>{note}</div>
      ) : null}
    </div>
  );
}

function TrendChart({ series }: { series: { color: string; data: number[] }[] }) {
  const W = 720;
  const H = 180;
  const pad = { l: 8, r: 8, t: 10, b: 18 };
  const all = series.flatMap((s) => s.data);
  const min = Math.min(...all) - 4;
  const max = Math.max(...all) + 4;
  const nx = series[0].data.length;
  const xStep = (W - pad.l - pad.r) / (nx - 1);
  const y = (v: number) => H - pad.b - ((v - min) / (max - min)) * (H - pad.t - pad.b);
  const x = (i: number) => pad.l + i * xStep;
  const paths = series.map((s) => {
    const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const area = `${d} L ${x(nx - 1).toFixed(1)} ${H - pad.b} L ${x(0).toFixed(1)} ${H - pad.b} Z`;
    return { ...s, d, area };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[180px] w-full">
      <defs>
        {paths.map((p, i) => (
          <linearGradient key={i} id={`tc-fill-${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={p.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + (H - pad.t - pad.b) * g}
          y2={pad.t + (H - pad.t - pad.b) * g}
          stroke="color-mix(in oklab, var(--foreground) 8%, transparent)"
          strokeDasharray="2 4"
        />
      ))}
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.area} fill={`url(#tc-fill-${i})`} />
          <path d={p.d} fill="none" stroke={p.color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          <circle
            cx={x(nx - 1)}
            cy={y(p.data[nx - 1])}
            r="3"
            fill={p.color}
            style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
          />
        </g>
      ))}
      {["-24h", "-18h", "-12h", "-6h", "now"].map((label, i, arr) => {
        const idx = Math.round((i / (arr.length - 1)) * (nx - 1));
        return (
          <text
            key={label}
            x={x(idx)}
            y={H - 4}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--muted-foreground)"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────── Agent Agreement Matrix ─────────────────────────── */

const AGENTS = ["R-01", "S-01", "U-01", "A-01", "Q-01", "C-01"];
// symmetric agreement values 0..1
const AGREEMENT: number[][] = [
  [1.0, 0.92, 0.86, 0.71, 0.88, 0.94],
  [0.92, 1.0, 0.83, 0.68, 0.86, 0.9],
  [0.86, 0.83, 1.0, 0.52, 0.79, 0.87],
  [0.71, 0.68, 0.52, 1.0, 0.74, 0.81],
  [0.88, 0.86, 0.79, 0.74, 1.0, 0.91],
  [0.94, 0.9, 0.87, 0.81, 0.91, 1.0],
];

function AgreementMatrix() {
  return (
    <SectionShell eyebrow="agent agreement" title="Where the agents converge">
      <Panel className="p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate" style={{ borderSpacing: 2 }}>
            <thead>
              <tr>
                <th />
                {AGENTS.map((a) => (
                  <th key={a} className="text-code text-muted-foreground" style={{ fontSize: 10, fontWeight: 400 }}>
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((row, i) => (
                <tr key={row}>
                  <td className="text-code pr-2 text-right text-muted-foreground" style={{ fontSize: 10 }}>{row}</td>
                  {AGREEMENT[i].map((v, j) => {
                    const isDiag = i === j;
                    const c = v < 0.6 ? "var(--warning)" : v < 0.75 ? "var(--info)" : "var(--operational)";
                    return (
                      <td key={j}>
                        <div
                          className="relative grid h-9 w-9 place-items-center rounded-[6px] border transition-transform hover:scale-105"
                          style={{
                            borderColor: "var(--border-op)",
                            background: isDiag
                              ? "color-mix(in oklab, var(--foreground) 6%, transparent)"
                              : `color-mix(in oklab, ${c} ${Math.round(v * 55)}%, transparent)`,
                          }}
                          title={`${AGENTS[i]} ↔ ${AGENTS[j]} · ${(v * 100).toFixed(0)}%`}
                        >
                          {!isDiag ? (
                            <span className="text-code tabular-nums text-foreground/85" style={{ fontSize: 10 }}>
                              {Math.round(v * 100)}
                            </span>
                          ) : (
                            <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>·</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border-op)" }}>
          <div className="text-caption text-muted-foreground">
            Lowest agreement <span className="text-foreground">U-01 ↔ A-01</span> at
            <span className="text-foreground"> 52%</span> — see contradictions below.
          </div>
          <div className="flex items-center gap-2">
            <LegendDot color="var(--warning)" label="<60" />
            <LegendDot color="var(--info)" label="60–75" />
            <LegendDot color="var(--operational)" label=">75" />
          </div>
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Lifecycle Validation Progress ─────────────────────────── */

const LIFECYCLE = [
  { key: "signal", label: "Signal", checks: 6, passed: 6, state: "done" as const },
  { key: "shape", label: "Shape", checks: 8, passed: 8, state: "done" as const },
  { key: "define", label: "Define", checks: 12, passed: 10, state: "attention" as const },
  { key: "design", label: "Design", checks: 14, passed: 11, state: "active" as const },
  { key: "build", label: "Build", checks: 18, passed: 0, state: "queued" as const },
  { key: "ship", label: "Ship", checks: 9, passed: 0, state: "queued" as const },
];

function LifecycleValidation() {
  return (
    <SectionShell eyebrow="lifecycle validation" title="Every stage, checked" meta="63% verified end-to-end">
      <Panel className="p-6">
        <div className="grid grid-cols-6 gap-3">
          {LIFECYCLE.map((s) => {
            const c =
              s.state === "done"
                ? "var(--operational)"
                : s.state === "attention"
                  ? "var(--warning)"
                  : s.state === "active"
                    ? "var(--operational)"
                    : "var(--muted-foreground)";
            const pct = Math.round((s.passed / s.checks) * 100);
            return (
              <div
                key={s.key}
                className="relative overflow-hidden rounded-lg border p-3"
                style={{
                  borderColor: "var(--border-op)",
                  background:
                    s.state === "active"
                      ? "color-mix(in oklab, var(--operational) 8%, transparent)"
                      : "color-mix(in oklab, var(--surface-op-sunken) 60%, transparent)",
                }}
              >
                {s.state === "active" ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: "var(--operational)", boxShadow: "0 0 6px var(--operational)" }}
                  />
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-ui text-foreground" style={{ fontSize: 12 }}>{s.label}</span>
                  <span className="text-code tabular-nums" style={{ fontSize: 10, color: c }}>
                    {s.passed}/{s.checks}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: s.checks }).map((_, i) => {
                    const passed = i < s.passed;
                    return (
                      <span
                        key={i}
                        className="inline-block h-1.5 flex-1 rounded-full"
                        style={{
                          background: passed ? c : "color-mix(in oklab, var(--foreground) 8%, transparent)",
                          boxShadow: passed && s.state !== "queued" ? `0 0 4px ${c}` : "none",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-code mt-3 text-muted-foreground" style={{ fontSize: 10 }}>
                  {s.state === "done"
                    ? "all checks passed"
                    : s.state === "attention"
                      ? `${s.checks - s.passed} awaiting evidence`
                      : s.state === "active"
                        ? `${pct}% verified · in progress`
                        : "queued"}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Artifact Quality Table ─────────────────────────── */

type ArtifactRow = {
  id: string;
  title: string;
  kind: string;
  confidence: number;
  coverage: number;
  assumptions: number;
  contradictions: number;
  status: "verified" | "review" | "attention" | "draft";
};

const ARTIFACT_ROWS: ArtifactRow[] = [
  { id: "SPEC-014", title: "Enterprise onboarding — v3 draft", kind: "spec", confidence: 91, coverage: 94, assumptions: 2, contradictions: 1, status: "review" },
  { id: "RES-041", title: "Signal synthesis · 18 interviews", kind: "research", confidence: 88, coverage: 97, assumptions: 0, contradictions: 0, status: "verified" },
  { id: "ARCH-007", title: "Token migration plan", kind: "architecture", confidence: 77, coverage: 68, assumptions: 5, contradictions: 2, status: "attention" },
  { id: "BRIEF-002", title: "Positioning · calm operating layer", kind: "brief", confidence: 82, coverage: 74, assumptions: 3, contradictions: 0, status: "review" },
  { id: "FLOW-011", title: "Empty state redesign — 3 candidates", kind: "flow", confidence: 79, coverage: 71, assumptions: 4, contradictions: 1, status: "attention" },
  { id: "MET-003", title: "Success metrics rubric", kind: "metric", confidence: 64, coverage: 52, assumptions: 6, contradictions: 0, status: "draft" },
];

function ArtifactQuality({ onInspect }: { onInspect: (title: string) => void }) {
  const [filter, setFilter] = useState<"all" | "attention" | "review" | "verified">("all");
  const [q, setQ] = useState("");
  const rows = ARTIFACT_ROWS.filter((r) =>
    (filter === "all" || r.status === filter) && r.title.toLowerCase().includes(q.toLowerCase())
  );

  const statusColor: Record<ArtifactRow["status"], string> = {
    verified: "var(--operational)",
    review: "var(--info)",
    attention: "var(--warning)",
    draft: "var(--muted-foreground)",
  };

  return (
    <SectionShell
      eyebrow="artifact quality"
      title="Every artifact, examined"
      meta={`${ARTIFACT_ROWS.length} in workspace`}
      action={
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center gap-2 rounded-md border px-2 py-1 md:flex"
            style={{ borderColor: "var(--border-op)" }}
          >
            <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter artifacts…"
              className="w-40 bg-transparent text-ui text-foreground outline-none placeholder:text-muted-foreground"
              style={{ fontSize: 12 }}
            />
          </div>
          <div className="flex items-center gap-1">
            {(["all", "attention", "review", "verified"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-code rounded-md border px-2 py-1 transition-colors"
                style={{
                  fontSize: 10,
                  borderColor: "var(--border-op)",
                  color: filter === f ? "var(--foreground)" : "var(--muted-foreground)",
                  background:
                    filter === f ? "color-mix(in oklab, var(--foreground) 5%, transparent)" : "transparent",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <Panel className="overflow-hidden">
        <div
          className="grid items-center gap-4 border-b px-6 py-3 text-label text-muted-foreground"
          style={{ fontSize: 10, borderColor: "var(--border-op)", gridTemplateColumns: "minmax(0,2.4fr) 1fr 1fr 0.8fr 0.8fr 0.9fr" }}
        >
          <div>artifact</div>
          <div>confidence</div>
          <div>coverage</div>
          <div>assumptions</div>
          <div>contradictions</div>
          <div className="text-right">status</div>
        </div>
        <ul>
          {rows.map((r) => (
            <li
              key={r.id}
              className="group grid cursor-pointer items-center gap-4 border-b px-6 py-3.5 transition-colors last:border-0 hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
              style={{ borderColor: "var(--border-op)", gridTemplateColumns: "minmax(0,2.4fr) 1fr 1fr 0.8fr 0.8fr 0.9fr" }}
              onClick={() => onInspect(r.title)}
            >
              <div className="min-w-0">
                <div className="text-ui truncate text-foreground" style={{ fontSize: 13 }}>{r.title}</div>
                <div className="text-code mt-0.5 text-muted-foreground" style={{ fontSize: 10 }}>
                  {r.kind} · {r.id}
                </div>
              </div>
              <MeterCell value={r.confidence} tone={r.confidence >= 80 ? "op" : "warn"} />
              <MeterCell value={r.coverage} tone={r.coverage >= 75 ? "op" : "warn"} />
              <CountCell value={r.assumptions} tone={r.assumptions > 3 ? "warn" : "muted"} />
              <CountCell value={r.contradictions} tone={r.contradictions > 0 ? "err" : "op"} />
              <div className="flex items-center justify-end gap-2">
                <span
                  className="text-code inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5"
                  style={{
                    fontSize: 10,
                    color: statusColor[r.status],
                    borderColor: `color-mix(in oklab, ${statusColor[r.status]} 32%, transparent)`,
                    background: `color-mix(in oklab, ${statusColor[r.status]} 10%, transparent)`,
                  }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: statusColor[r.status] }} />
                  {r.status}
                </span>
                <span
                  aria-hidden
                  className="text-ui text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  style={{ fontSize: 13 }}
                >
                  →
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </SectionShell>
  );
}

function MeterCell({ value, tone }: { value: number; tone: "op" | "warn" }) {
  const c = tone === "warn" ? "var(--warning)" : "var(--operational)";
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1 flex-1 overflow-hidden rounded-full"
        style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${c} 60%, transparent), ${c})`,
          }}
        />
      </div>
      <span className="text-code tabular-nums" style={{ fontSize: 11, color: c, minWidth: 26, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function CountCell({ value, tone }: { value: number; tone: "op" | "warn" | "err" | "muted" }) {
  const c =
    tone === "warn"
      ? "var(--warning)"
      : tone === "err"
        ? "var(--destructive)"
        : tone === "op"
          ? "var(--operational)"
          : "var(--muted-foreground)";
  return (
    <div className="text-code tabular-nums" style={{ fontSize: 12, color: c }}>{value}</div>
  );
}

/* ─────────────────────────── Evidence Coverage ─────────────────────────── */

const EVIDENCE_SOURCES = [
  { kind: "Interviews", count: 18, weight: 0.32, tone: "op" as const, note: "18 of 20 tagged · 2 pending transcript" },
  { kind: "Analytics", count: 46, weight: 0.24, tone: "op" as const, note: "product · billing · onboarding funnels" },
  { kind: "Support tickets", count: 132, weight: 0.18, tone: "op" as const, note: "clustered into 7 themes" },
  { kind: "Competitive scans", count: 9, weight: 0.14, tone: "warn" as const, note: "3 stale · re-scan recommended" },
  { kind: "Internal memos", count: 21, weight: 0.08, tone: "op" as const, note: "attributed to 6 authors" },
  { kind: "Public research", count: 12, weight: 0.04, tone: "warn" as const, note: "1 outdated citation flagged" },
];

function EvidenceCoverage() {
  return (
    <SectionShell eyebrow="evidence coverage" title="What supports these decisions" meta="318 sources attributed">
      <Panel className="p-5">
        <div className="space-y-3">
          {EVIDENCE_SOURCES.map((e) => {
            const c = e.tone === "warn" ? "var(--warning)" : "var(--operational)";
            return (
              <div key={e.kind} className="group grid items-center gap-4" style={{ gridTemplateColumns: "160px 1fr auto" }}>
                <div>
                  <div className="text-ui text-foreground" style={{ fontSize: 12 }}>{e.kind}</div>
                  <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{e.note}</div>
                </div>
                <div
                  className="relative h-2 overflow-hidden rounded-full"
                  style={{ background: "color-mix(in oklab, var(--foreground) 7%, transparent)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(e.weight * 100 * 2)}%`,
                      background: `linear-gradient(90deg, color-mix(in oklab, ${c} 50%, transparent), ${c})`,
                      transition: "width 600ms var(--ease-standard)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-code tabular-nums text-muted-foreground" style={{ fontSize: 11 }}>
                    {e.count} src
                  </span>
                  <span
                    className="text-code tabular-nums rounded-md border px-1.5 py-0.5"
                    style={{ fontSize: 10, borderColor: "var(--border-op)", color: "var(--foreground)" }}
                  >
                    {Math.round(e.weight * 100)}% weight
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Missing Evidence ─────────────────────────── */

const MISSING = [
  { area: "Success metrics", stage: "Define", need: "Baseline conversion for enterprise cohort", agent: "R-01", severity: "high" as const },
  { area: "Token migration", stage: "Design", need: "Sample palette applied to legacy screens", agent: "A-01", severity: "med" as const },
  { area: "Empty state", stage: "Design", need: "User quote validating 'guided' vs 'blank'", agent: "U-01", severity: "med" as const },
  { area: "Positioning", stage: "Shape", need: "Two competitor narratives to contrast", agent: "S-01", severity: "low" as const },
];

function MissingEvidence() {
  return (
    <SectionShell eyebrow="missing evidence" title="What is not yet supported" meta="4 gaps">
      <Panel className="overflow-hidden">
        <ul>
          {MISSING.map((m, i) => {
            const c = m.severity === "high" ? "var(--destructive)" : m.severity === "med" ? "var(--warning)" : "var(--info)";
            return (
              <li
                key={i}
                className="group relative grid items-center gap-4 border-b px-5 py-3.5 transition-colors last:border-0 hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
                style={{ borderColor: "var(--border-op)", gridTemplateColumns: "auto 1fr auto" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[2px]"
                  style={{ background: c }}
                />
                <div className="pl-2">
                  <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{m.stage}</div>
                  <div className="text-ui text-foreground" style={{ fontSize: 12 }}>{m.area}</div>
                </div>
                <div className="text-caption text-foreground/85 min-w-0 truncate">{m.need}</div>
                <div className="flex items-center gap-2">
                  <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{m.agent}</span>
                  <button
                    className="text-code rounded-md border px-2 py-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ fontSize: 10, borderColor: "var(--border-op)", color: "var(--foreground)" }}
                  >
                    Request evidence
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Contradictions ─────────────────────────── */

type Contradiction = {
  id: string;
  title: string;
  a: { agent: string; claim: string; confidence: number };
  b: { agent: string; claim: string; confidence: number };
  severity: "high" | "med" | "low";
  evidence: number;
};

const CONTRADICTIONS: Contradiction[] = [
  {
    id: "CTR-004",
    title: "Should billing precede team invites?",
    a: {
      agent: "U-01",
      claim: "Team invites first — 68% of enterprise buyers evaluate collaboratively.",
      confidence: 84,
    },
    b: {
      agent: "A-01",
      claim: "Billing first — provisioning boundaries block invite scale beyond 25 seats.",
      confidence: 79,
    },
    severity: "high",
    evidence: 14,
  },
  {
    id: "CTR-005",
    title: "Guided empty state vs. blank canvas",
    a: { agent: "U-01", claim: "Guided reduces day-1 abandonment by 22% in comparable studies.", confidence: 76 },
    b: { agent: "S-01", claim: "Blank canvas better signals 'operating system' positioning.", confidence: 71 },
    severity: "med",
    evidence: 9,
  },
];

function Contradictions({ onInspect }: { onInspect: (title: string) => void }) {
  const [open, setOpen] = useState<string | null>("CTR-004");
  return (
    <SectionShell
      eyebrow="contradictions"
      title="Where the reasoning disagrees"
      meta="2 open · 9 resolved"
    >
      <div className="grid gap-4">
        {CONTRADICTIONS.map((c) => (
          <ContradictionCard
            key={c.id}
            c={c}
            open={open === c.id}
            onToggle={() => setOpen(open === c.id ? null : c.id)}
            onInspect={() => onInspect(c.title)}
          />
        ))}
      </div>
    </SectionShell>
  );
}

function ContradictionCard({
  c,
  open,
  onToggle,
  onInspect,
}: {
  c: Contradiction;
  open: boolean;
  onToggle: () => void;
  onInspect: () => void;
}) {
  const sevColor = c.severity === "high" ? "var(--destructive)" : c.severity === "med" ? "var(--warning)" : "var(--info)";
  return (
    <Panel className="overflow-hidden">
      <button
        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
        onClick={onToggle}
      >
        <span
          className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2"
          style={{
            borderColor: `color-mix(in oklab, ${sevColor} 32%, transparent)`,
            background: `color-mix(in oklab, ${sevColor} 10%, transparent)`,
          }}
        >
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: sevColor }} />
          <span className="text-code" style={{ fontSize: 10, color: sevColor }}>{c.severity}</span>
        </span>
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{c.id}</div>
        <div className="text-ui flex-1 text-foreground" style={{ fontSize: 13 }}>{c.title}</div>
        <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
          {c.evidence} pieces of evidence
        </div>
        <span
          className="text-ui text-muted-foreground transition-transform"
          style={{ fontSize: 13, transform: open ? "rotate(90deg)" : "none" }}
        >
          ›
        </span>
      </button>

      {open ? (
        <div
          className="grid gap-px border-t"
          style={{
            borderColor: "var(--border-op)",
            gridTemplateColumns: "1fr 1fr",
            background: "var(--border-op)",
          }}
        >
          <ClaimCell side="A" claim={c.a} accent="var(--info)" />
          <ClaimCell side="B" claim={c.b} accent="var(--operational)" />
          <div
            className="col-span-2 flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            style={{ background: "color-mix(in oklab, var(--surface-op-sunken) 70%, transparent)" }}
          >
            <div className="text-caption text-muted-foreground">
              Coordinator recommends resolution via <span className="text-foreground">weighted evidence review</span> — three
              enterprise interviews contain both signals.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onInspect}
                className="text-code rounded-md border px-2.5 py-1 text-foreground"
                style={{ fontSize: 10, borderColor: "var(--border-op)" }}
              >
                Inspect reasoning
              </button>
              <button
                className="text-code rounded-md px-2.5 py-1 text-primary-foreground"
                style={{
                  fontSize: 10,
                  background: "var(--operational)",
                  boxShadow: "inset 0 1px 0 color-mix(in oklab, white 24%, transparent)",
                }}
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function ClaimCell({
  side,
  claim,
  accent,
}: {
  side: string;
  claim: { agent: string; claim: string; confidence: number };
  accent: string;
}) {
  return (
    <div className="p-6" style={{ background: "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)" }}>
      <div className="flex items-center gap-2">
        <span
          className="text-code inline-flex h-5 w-5 items-center justify-center rounded-full border"
          style={{
            fontSize: 10,
            borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`,
            color: accent,
            background: `color-mix(in oklab, ${accent} 12%, transparent)`,
          }}
        >
          {side}
        </span>
        <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{claim.agent}</span>
        <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>·</span>
        <span className="text-code tabular-nums" style={{ fontSize: 10, color: accent }}>
          {claim.confidence}% confident
        </span>
      </div>
      <p
        className="mt-3 text-foreground/90"
        style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: 1.35, letterSpacing: "-0.005em" }}
      >
        “{claim.claim}”
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["interview-11.md", "analytics/funnel-04", "memo/enterprise-q2.md"].map((s) => (
          <SourceChip key={s} label={s} />
        ))}
      </div>
    </div>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span
      className="text-code inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 transition-colors hover:border-foreground/40"
      style={{
        fontSize: 10,
        borderColor: "var(--border-op)",
        color: "var(--muted-foreground)",
        background: "color-mix(in oklab, var(--foreground) 3%, transparent)",
      }}
    >
      <span style={{ color: "var(--operational)" }}>§</span>
      {label}
    </span>
  );
}

/* ─────────────────────────── Reasoning Trace ─────────────────────────── */

type ReasonStep = {
  n: string;
  agent: string;
  action: string;
  detail: string;
  sources?: string[];
  confidence: number;
};

const REASONING: ReasonStep[] = [
  {
    n: "01",
    agent: "R-01",
    action: "clustered signals",
    detail: "18 enterprise interviews grouped into 5 latent needs — 'onboarding depth' emerged as the dominant one.",
    sources: ["interview-04.md", "interview-11.md", "interview-16.md"],
    confidence: 92,
  },
  {
    n: "02",
    agent: "S-01",
    action: "shaped hypothesis",
    detail: "Recast the problem as 'time-to-first-orchestration' rather than 'time-to-first-value'.",
    sources: ["memo/enterprise-q2.md"],
    confidence: 84,
  },
  {
    n: "03",
    agent: "U-01",
    action: "drafted flow",
    detail: "Three onboarding candidates — guided, blank, and hybrid. Preferred hybrid based on user language.",
    sources: ["research/empty-state-study.pdf"],
    confidence: 78,
  },
  {
    n: "04",
    agent: "A-01",
    action: "raised constraint",
    detail: "Provisioning limits require billing entry before team invites at seat counts ≥ 25.",
    sources: ["arch/provisioning-notes.md"],
    confidence: 79,
  },
  {
    n: "05",
    agent: "Q-01",
    action: "flagged contradiction",
    detail: "U-01 and A-01 propose incompatible order for billing and invites — logged as CTR-004.",
    confidence: 88,
  },
  {
    n: "06",
    agent: "C-01",
    action: "escalated to human",
    detail: "Coordinator routed CTR-004 to product lead with three supporting interviews for weighted review.",
    confidence: 96,
  },
];

function ReasoningTrace() {
  const [open, setOpen] = useState<string | null>("05");
  return (
    <SectionShell eyebrow="reasoning trace" title="How the system arrived here" meta="6 steps · fully attributable">
      <Panel className="p-5">
        <ol className="relative">
          <span
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 w-px"
            style={{ background: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          />
          {REASONING.map((s) => {
            const isOpen = open === s.n;
            return (
              <li key={s.n} className="relative pl-12">
                <span
                  className="absolute left-[10px] top-2 grid h-[18px] w-[18px] place-items-center rounded-full border"
                  style={{
                    borderColor: "var(--border-op)",
                    background: "var(--surface-op-elevated)",
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--operational)", boxShadow: "0 0 5px var(--operational)" }}
                  />
                </span>
                <button
                  onClick={() => setOpen(isOpen ? null : s.n)}
                  className="group flex w-full items-center gap-3 py-2 text-left"
                >
                  <span className="text-code text-muted-foreground tabular-nums" style={{ fontSize: 10 }}>
                    step {s.n}
                  </span>
                  <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{s.agent}</span>
                  <span className="text-ui text-foreground" style={{ fontSize: 13 }}>{s.action}</span>
                  <span
                    className="text-code ml-auto tabular-nums"
                    style={{ fontSize: 10, color: "var(--operational)" }}
                  >
                    {s.confidence}%
                  </span>
                  <span
                    className="text-ui text-muted-foreground transition-transform"
                    style={{ fontSize: 13, transform: isOpen ? "rotate(90deg)" : "none" }}
                  >
                    ›
                  </span>
                </button>
                {isOpen ? (
                  <div
                    className="mb-3 mt-1 rounded-lg border p-4"
                    style={{
                      borderColor: "var(--border-op)",
                      background: "color-mix(in oklab, var(--surface-op-sunken) 60%, transparent)",
                    }}
                  >
                    <p className="text-body text-foreground/90">{s.detail}</p>
                    {s.sources ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.sources.map((src) => (
                          <SourceChip key={src} label={src} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Risk Analysis ─────────────────────────── */

const RISKS = [
  { title: "Provisioning limits at 25 seats", likelihood: 0.72, impact: 0.82, owner: "A-01" },
  { title: "Stale competitive scans", likelihood: 0.48, impact: 0.32, owner: "R-01" },
  { title: "Ambiguous success metrics", likelihood: 0.61, impact: 0.7, owner: "S-01" },
  { title: "Empty state usability regression", likelihood: 0.38, impact: 0.55, owner: "U-01" },
];

function RiskAnalysis() {
  return (
    <SectionShell eyebrow="risk analysis" title="What could still break" meta="4 tracked">
      <Panel className="p-5">
        <div
          className="relative rounded-lg border"
          style={{
            borderColor: "var(--border-op)",
            background: "color-mix(in oklab, var(--surface-op-sunken) 60%, transparent)",
            aspectRatio: "1.6 / 1",
          }}
        >
          {/* axes labels */}
          <span className="absolute bottom-1 left-2 text-code text-muted-foreground" style={{ fontSize: 9 }}>
            likelihood →
          </span>
          <span
            className="absolute left-1 top-2 -rotate-90 text-code text-muted-foreground"
            style={{ fontSize: 9, transformOrigin: "left top" }}
          >
            impact →
          </span>
          {/* quadrants */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to top, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
              backgroundSize: "25% 25%",
            }}
          />
          {RISKS.map((r) => {
            const severity = r.likelihood * r.impact;
            const c = severity > 0.5 ? "var(--destructive)" : severity > 0.3 ? "var(--warning)" : "var(--info)";
            return (
              <div
                key={r.title}
                className="group absolute -translate-x-1/2 translate-y-1/2"
                style={{
                  left: `${r.likelihood * 100}%`,
                  bottom: `${r.impact * 100}%`,
                }}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 12 + severity * 24,
                    height: 12 + severity * 24,
                    background: `radial-gradient(closest-side, ${c}, color-mix(in oklab, ${c} 30%, transparent))`,
                    boxShadow: `0 0 20px color-mix(in oklab, ${c} 60%, transparent)`,
                  }}
                />
                <div
                  className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    borderColor: "var(--border-op)",
                    background: "var(--surface-op-elevated)",
                  }}
                >
                  <div className="text-ui text-foreground" style={{ fontSize: 11 }}>{r.title}</div>
                  <div className="text-code text-muted-foreground" style={{ fontSize: 9 }}>
                    L {Math.round(r.likelihood * 100)} · I {Math.round(r.impact * 100)} · {r.owner}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ul className="mt-4 space-y-2">
          {RISKS.map((r) => {
            const s = r.likelihood * r.impact;
            const c = s > 0.5 ? "var(--destructive)" : s > 0.3 ? "var(--warning)" : "var(--info)";
            return (
              <li key={r.title} className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                <span className="text-ui flex-1 text-foreground/85" style={{ fontSize: 12 }}>{r.title}</span>
                <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>{r.owner}</span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Review Queue ─────────────────────────── */

const REVIEW_QUEUE = [
  { id: "REV-104", title: "Approve billing-before-invites order", from: "C-01", due: "today · 16:00", severity: "high" as const },
  { id: "REV-103", title: "Confirm empty state copy tone", from: "U-01", due: "today · 18:30", severity: "med" as const },
  { id: "REV-102", title: "Sign off on token migration phase 1", from: "A-01", due: "tomorrow", severity: "med" as const },
  { id: "REV-101", title: "Rate synthesis of interview cohort", from: "R-01", due: "in 2 days", severity: "low" as const },
];

function ReviewQueue({ onInspect }: { onInspect: (title: string) => void }) {
  return (
    <SectionShell eyebrow="review queue" title="Waiting on you" meta="4 items">
      <Panel className="overflow-hidden">
        <ul>
          {REVIEW_QUEUE.map((r) => {
            const c = r.severity === "high" ? "var(--destructive)" : r.severity === "med" ? "var(--warning)" : "var(--info)";
            return (
              <li
                key={r.id}
                onClick={() => onInspect(r.title)}
                className="group grid cursor-pointer items-center gap-4 border-b px-5 py-3.5 transition-colors last:border-0 hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
                style={{ borderColor: "var(--border-op)", gridTemplateColumns: "auto 1fr auto auto" }}
              >
                <span
                  className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2"
                  style={{
                    borderColor: `color-mix(in oklab, ${c} 32%, transparent)`,
                    background: `color-mix(in oklab, ${c} 10%, transparent)`,
                  }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                  <span className="text-code" style={{ fontSize: 10, color: c }}>{r.severity}</span>
                </span>
                <div className="min-w-0">
                  <div className="text-ui truncate text-foreground" style={{ fontSize: 13 }}>{r.title}</div>
                  <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
                    {r.id} · from {r.from}
                  </div>
                </div>
                <div className="text-code tabular-nums text-muted-foreground" style={{ fontSize: 10 }}>{r.due}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="text-code rounded-md border px-2 py-0.5"
                    style={{ fontSize: 10, borderColor: "var(--border-op)", color: "var(--foreground)" }}
                  >
                    Review
                  </button>
                  <button
                    className="text-code rounded-md px-2 py-0.5 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ fontSize: 10, background: "var(--operational)" }}
                  >
                    Approve
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Reviewer Timeline ─────────────────────────── */

const REVIEWER_EVENTS = [
  { t: "09:14", who: "Elena", action: "approved", ref: "DCN-020 · empty-state pattern", tone: "op" as const },
  { t: "08:52", who: "C-01", action: "escalated", ref: "CTR-004 to product lead", tone: "info" as const },
  { t: "08:41", who: "Q-01", action: "flagged", ref: "contradiction between UX ↔ Architect", tone: "warn" as const },
  { t: "08:22", who: "Elena", action: "commented", ref: "on SPEC-014 §3.2", tone: "info" as const },
  { t: "07:58", who: "R-01", action: "attributed", ref: "12 sources to spec-014", tone: "op" as const },
  { t: "07:31", who: "Elena", action: "requested", ref: "evidence for MET-003", tone: "warn" as const },
];

function ReviewerTimeline() {
  const toneC = { op: "var(--operational)", info: "var(--info)", warn: "var(--warning)" };
  return (
    <SectionShell eyebrow="reviewer timeline" title="The human trail">
      <Panel className="p-5">
        <ol className="relative space-y-3">
          <span
            aria-hidden
            className="absolute left-[52px] top-1 bottom-1 w-px"
            style={{ background: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          />
          {REVIEWER_EVENTS.map((e, i) => {
            const c = toneC[e.tone];
            return (
              <li key={i} className="grid items-baseline gap-3" style={{ gridTemplateColumns: "44px 20px 1fr" }}>
                <span className="text-code tabular-nums text-muted-foreground text-right" style={{ fontSize: 10 }}>
                  {e.t}
                </span>
                <span className="relative flex justify-center">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                  />
                </span>
                <div className="text-caption text-foreground/85">
                  <span className="text-foreground">{e.who}</span>{" "}
                  <span className="text-muted-foreground">{e.action}</span> {e.ref}
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </SectionShell>
  );
}

/* ─────────────────────────── Recommendations ─────────────────────────── */

const RECOMMENDATIONS = [
  {
    kind: "resolve",
    title: "Resolve CTR-004 with weighted evidence review",
    body: "Three enterprise interviews contain both billing and invite signals. Coordinator estimates 12m to a decision.",
    effort: "12m",
    lift: "+4 trust",
  },
  {
    kind: "collect",
    title: "Request baseline metric for enterprise conversion",
    body: "R-01 can pull this from analytics/funnel-04 in one pass. Unlocks the Success Metrics stage.",
    effort: "auto · 3m",
    lift: "+2 coverage",
  },
  {
    kind: "review",
    title: "Sign off on empty-state candidate",
    body: "U-01 is 78% confident on the hybrid pattern. One line of feedback closes it.",
    effort: "5m",
    lift: "+1 review",
  },
];

function Recommendations() {
  return (
    <SectionShell eyebrow="recommendations" title="Smallest moves, largest trust gain">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {RECOMMENDATIONS.map((r) => (
          <div
            key={r.title}
            className="group relative overflow-hidden rounded-xl border p-5 transition-transform duration-300 hover:-translate-y-0.5"
            style={{
              borderColor: "var(--border-op)",
              background: "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-5 top-0 h-px opacity-70"
              style={{
                background:
                  "linear-gradient(90deg, transparent, color-mix(in oklab, var(--operational) 60%, transparent), transparent)",
              }}
            />
            <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>{r.kind}</div>
            <div
              className="mt-2 text-foreground"
              style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.25, letterSpacing: "-0.01em" }}
            >
              {r.title}
            </div>
            <p className="text-caption mt-3 text-muted-foreground">{r.body}</p>
            <div className="mt-5 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border-op)" }}>
              <div className="text-code text-muted-foreground" style={{ fontSize: 10 }}>
                effort <span className="text-foreground">{r.effort}</span> · lift <span style={{ color: "var(--operational)" }}>{r.lift}</span>
              </div>
              <button
                className="text-code rounded-md border px-2 py-0.5 text-foreground transition-colors hover:border-foreground/40"
                style={{ fontSize: 10, borderColor: "var(--border-op)" }}
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ─────────────────────────── Inspector drawer ─────────────────────────── */

type InspectorSubject = { kind: "artifact" | "contradiction" | "review"; title: string };

function Inspector({ subject, onClose }: { subject: InspectorSubject | null; onClose: () => void }) {
  if (!subject) return null;
  const label =
    subject.kind === "artifact"
      ? "artifact"
      : subject.kind === "contradiction"
        ? "contradiction"
        : "review";
  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end"
      style={{ background: "color-mix(in oklab, black 45%, transparent)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="animate-in-up flex h-full w-full max-w-[520px] flex-col border-l"
        style={{
          background: "var(--surface-op-elevated)",
          borderColor: "var(--border-op)",
          boxShadow: "-24px 0 60px -20px black",
        }}
      >
        <header
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border-op)" }}
        >
          <div>
            <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>{label} inspector</div>
            <div
              className="mt-1 text-foreground"
              style={{ fontFamily: "var(--font-serif)", fontSize: 20, lineHeight: 1.2, letterSpacing: "-0.01em" }}
            >
              {subject.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ui rounded-md border px-2 py-1 text-muted-foreground hover:text-foreground"
            style={{ borderColor: "var(--border-op)", fontSize: 12 }}
          >
            close · esc
          </button>
        </header>
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>reasoning</div>
            <p className="text-body mt-2 text-foreground/85">
              Six agents contributed to this subject. The coordinator weighted evidence across research,
              architecture and UX, and surfaced the following steps for human review.
            </p>
          </div>
          <div>
            <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>sources</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["interview-04.md", "interview-11.md", "analytics/funnel-04", "memo/enterprise-q2.md", "arch/provisioning-notes.md"].map(
                (s) => (
                  <SourceChip key={s} label={s} />
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>signals</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Statlet label="confidence" value="84%" note="↑ from 79" />
              <Statlet label="agreement" value="72%" note="U-01 dissenting" tone="warn" />
              <Statlet label="coverage" value="94%" />
              <Statlet label="assumptions" value="2" note="unresolved" tone="warn" />
            </div>
          </div>
        </div>
        <footer
          className="flex items-center justify-between border-t px-6 py-4"
          style={{ borderColor: "var(--border-op)" }}
        >
          <button
            className="text-ui rounded-md border px-3 py-1.5 text-foreground"
            style={{ borderColor: "var(--border-op)", fontSize: 12 }}
          >
            Add comment
          </button>
          <button
            className="text-ui rounded-md px-3 py-1.5 text-primary-foreground"
            style={{
              fontSize: 12,
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--operational) 100%, transparent), color-mix(in oklab, var(--operational) 80%, black))",
              boxShadow: "inset 0 1px 0 color-mix(in oklab, white 24%, transparent)",
            }}
          >
            Approve
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* ─────────────────────────── System rail (mirrors Mission Control) ─────────────────────────── */

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
      <RailChip label="trust" value="87 / 100" tone="op" />
      <RailChip label="contradictions" value="2 open" tone="warn" />
      <RailChip label="reviews" value="4 pending" />
      <RailChip label="latency" value="128ms" />
      <div className="ml-auto flex items-center gap-4">
        <RailChip label="uptime" value={uptime} />
        <RailChip label="build" value="iq.2026.07.25" />
      </div>
    </div>
  );
}

function RailChip({ label, value, tone }: { label: string; value: string; tone?: "op" | "warn" }) {
  const c = tone === "op" ? "var(--operational)" : tone === "warn" ? "var(--warning)" : "var(--foreground)";
  return (
    <span className="text-code inline-flex items-center gap-2" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
      <span>{label}</span>
      <span className="tabular-nums" style={{ color: c }}>{value}</span>
    </span>
  );
}

/* ─────────────────────────── Command Palette ─────────────────────────── */

const PALETTE_ITEMS = [
  { group: "Navigate", label: "Mission Control", hint: "G M" },
  { group: "Navigate", label: "Review queue", hint: "G R" },
  { group: "Inspect", label: "Open reasoning trace for CTR-004", hint: "⏎" },
  { group: "Inspect", label: "Show source attributions for SPEC-014", hint: "⏎" },
  { group: "Ask", label: "Why did agreement drop 06:12?", hint: "?" },
  { group: "Ask", label: "Which assumptions still lack evidence?", hint: "?" },
  { group: "Workspace", label: "Export audit trail", hint: "⇧ E" },
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
          <span className="text-code text-muted-foreground" style={{ fontSize: 12 }}>⌘</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            placeholder="Inspect anything…"
            className="text-ui flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            style={{ fontSize: 14 }}
          />
          <span className="kbd-key">esc</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.entries(groups).map(([g, items]) => (
            <div key={g} className="mb-2">
              <div className="text-label px-3 pb-1 pt-2 text-muted-foreground" style={{ fontSize: 10 }}>{g}</div>
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
                        <span className="text-ui" style={{ fontSize: 13 }}>{it.label}</span>
                        <span className="text-code" style={{ fontSize: 10 }}>{it.hint}</span>
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