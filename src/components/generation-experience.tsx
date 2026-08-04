import { useEffect, useRef, useState } from "react";
import { PRODUCT_IDEA } from "@/lib/desk-data";

/* ═══════════════════════════════════════════════════════════════
 *  GENERATION EXPERIENCE — Studio center during an active run.
 *
 *  Backend mapping:
 *    IdeaHeader     → journey_runs.idea / journey_runs.current_stage
 *    StageList      → journey_stages[] (status, completed_at)
 *    ToolGroup      → agent_runs.tool_calls (streamed)
 * ══════════════════════════════════════════════════════════════ */

export const LIFECYCLE_STAGES = [
  "Idea Intake", "Discovery", "Problem Definition", "Solution Design",
  "MVP Hypothesis", "Validation", "Prioritization", "PRD",
  "UX Design", "Usability Planning", "Architecture", "Backlog & Release",
  "Implementation", "QA & Readiness", "Prototype Prompt",
];

const AGO = ["3m ago", "3m ago", "2m ago", "2m ago", "2m ago", "1m ago", "1m ago", "45s ago", "30s ago", "22s ago", "18s ago", "12s ago", "9s ago", "5s ago", "2s ago"];

const TOOL_FEED = [
  { icon: "📄", text: "Reading PRD artifact" },
  { icon: "🔍", text: "Analysing user journey requirements" },
  { icon: "✏", text: "Generating UX specification" },
  { icon: "📄", text: "Reading Problem Definition" },
  { icon: "🔍", text: "Reviewing validation findings" },
  { icon: "✏", text: "Drafting interaction patterns" },
];

export type RunState = "running" | "complete" | "paused";

export function GenerationExperience({
  current = 8,
  state = "running",
  onOpenLibrary,
}: {
  current?: number;
  state?: RunState;
  onOpenLibrary?: () => void;
}) {
  const done = state === "complete" ? LIFECYCLE_STAGES.length : current;
  const pct = Math.round((done / LIFECYCLE_STAGES.length) * 100);
  const [listOpen, setListOpen] = useState(true);

  return (
    <main className="relative min-w-0 flex-1 overflow-y-auto px-8 py-12" style={{ maxHeight: "calc(100vh - 3.5rem)" }}>
      <div className="mx-auto w-full" style={{ maxWidth: 580 }}>
        {/* LAYER 1 — idea header → journey_runs */}
        <header className="text-center">
          <h1 style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.45, color: "var(--muted-foreground)" }}>
            {PRODUCT_IDEA}
          </h1>
          <div className="text-code mt-2" style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>
            {state === "complete"
              ? `Stage 15 of 15 · Complete`
              : `Stage ${current + 1} of 15 · ${LIFECYCLE_STAGES[current]}`}
          </div>
        </header>

        {/* LAYER 2 — lifecycle task list → journey_stages */}
        <section className="mt-10 rounded-xl border" style={{ borderColor: "var(--border-op)", background: "var(--surface-op)" }}>
          <button
            onClick={() => setListOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 pb-3 pt-4 text-left"
          >
            <span className="text-ui text-foreground" style={{ fontSize: 13.5 }}>
              {state === "complete" ? "Product built · 15 of 15 stages complete" : `Building your product · ${done} of 15 stages complete`}
            </span>
            <span className="text-code text-muted-foreground" style={{ fontSize: 11, transform: listOpen ? "rotate(90deg)" : "none", transition: "transform 150ms var(--ease-out)" }}>›</span>
          </button>
          <div className="px-5 pb-3">
            <div className="h-[3px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--operational)", transition: "width 400ms var(--ease-out)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateRows: listOpen ? "1fr" : "0fr", transition: "grid-template-rows 240ms var(--ease-out)" }}>
            <ul className="overflow-hidden px-2 pb-3">
              {LIFECYCLE_STAGES.map((s, i) => {
                const st = state === "complete" || i < current ? "done" : i === current ? (state === "paused" ? "paused" : "active") : "pending";
                return <StageRow key={s} name={s} state={st} ago={AGO[i]} />;
              })}
            </ul>
          </div>
        </section>

        {/* LAYER 3 — agent tool group → agent_runs.tool_calls */}
        <ToolGroup state={state} />

        {state === "complete" ? (
          <button
            onClick={onOpenLibrary}
            className="mt-6 w-full rounded-lg py-2.5 font-medium transition-transform duration-150 hover:-translate-y-px"
            style={{ background: "var(--operational)", color: "#0a1a12", fontSize: 14 }}
          >
            Open artifact library →
          </button>
        ) : null}
      </div>
    </main>
  );
}

function StageRow({ name, state, ago }: { name: string; state: string; ago: string }) {
  const active = state === "active" || state === "paused";
  const accent = state === "paused" ? "var(--warning)" : "var(--operational)";
  return (
    <li
      className="relative flex items-center gap-3 rounded-md px-3 py-[7px]"
      style={{
        background: active ? "color-mix(in oklab, var(--foreground) 5%, transparent)" : "transparent",
        borderLeft: active ? `1px solid ${accent}` : "1px solid transparent",
      }}
    >
      {state === "done" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
          <circle cx="7" cy="7" r="7" fill="var(--operational)" />
          <path d="M4 7.2l2 2 4-4.2" stroke="#0a1a12" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : active ? (
        <span className="pulse-dot inline-block h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: accent }} />
      ) : (
        <span className="inline-block h-[11px] w-[11px] shrink-0 rounded-full border" style={{ borderColor: "color-mix(in oklab, var(--muted-foreground) 55%, transparent)" }} />
      )}

      <span
        className={active && state !== "paused" ? "text-shimmer flex-1 truncate" : "flex-1 truncate"}
        style={{
          fontSize: 13.5,
          color: state === "done" ? "var(--muted-foreground)" : state === "pending" ? "color-mix(in oklab, var(--muted-foreground) 70%, transparent)" : "var(--foreground)",
          opacity: state === "done" ? 0.75 : 1,
        }}
      >
        {name}
      </span>

      {state === "done" ? (
        <span className="text-code shrink-0" style={{ fontSize: 10.5, color: "var(--muted-foreground)", opacity: 0.5 }}>{ago}</span>
      ) : null}
    </li>
  );
}

function ToolGroup({ state }: { state: RunState }) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(3);
  const [secs, setSecs] = useState(42);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state !== "running") return;
    timer.current = setInterval(() => {
      setSecs((s) => s + 1);
      setN((v) => (v % TOOL_FEED.length) + 1);
    }, 2600);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [state]);

  const visible = TOOL_FEED.slice(0, n).slice(-4).reverse();
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");

  const header =
    state === "complete" ? "Lifecycle complete · All 15 artifacts ready"
    : state === "paused" ? "UX Agent · Generation paused"
    : "UX Agent · Designing flows";

  return (
    <section className="mt-4 rounded-xl border" style={{ borderColor: "var(--border-op)", background: "var(--surface-op)" }}>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 px-5 py-3.5 text-left">
        {state === "complete" ? (
          <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
            <circle cx="7" cy="7" r="7" fill="var(--operational)" />
            <path d="M4 7.2l2 2 4-4.2" stroke="#0a1a12" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span style={{ color: state === "paused" ? "var(--warning)" : "var(--operational)", fontSize: 12 }}>✦</span>
        )}
        <span className={state === "running" ? "text-shimmer flex-1 truncate" : "flex-1 truncate"} style={{ fontSize: 13.5, color: state === "paused" ? "var(--warning)" : "var(--foreground)" }}>
          {header}
        </span>
        {state === "running" ? (
          <span className="text-code shrink-0" style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>{mm}:{ss}</span>
        ) : state === "complete" ? (
          <span className="text-code shrink-0" style={{ fontSize: 11, color: "var(--operational)", opacity: 0.8 }}>UX Design complete</span>
        ) : null}
        <span className="text-code shrink-0 text-muted-foreground" style={{ fontSize: 11, transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms var(--ease-out)" }}>›</span>
      </button>

      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 200ms var(--ease-out)" }}>
        <div className="overflow-hidden">
          <ul className="space-y-0.5 border-t px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
            {visible.map((t, i) => (
              <li
                key={t.text}
                className="tool-enter flex items-center gap-2.5 rounded-md px-2 py-1.5"
                style={{ opacity: 1 - i * 0.22 }}
              >
                <span style={{ fontSize: 11 }}>{t.icon}</span>
                <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>{t.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
