import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IdeaGate — The Product Lifecycle Operating System" },
      {
        name: "description",
        content:
          "IdeaGate is an AI-native operating system for product teams. Turn a raw idea into research, PRDs, architecture and prototypes through a lifecycle-driven multi-agent workspace.",
      },
      { property: "og:title", content: "IdeaGate — The Product Lifecycle Operating System" },
      {
        property: "og:description",
        content:
          "A calm, editorial workspace for AI-native product thinking. Multi-agent execution, lifecycle-aware artifacts, mission-control precision.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

/* ============================================================
 * Theme toggle (persists nothing — landing defaults to dark for atmosphere)
 * ============================================================ */
function useTheme(initial: "light" | "dark" = "dark") {
  const [theme, setTheme] = useState<"light" | "dark">(initial);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
  return { theme, setTheme };
}

/* ============================================================
 * Ambient constellation background (hero only)
 * Sparse drifting nodes + faint links + one slow emerald lifecycle pulse.
 * Cursor adds soft parallax. Respects prefers-reduced-motion.
 * ============================================================ */
function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];
    let edges: Array<[number, number]> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // density scales with area
      const count = Math.round(Math.min(90, Math.max(38, (width * height) / 22000)));
      nodes = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.2 + 0.4,
      }));
      // precompute a candidate edge list (nearest neighbours-ish)
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          edges.push([i, j]);
        }
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => (mouseRef.current.active = false);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    // Lifecycle pulse — one traveling packet on a random edge every few seconds
    let pulse: { a: number; b: number; t: number; duration: number } | null = null;
    const spawnPulse = () => {
      if (nodes.length < 2) return;
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      if (b === a) b = (b + 1) % nodes.length;
      pulse = { a, b, t: 0, duration: 2600 + Math.random() * 2000 };
    };
    const pulseTimer = window.setInterval(spawnPulse, 5200);
    spawnPulse();

    // read CSS tokens for theme-aware colors
    const styles = getComputedStyle(document.documentElement);
    const inkColor = () => {
      // muted foreground-ish
      const isDark = document.documentElement.classList.contains("dark");
      return isDark ? "255, 255, 255" : "20, 22, 28";
    };
    const emeraldRgb = () => {
      // approximate token: emerald-ish
      const isDark = document.documentElement.classList.contains("dark");
      return isDark ? "110, 231, 183" : "16, 145, 100";
    };

    let raf = 0;
    let last = performance.now();
    const linkDist = 140;

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;
      const ink = inkColor();

      // update
      for (const n of nodes) {
        n.x += n.vx * (reduced ? 0 : 1);
        n.y += n.vy * (reduced ? 0 : 1);
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // draw links (faint, distance-modulated)
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > linkDist * linkDist) continue;
        const d = Math.sqrt(d2);
        const alpha = (1 - d / linkDist) * 0.09;
        ctx.strokeStyle = `rgba(${ink}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // draw nodes with subtle cursor lift
      for (const n of nodes) {
        let lift = 0;
        if (active) {
          const dx = n.x - mx;
          const dy = n.y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) lift = (1 - d / 160) * 0.9;
        }
        const r = n.r + lift * 1.4;
        const a = 0.22 + lift * 0.35;
        ctx.fillStyle = `rgba(${ink}, ${a})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // lifecycle pulse
      if (pulse && !reduced) {
        pulse.t += dt;
        const p = Math.min(1, pulse.t / pulse.duration);
        const a = nodes[pulse.a];
        const b = nodes[pulse.b];
        if (a && b) {
          // edge line
          ctx.strokeStyle = `rgba(${emeraldRgb()}, 0.22)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // packet
          const px = a.x + (b.x - a.x) * easeInOut(p);
          const py = a.y + (b.y - a.y) * easeInOut(p);
          const glow = ctx.createRadialGradient(px, py, 0, px, py, 18);
          glow.addColorStop(0, `rgba(${emeraldRgb()}, 0.55)`);
          glow.addColorStop(1, `rgba(${emeraldRgb()}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(px, py, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${emeraldRgb()}, 0.95)`;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (p >= 1) pulse = null;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(pulseTimer);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}

/* ============================================================
 * Reveal-on-scroll (progressive reveal — DIL-020)
 * ============================================================ */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 720ms var(--ease-out) ${delay}ms, transform 720ms var(--ease-out) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
 * Navigation — DIL-006 shared indicator underline
 * ============================================================ */
const NAV_ITEMS = [
  { id: "system", label: "System" },
  { id: "capabilities", label: "Capabilities" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "agents", label: "Agents" },
  { id: "philosophy", label: "Philosophy" },
];

function TopNav({
  theme,
  onToggleTheme,
  onOpenPalette,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenPalette?: () => void;
}) {
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number; visible: boolean }>({
    x: 0,
    w: 0,
    visible: false,
  });

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const parent = containerRef.current;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setIndicator({ x: r.left - pr.left, w: r.width, visible: true });
  };
  const onLeave = () => setIndicator((s) => ({ ...s, visible: false }));

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6"
        style={{
          backgroundColor: "color-mix(in oklab, var(--background) 72%, transparent)",
          backdropFilter: "saturate(140%) blur(12px)",
          borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
        }}
      >
        <Link to="/" className="group flex items-center gap-2.5">
          <LogoMark />
          <span className="text-ui tracking-tight text-foreground">IdeaGate</span>
          <span className="text-code hidden text-muted-foreground sm:inline">v0.1</span>
        </Link>

        <nav className="hidden md:block">
          <ul
            ref={containerRef}
            onMouseLeave={onLeave}
            className="relative flex items-center gap-1"
          >
            {NAV_ITEMS.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onMouseEnter={onEnter}
                  className="text-ui relative rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {n.label}
                </a>
              </li>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 h-px bg-foreground"
              style={{
                left: indicator.x + 12,
                width: Math.max(0, indicator.w - 24),
                opacity: indicator.visible ? 0.9 : 0,
                transform: "translateY(2px)",
                transition:
                  "left 280ms var(--ease-standard), width 280ms var(--ease-standard), opacity 200ms var(--ease-standard)",
              }}
            />
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="text-code hidden rounded-md border border-border px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>
          <button
            onClick={onOpenPalette}
            aria-label="Open command palette"
            className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            <span className="text-code">Search</span>
            <span className="kbd-key">⌘</span>
            <span className="kbd-key">K</span>
          </button>
          <Link
            to="/foundation"
            className="text-ui rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Foundation
          </Link>
          <a
            href="#cta"
            className="text-ui inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-1.5 text-primary-foreground transition-transform duration-200 hover:-translate-y-px"
          >
            Enter console
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span
      className="grid place-items-center"
      style={{ width: 22, height: 22 }}
      aria-hidden
    >
      <svg viewBox="0 0 22 22" width="22" height="22">
        <defs>
          <linearGradient id="ig-mark" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect x="1.25" y="1.25" width="19.5" height="19.5" rx="4.5" fill="none" stroke="currentColor" strokeOpacity="0.5" />
        <path
          d="M6 11 L10 11 M10 11 L10 6 M10 11 L14 15 M14 15 L16 15"
          stroke="url(#ig-mark)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="10" cy="11" r="1.6" fill="var(--accent)" />
      </svg>
    </span>
  );
}

/* ============================================================
 * Hero — editorial title + cursor-reactive letters (DIL-024 principle)
 * ============================================================ */
function Hero() {
  const title = "A calm operating system for product thinking.";
  const words = useMemo(() => title.split(" "), [title]);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const onMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };
  const onLeave = () => setMouse((m) => ({ ...m, active: false }));

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "min(92vh, 900px)" }}
    >
      {/* ambient background */}
      <div className="absolute inset-0" aria-hidden>
        <HeroAtmosphere />
        <ConstellationCanvas />
        {/* soft vignette top & bottom to blend into page */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background:
              "linear-gradient(to bottom, var(--background), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </div>

      <div
        ref={heroRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative mx-auto max-w-[1200px] px-6 pt-40 pb-28"
      >
        {/* status rail */}
        <Reveal>
          <div className="mb-10 flex items-center gap-3">
            <span className="status-rail">
              <span
                className="pulse-dot inline-block"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--operational)",
                }}
              />
              System nominal · lifecycle engine online
            </span>
            <span className="text-code text-muted-foreground hidden sm:inline">
              build 2026.07 · edge · us-west
            </span>
          </div>
        </Reveal>

        {/* Eyebrow */}
        <Reveal delay={60}>
          <div className="text-subheading mb-6">
            IdeaGate · Product Lifecycle OS
          </div>
        </Reveal>

        {/* Display title with letter parallax */}
        <h1
          className="text-display max-w-[18ch]"
          style={{ color: "var(--foreground)" }}
        >
          {words.map((w, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {Array.from(w).map((ch, ci) => (
                <ReactiveChar
                  key={ci}
                  ch={ch}
                  mouse={mouse}
                  containerRef={heroRef}
                  revealDelay={120 + wi * 40 + ci * 8}
                  italic={wi === 3 /* "operating" */ || wi === 6 /* "thinking." */}
                />
              ))}
              {wi < words.length - 1 ? <span>&nbsp;</span> : null}
            </span>
          ))}
        </h1>

        {/* Subcopy */}
        <Reveal delay={520}>
          <p className="text-body mt-8 max-w-[58ch] text-muted-foreground">
            IdeaGate turns raw product ideas into research, PRDs, architecture and
            prototypes — through a lifecycle-aware, multi-agent workspace built for
            teams who take their craft seriously.
          </p>
        </Reveal>

        {/* CTA row */}
        <Reveal delay={640}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <PremiumButton href="#cta" size="lg">
              <span
                aria-hidden
                className="pulse-dot inline-block"
                style={{ width: 6, height: 6, borderRadius: 999, background: "var(--operational)" }}
              />
              Enter console
              <span aria-hidden className="translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </PremiumButton>
            <a
              href="#capabilities"
              className="text-ui group inline-flex items-center gap-2 rounded-md border border-border bg-surface/40 px-5 py-2.5 text-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-muted hover:border-border-strong"
            >
              Read the system tour
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
            <div className="text-code ml-auto hidden items-center gap-2 text-muted-foreground md:flex">
              <span className="kbd-key">⌘</span>
              <span className="kbd-key">K</span>
              <span>to open the command palette</span>
            </div>
          </div>
        </Reveal>

        {/* Metric strip */}
        <Reveal delay={820}>
          <div
            className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border md:grid-cols-4"
            style={{ background: "var(--border)" }}
          >
            {[
              ["10", "Lifecycle stages"],
              ["6", "Coordinated agents"],
              ["100%", "Structured artifacts"],
              ["0", "Blank canvases"],
            ].map(([n, l]) => (
              <div
                key={l}
                className="flex flex-col gap-1 px-5 py-5"
                style={{ background: "var(--surface)" }}
              >
                <div className="text-heading-2" style={{ fontFamily: "var(--font-serif)" }}>
                  {n}
                </div>
                <div className="text-caption">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ReactiveChar({
  ch,
  mouse,
  containerRef,
  revealDelay,
  italic,
}: {
  ch: string;
  mouse: { x: number; y: number; active: boolean };
  containerRef: React.RefObject<HTMLDivElement | null>;
  revealDelay: number;
  italic?: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), revealDelay);
    return () => window.clearTimeout(id);
  }, [revealDelay]);

  useEffect(() => {
    if (!mouse.active) {
      setT({ x: 0, y: 0 });
      return;
    }
    const el = ref.current;
    const container = containerRef.current;
    if (!el || !container) return;
    const cr = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const cx = r.left - cr.left + r.width / 2;
    const cy = r.top - cr.top + r.height / 2;
    const dx = cx - mouse.x;
    const dy = cy - mouse.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const radius = 160;
    if (d > radius) {
      setT({ x: 0, y: 0 });
      return;
    }
    const f = (1 - d / radius) * 10; // px push
    setT({ x: (dx / (d || 1)) * f, y: (dy / (d || 1)) * f });
  }, [mouse, containerRef]);

  return (
    <span
      ref={ref}
      className="inline-block"
      style={{
        transform: `translate3d(${t.x}px, ${t.y + (revealed ? 0 : 12)}px, 0)`,
        opacity: revealed ? 1 : 0,
        transition:
          "transform 380ms var(--ease-out), opacity 620ms var(--ease-out)",
        fontStyle: italic ? "italic" : "normal",
        willChange: "transform, opacity",
      }}
    >
      {ch}
    </span>
  );
}

/* ============================================================
 * Section shell
 * ============================================================ */
function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  tone = "editorial",
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  tone?: "editorial" | "operational";
}) {
  return (
    <section
      id={id}
      className="relative"
      style={{
        background:
          tone === "operational" ? "var(--surface-op-sunken)" : "var(--background)",
        borderTop: tone === "operational" ? "1px solid var(--border-op)" : "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <Reveal>
          <div className="text-subheading mb-5">{eyebrow}</div>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="max-w-[22ch]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 3vw + 1rem, 3rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {title}
          </h2>
        </Reveal>
        {lede ? (
          <Reveal delay={160}>
            <p className="text-body mt-6 max-w-[62ch] text-muted-foreground">{lede}</p>
          </Reveal>
        ) : null}
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}

/* ============================================================
 * Capabilities — bento grid (OrbitAI principle)
 * ============================================================ */
type Capability = {
  code: string;
  name: string;
  role: string;
  detail: string;
  span?: "wide" | "tall" | "normal";
  render?: () => ReactNode;
};

const CAPABILITIES: Capability[] = [
  {
    code: "01",
    name: "Discovery",
    role: "Framing",
    detail: "Sharpens fuzzy ideas into a working problem statement, target user, and hypothesis.",
  },
  {
    code: "02",
    name: "Research",
    role: "Evidence",
    detail: "Synthesizes market, competitor, and signal research into a defensible position.",
  },
  {
    code: "03",
    name: "JTBD",
    role: "Motivation",
    detail: "Extracts jobs, forces of progress, and the emotional shape of the outcome.",
  },
  {
    code: "04",
    name: "Multi-agent execution",
    role: "Orchestration",
    detail:
      "A coordinator directs specialist agents — researcher, writer, critic, architect — through the lifecycle.",
    span: "wide",
    render: () => <AgentMiniGrid />,
  },
  {
    code: "05",
    name: "Architecture",
    role: "Structure",
    detail: "Maps entities, flows, and system boundaries before a single component is designed.",
  },
  {
    code: "06",
    name: "PRD",
    role: "Specification",
    detail: "Renders a living PRD — reviewable, versioned, and grounded in the artifacts above.",
  },
  {
    code: "07",
    name: "UX & journey",
    role: "Experience",
    detail: "Turns intent into flows, states, and end-to-end journeys with edge cases surfaced.",
  },
  {
    code: "08",
    name: "Prototype",
    role: "Materialization",
    detail: "Compiles the lifecycle into a working prototype scaffold ready to hand off.",
  },
];

function Capabilities() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {CAPABILITIES.map((c) => (
        <CapabilityCard key={c.code} c={c} />
      ))}
    </div>
  );
}

function CapabilityCard({ c }: { c: Capability }) {
  const [hover, setHover] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const spanClass =
    c.span === "wide" ? "md:col-span-2 md:row-span-2" : c.span === "tall" ? "md:row-span-2" : "";

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-border transition-all duration-300 ${spanClass}`}
      style={{
        background: "var(--surface-elevated)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-xs)",
        minHeight: c.span === "wide" ? 340 : 220,
      }}
    >
      {/* animated inner border */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          padding: 1,
          background: `radial-gradient(240px circle at ${glow.x}% ${glow.y}%, color-mix(in oklab, var(--operational) 40%, transparent), transparent 60%)`,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: hover ? 1 : 0,
          transition: "opacity 260ms var(--ease-standard)",
        }}
      />

      <div className="flex items-start justify-between p-5">
        <div className="text-code text-muted-foreground">{c.code}</div>
        <div className="text-code text-muted-foreground">{c.role}</div>
      </div>

      <div className="px-5">
        <div
          className="text-heading-3"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.5rem", lineHeight: 1.15 }}
        >
          {c.name}
        </div>
      </div>

      <div className="flex-1 px-5 pt-3">
        <p className="text-caption max-w-[46ch]">{c.detail}</p>
      </div>

      {c.render ? <div className="px-5 pb-5 pt-6">{c.render()}</div> : null}

      <div className="mt-auto flex items-center justify-between px-5 py-4">
        <div
          className="text-ui inline-flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-foreground"
        >
          Open module
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </div>
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: hover ? "var(--operational)" : "var(--border-strong)",
            transition: "background 200ms var(--ease-standard)",
          }}
        />
      </div>
    </div>
  );
}

function AgentMiniGrid() {
  const agents = [
    { name: "coordinator", state: "run", detail: "orchestrating", color: "var(--operational)", load: 0.92 },
    { name: "researcher", state: "run", detail: "gathering", color: "var(--info)", load: 0.68 },
    { name: "architect", state: "run", detail: "mapping", color: "var(--info)", load: 0.54 },
    { name: "writer", state: "queue", detail: "drafting", color: "var(--operational)", load: 0.32 },
    { name: "critic", state: "hold", detail: "reviewing", color: "var(--warning)", load: 0.18 },
    { name: "prototyper", state: "idle", detail: "awaiting", color: "var(--muted-foreground)", load: 0 },
  ];
  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-lg p-3 lg:grid-cols-3"
      style={{ background: "var(--surface-op)", border: "1px solid var(--border-op)" }}
    >
      {agents.map((a) => (
        <AgentChip key={a.name} {...a} />
      ))}
    </div>
  );
}

function AgentChip({
  name,
  state,
  detail,
  color,
  load,
}: {
  name: string;
  state: string;
  detail: string;
  color: string;
  load: number;
}) {
  const active = state === "run";
  return (
    <div
      className="group relative flex flex-col gap-1.5 overflow-hidden rounded-md px-3 py-2.5"
      style={{
        background: "var(--surface-op-elevated)",
        border: "1px solid var(--border-op)",
      }}
    >
      {active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            opacity: 0.7,
          }}
        />
      ) : null}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={active ? "pulse-dot inline-block" : "inline-block"}
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: color,
              boxShadow: active ? `0 0 8px ${color}` : "none",
            }}
          />
          <span className="text-code text-foreground">{name}</span>
        </div>
        <span
          className="text-code uppercase"
          style={{
            letterSpacing: "0.08em",
            fontSize: "0.625rem",
            color: active ? color : "var(--muted-foreground)",
          }}
        >
          {state}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-end gap-[2px]" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => {
            const on = i / 12 < load;
            return (
              <span
                key={i}
                style={{
                  width: 2,
                  height: on ? 4 + ((i * 37) % 6) : 3,
                  background: on ? color : "var(--border-op)",
                  opacity: on ? 0.75 : 1,
                  borderRadius: 1,
                }}
              />
            );
          })}
        </div>
        <span className="text-code text-muted-foreground" style={{ fontSize: "0.6875rem" }}>
          {detail}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
 * Lifecycle preview — horizontal, editorial timeline
 * ============================================================ */
const LIFECYCLE = [
  { stage: "01", label: "Idea intake" },
  { stage: "02", label: "Discovery" },
  { stage: "03", label: "Research" },
  { stage: "04", label: "JTBD" },
  { stage: "05", label: "Architecture" },
  { stage: "06", label: "PRD" },
  { stage: "07", label: "UX" },
  { stage: "08", label: "Journey" },
  { stage: "09", label: "Prototype" },
  { stage: "10", label: "Handoff" },
];

function LifecyclePreview() {
  const [active, setActive] = useState(4);
  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((v) => (v + 1) % LIFECYCLE.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-xl border p-6 md:p-8"
      style={{
        background: "var(--surface-op)",
        borderColor: "var(--border-op)",
      }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-code text-muted-foreground">lifecycle.stream</div>
        <div className="text-code text-muted-foreground flex items-center gap-2">
          <span
            className="pulse-dot inline-block"
            style={{ width: 6, height: 6, borderRadius: 999, background: "var(--operational)" }}
          />
          streaming
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 right-0 top-4 h-px"
          style={{ background: "var(--border-op)" }}
          aria-hidden
        />
        <div
          className="absolute left-0 top-4 h-px"
          style={{
            background: "var(--operational)",
            width: `${((active + 1) / LIFECYCLE.length) * 100}%`,
            transition: "width 720ms var(--ease-out)",
            boxShadow: "0 0 12px color-mix(in oklab, var(--operational) 60%, transparent)",
          }}
          aria-hidden
        />
        <ul className="relative grid grid-cols-5 gap-3 md:grid-cols-10">
          {LIFECYCLE.map((s, i) => {
            const done = i < active;
            const now = i === active;
            return (
              <li key={s.stage} className="flex flex-col items-center gap-2 text-center">
                <span
                  className="grid place-items-center rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    background:
                      now
                        ? "var(--operational)"
                        : done
                          ? "color-mix(in oklab, var(--operational) 40%, var(--surface-op-elevated))"
                          : "var(--surface-op-elevated)",
                    border: `1px solid ${now ? "var(--operational)" : "var(--border-op)"}`,
                    boxShadow: now
                      ? "0 0 0 4px color-mix(in oklab, var(--operational) 20%, transparent)"
                      : "none",
                    transition: "all 320ms var(--ease-standard)",
                  }}
                >
                  {now ? (
                    <span
                      className="pulse-dot inline-block"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: "var(--operational-foreground)",
                      }}
                    />
                  ) : null}
                </span>
                <div className="text-code text-muted-foreground">{s.stage}</div>
                <div
                  className="text-ui"
                  style={{
                    color: now ? "var(--foreground)" : "var(--muted-foreground)",
                    transition: "color 240ms var(--ease-standard)",
                  }}
                >
                  {s.label}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* execution log */}
      <div
        className="mt-8 rounded-md border p-4"
        style={{
          background: "var(--surface-op-sunken)",
          borderColor: "var(--border-op)",
        }}
      >
        <div className="log-line">
          <span className="text-muted-foreground">[coordinator]</span>{" "}
          stage <span style={{ color: "var(--foreground)" }}>{LIFECYCLE[active].label.toLowerCase()}</span>{" "}
          → dispatched to researcher, architect
        </div>
        <div className="log-line">
          <span className="text-muted-foreground">[researcher]</span>{" "}
          collected 14 signals · confidence 0.82
        </div>
        <div className="log-line">
          <span className="text-muted-foreground">[critic]</span>{" "}
          flagged 2 assumptions for review<span className="cli-caret ml-1" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Philosophy — editorial pull-quote
 * ============================================================ */
function Philosophy() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
      <div className="md:col-span-7">
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 1.6vw + 1rem, 2.25rem)",
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
          }}
        >
          Product work deserves a workspace that treats thinking as first-class:
          <span style={{ fontStyle: "italic", color: "var(--muted-foreground)" }}>
            {" "}structured, reviewable, alive.
          </span>{" "}
          IdeaGate is built for teams who prefer <em>precision</em> over volume,
          and <em>clarity</em> over ceremony.
        </p>
      </div>
      <div className="md:col-span-5">
        <ul className="space-y-5">
          {[
            ["Editorial by default", "Every artifact reads like a document that was written on purpose."],
            ["Lifecycle-aware", "Nothing exists outside the arc from idea to handoff."],
            ["Multi-agent, single voice", "Specialist agents coordinate; the workspace speaks with one tone."],
            ["Operational transparency", "Every decision, every source, every run — reviewable and reversible."],
          ].map(([t, d]) => (
            <li key={t} className="grid grid-cols-[auto_1fr] items-start gap-3">
              <span
                aria-hidden
                className="mt-2 inline-block h-px w-6"
                style={{ background: "var(--foreground)" }}
              />
              <div>
                <div className="text-ui text-foreground">{t}</div>
                <div className="text-caption mt-0.5">{d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
 * CTA + Footer
 * ============================================================ */
function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden">
      <div
        className="mx-auto max-w-[1200px] px-6 py-28 md:py-36"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="text-subheading mb-5">Begin</div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.25rem, 3.4vw + 1rem, 3.75rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.022em",
                fontWeight: 400,
              }}
              className="max-w-[20ch]"
            >
              Open a new console. <span style={{ fontStyle: "italic", color: "var(--muted-foreground)" }}>Bring the idea.</span>
            </h2>
            <p className="text-body mt-6 max-w-[54ch] text-muted-foreground">
              You focus on the intent. IdeaGate coordinates the lifecycle,
              the agents, and the artifacts around it.
            </p>
          </div>
          <div className="md:col-span-4">
            <div
              className="rounded-xl border p-5"
              style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
            >
              <div className="text-code text-muted-foreground mb-4">console.new</div>
              <PremiumButton href="#" size="lg" block>
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="pulse-dot inline-block"
                    style={{ width: 6, height: 6, borderRadius: 999, background: "var(--operational)" }}
                  />
                  Enter console
                </span>
                <span aria-hidden className="ml-auto transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </PremiumButton>
              <Link
                to="/foundation"
                className="text-ui mt-2 inline-flex w-full items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-foreground transition-colors hover:bg-muted"
              >
                <span>Review the foundation</span>
                <span aria-hidden>↗</span>
              </Link>
              <div className="text-code text-muted-foreground mt-4">
                no credit card · early preview · shape the roadmap
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: "var(--surface-op-sunken)",
        borderTop: "1px solid var(--border-op)",
      }}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 px-6 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-ui text-foreground">IdeaGate</span>
          </div>
          <p className="text-caption mt-4 max-w-[36ch]">
            The Product Lifecycle Operating System. Editorial workspace for AI-native
            product teams.
          </p>
          <div className="text-code text-muted-foreground mt-6 flex items-center gap-2">
            <span
              className="pulse-dot inline-block"
              style={{ width: 6, height: 6, borderRadius: 999, background: "var(--operational)" }}
            />
            all systems nominal
          </div>
        </div>

        {[
          ["System", ["Overview", "Lifecycle", "Agents", "Philosophy"]],
          ["Company", ["About", "Journal", "Careers", "Contact"]],
          ["Resources", ["Documentation", "Changelog", "Security", "Status"]],
        ].map(([title, items]) => (
          <div key={title as string}>
            <div className="text-subheading mb-4">{title}</div>
            <ul className="space-y-2">
              {(items as string[]).map((it) => (
                <li key={it}>
                  <a
                    href="#"
                    className="text-ui text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {it}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5"
        style={{ borderTop: "1px solid var(--border-op)" }}
      >
        <div className="text-code text-muted-foreground">© 2026 IdeaGate · Product Lifecycle OS</div>
        <div className="text-code text-muted-foreground hidden md:block">
          build 2026.07 · edge · us-west
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
 * Page
 * ============================================================ */
function LandingPage() {
  const { theme, setTheme } = useTheme("dark");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
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
    <div className="min-h-screen bg-background text-foreground">
      <TopNav
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <main>
        <Hero />

        <Section
          id="system"
          eyebrow="The system"
          title={
            <>
              An operating system for the arc from{" "}
              <em style={{ color: "var(--muted-foreground)" }}>idea to handoff.</em>
            </>
          }
          lede="IdeaGate is not a note-taking app or a chat wrapper. It's a workspace that treats the entire product lifecycle as a first-class object — with structured artifacts, reviewable decisions, and coordinated agents at every stage."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              ["Idea object", "Every idea becomes a durable, structured object — not a scratch note."],
              ["Lifecycle spine", "Ten stages, one continuous thread from raw intent to shipped prototype."],
              ["Coordinated agents", "Specialist agents coordinate under one voice, one workspace, one plan."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 90}>
                <div
                  className="h-full rounded-xl border p-6"
                  style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}
                >
                  <div className="text-code text-muted-foreground">0{i + 1}</div>
                  <div
                    className="mt-4"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.5rem",
                      lineHeight: 1.15,
                    }}
                  >
                    {t}
                  </div>
                  <p className="text-caption mt-3">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="capabilities"
          eyebrow="Capabilities"
          title={
            <>
              A set of living modules,{" "}
              <em style={{ color: "var(--muted-foreground)" }}>not a feature list.</em>
            </>
          }
          lede="Each module is a working part of the operating system — hover to see the operational surface underneath."
        >
          <Capabilities />
        </Section>

        <Section
          id="lifecycle"
          eyebrow="Lifecycle"
          tone="operational"
          title={
            <>
              Ten stages,{" "}
              <em style={{ color: "var(--muted-foreground)" }}>one continuous stream.</em>
            </>
          }
          lede="The lifecycle isn't a checklist — it's a live stream that agents advance in coordination while you review and steer."
        >
          <LifecyclePreview />
        </Section>

        <Section
          id="agents"
          eyebrow="Multi-agent"
          title={
            <>
              Specialist agents,{" "}
              <em style={{ color: "var(--muted-foreground)" }}>single workspace.</em>
            </>
          }
          lede="A coordinator orchestrates researcher, architect, writer, critic, and prototyper. Every action is logged, attributed, and reversible."
        >
          <AgentTheatre />
        </Section>

        <Section
          id="philosophy"
          eyebrow="Philosophy"
          title={
            <>
              Built for teams who take{" "}
              <em style={{ color: "var(--muted-foreground)" }}>the craft seriously.</em>
            </>
          }
        >
          <Philosophy />
        </Section>

        <CTA />
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
 * Agent theatre — a small live-feeling execution surface
 * ============================================================ */
function AgentTheatre() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1400);
    return () => window.clearInterval(id);
  }, []);

  const rows = [
    { agent: "coordinator", action: "planning stage: architecture", state: "run", color: "var(--operational)" },
    { agent: "researcher", action: "gathering competitor patterns", state: "run", color: "var(--info)" },
    { agent: "architect", action: "mapping entities · 12 nodes", state: "run", color: "var(--info)" },
    { agent: "writer", action: "drafting PRD § 3.2", state: "queue", color: "var(--muted-foreground)" },
    { agent: "critic", action: "awaiting draft", state: "idle", color: "var(--muted-foreground)" },
    { agent: "prototyper", action: "awaiting spec", state: "idle", color: "var(--muted-foreground)" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div
        className="rounded-xl border md:col-span-7"
        style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}
      >
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border-op)" }}>
          <div className="text-code text-muted-foreground">agents.orchestration</div>
          <div className="text-code text-muted-foreground">6 active · 0 failed</div>
        </div>
        <ul>
          {rows.map((r, i) => (
            <li
              key={r.agent}
              className="grid grid-cols-[auto_140px_1fr_auto] items-center gap-4 px-5 py-3"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-op)" }}
            >
              <span
                className="pulse-dot inline-block"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: r.color,
                  animationDelay: `${i * 120}ms`,
                }}
              />
              <span className="text-code text-foreground">{r.agent}</span>
              <span className="text-caption">{r.action}</span>
              <span
                className="text-code text-muted-foreground uppercase tracking-wider"
                style={{ letterSpacing: "0.06em" }}
              >
                {r.state}
              </span>
            </li>
          ))}
        </ul>
        <div className="execution-bar h-1 w-full">
          <div className="execution-bar-scan h-full" />
        </div>
      </div>

      <div
        className="rounded-xl border md:col-span-5"
        style={{ background: "var(--surface-op-sunken)", borderColor: "var(--border-op)" }}
      >
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border-op)" }}>
          <div className="text-code text-muted-foreground">stream.log</div>
          <div className="text-code text-muted-foreground">t+{String(tick).padStart(3, "0")}s</div>
        </div>
        <div className="p-5 space-y-1.5">
          <div className="log-line">
            <span className="text-muted-foreground">14:02:11</span> coordinator → dispatched(architecture)
          </div>
          <div className="log-line">
            <span className="text-muted-foreground">14:02:12</span> researcher.ok · signals=14 conf=0.82
          </div>
          <div className="log-line">
            <span className="text-muted-foreground">14:02:14</span> architect.map · nodes=12 edges=27
          </div>
          <div className="log-line">
            <span className="text-muted-foreground">14:02:16</span> critic.flag · assumption("cold-start scope")
          </div>
          <div className="log-line">
            <span className="text-muted-foreground">14:02:18</span> coordinator.hold · awaiting review<span className="cli-caret ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}