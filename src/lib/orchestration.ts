import { useEffect, useMemo, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
 *  ORCHESTRATION EVENT MODEL  (presentation-agnostic)
 *
 *  The card never owns orchestration logic. Any producer — the lifecycle
 *  runner, a Studio improvement run, a future refinement — emits these
 *  events and the same component renders them.
 *
 *  Backend mapping:
 *    OrchestrationEvent   → journey_events / agent_runs stream row
 *    event.actor          → agent_runs.agent (display name, never a code)
 *    event.action         → agent_runs.intent (human sentence)
 *    event.kind           → journey_events.type
 *    RunStatus            → journey_runs.status
 * ═══════════════════════════════════════════════════════════════════════ */

export type OrchestrationEventKind =
  | "started"        // agent picked up work        → agent_runs.started_at
  | "completed"      // agent finished a unit       → agent_runs.finished_at
  | "stage"          // lifecycle moved forward     → journey_stages.current
  | "retry"          // agent retried               → agent_runs.retry_count
  | "interrupted"    // human or system paused it   → journey_runs.paused_at
  | "finished";      // whole run done              → journey_runs.completed_at

export type OrchestrationEvent = {
  id: string;
  kind: OrchestrationEventKind;
  /** Display name of who is working — "Research", "Product Strategy", … */
  actor: string;
  /** What is happening, written as a product sentence, never machine state. */
  action: string;
  /** Optional second line — the artifact or object being worked on. */
  detail?: string;
  at?: number;
};

export type RunStatus = "idle" | "running" | "paused" | "complete";

/* ── Scripts: placeholder producers. Swap for a real event source later. ── */

export type ScriptStep = Omit<OrchestrationEvent, "id" | "kind" | "at">;

/** → journey_stages[] — the 15-stage product lifecycle. */
export const LIFECYCLE_SCRIPT: ScriptStep[] = [
  { actor: "Coordinator", action: "Framing the idea into a product brief", detail: "Idea intake" },
  { actor: "Research", action: "Reading the competitor landscape", detail: "Discovery" },
  { actor: "Research", action: "Clustering user pain into themes", detail: "Problem definition" },
  { actor: "Product Strategy", action: "Shaping candidate solutions", detail: "Solution design" },
  { actor: "Product Strategy", action: "Defining MVP scope", detail: "MVP hypothesis" },
  { actor: "Research", action: "Testing assumptions against evidence", detail: "Validation" },
  { actor: "Product Strategy", action: "Running RICE prioritization", detail: "Prioritization" },
  { actor: "Product Strategy", action: "Writing the Product Requirements Document", detail: "PRD v1" },
  { actor: "UX Designer", action: "Designing interaction flows", detail: "UX design" },
  { actor: "UX Designer", action: "Planning usability checks", detail: "Usability plan" },
  { actor: "Architect", action: "Generating system architecture", detail: "Architecture" },
  { actor: "Architect", action: "Cutting the backlog into releases", detail: "Backlog & release" },
  { actor: "Coordinator", action: "Sequencing implementation work", detail: "Implementation" },
  { actor: "QA", action: "Validating artifact quality", detail: "QA & readiness" },
  { actor: "Coordinator", action: "Preparing the prototype prompt", detail: "Prototype prompt" },
];

/** → agent_runs — a single-artifact improvement run inside Studio. */
export const IMPROVEMENT_SCRIPT: ScriptStep[] = [
  { actor: "Research", action: "Re-reading supporting evidence", detail: "Sources refreshed" },
  { actor: "Product Strategy", action: "Tightening the requirement language", detail: "Section rewrite" },
  { actor: "UX Designer", action: "Aligning flows with the new scope", detail: "Flow diagram" },
  { actor: "Architect", action: "Checking technical feasibility", detail: "Constraints" },
  { actor: "QA", action: "Scoring the revised draft", detail: "Quality gate" },
];

/* ── Driver hook: turns a script into a live event stream. ────────────── */

export function useOrchestrationRun(
  script: ScriptStep[],
  { status, intervalMs = 2600, loop = false }: { status: RunStatus; intervalMs?: number; loop?: boolean },
) {
  const [cursor, setCursor] = useState(0);
  const started = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== "running") return;
    if (started.current === null) started.current = Date.now();
    const t = setInterval(() => {
      setCursor((c) => (loop ? c + 1 : Math.min(c + 1, script.length - 1)));
    }, intervalMs);
    return () => clearInterval(t);
  }, [status, intervalMs, loop, script.length]);

  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => {
      setElapsed(started.current ? Math.floor((Date.now() - started.current) / 1000) : 0);
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const events = useMemo<OrchestrationEvent[]>(() => {
    if (status === "complete") {
      return script.map((s, i) => ({ ...s, id: `e-${i}`, kind: "completed" as const }));
    }
    const upto = Math.min(cursor, loop ? Number.MAX_SAFE_INTEGER : script.length - 1);
    const out: OrchestrationEvent[] = [];
    for (let i = 0; i <= upto; i++) {
      const step = script[i % script.length];
      out.push({
        ...step,
        id: `e-${i}`,
        kind: i === upto ? (status === "paused" ? "interrupted" : "started") : "completed",
      });
    }
    return out;
  }, [cursor, script, status, loop]);

  return { events, elapsed };
}
