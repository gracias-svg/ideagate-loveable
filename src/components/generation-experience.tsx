import { useState } from "react";
import { PRODUCT_IDEA } from "@/lib/desk-data";
import { OrchestrationStream } from "@/components/orchestration-stream";
import { LIFECYCLE_SCRIPT, useOrchestrationRun } from "@/lib/orchestration";

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
  const { events, elapsed } = useOrchestrationRun(LIFECYCLE_SCRIPT, { status: state, intervalMs: 2600, loop: true });

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
              ? "Every lifecycle step complete"
              : `Now working on ${LIFECYCLE_STAGES[current]}`}
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

        {/* LAYER 3 — the universal orchestration stream → journey_events */}
        <OrchestrationStream
          className="mt-4"
          events={events}
          status={state}
          elapsed={elapsed}
          completeLabel="Lifecycle complete"
        />

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
