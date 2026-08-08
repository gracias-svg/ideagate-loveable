import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, PauseCircle, RotateCcw, Sparkles } from "lucide-react";
import type { OrchestrationEvent, RunStatus } from "@/lib/orchestration";

/* ═══════════════════════════════════════════════════════════════════════
 *  ORCHESTRATION STREAM — the single AI activity surface for IdeaGate.
 *
 *  Used by every place where agents do work: Desk lifecycle generation,
 *  Studio artifact improvement, document rewriting, diagram generation.
 *  It is purely presentational: it renders whatever events it is given.
 *
 *  Backend mapping:
 *    events[]  → journey_events / agent_runs stream
 *    status    → journey_runs.status
 * ═══════════════════════════════════════════════════════════════════════ */

const COLLAPSED_ROWS = 5;

export function OrchestrationStream({
  events,
  status,
  elapsed,
  completeLabel = "Lifecycle complete",
  className,
  defaultExpanded = true,
}: {
  events: OrchestrationEvent[];
  status: RunStatus;
  elapsed?: number;
  completeLabel?: string;
  className?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const complete = status === "complete";

  const active = complete ? undefined : events[events.length - 1];
  /* history: newest first, sitting directly under the live row */
  const history = (complete ? events : events.slice(0, -1)).slice().reverse();
  const visible = expanded ? history.slice(0, 24) : history.slice(0, COLLAPSED_ROWS);

  const headline = complete
    ? completeLabel
    : status === "paused"
      ? `${active?.action ?? "Work"} — paused`
      : `${active?.action ?? "Preparing the workspace"}...`;

  return (
    <section
      className={`orch-card-in overflow-hidden rounded-2xl border backdrop-blur-xl ${className ?? ""}`}
      style={{
        borderColor: complete
          ? "color-mix(in oklab, var(--operational) 26%, var(--border-op))"
          : "var(--border-op)",
        background: "color-mix(in oklab, var(--surface-op-elevated) 88%, transparent)",
        boxShadow: "0 24px 60px -38px rgba(0,0,0,0.85), inset 0 1px 0 color-mix(in oklab, white 6%, transparent)",
      }}
      aria-live="polite"
    >
      {/* ── HEADER — the live operation ───────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
        style={{ background: "transparent" }}
      >
        <StatusGlyph status={status} kind={active?.kind} />

        <span className="min-w-0 flex-1">
          <span
            className={`block truncate ${status === "running" ? "text-shimmer-fast" : ""}`}
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: status === "running" ? undefined : complete ? "var(--operational)" : "var(--warning)",
            }}
          >
            {headline}
          </span>
          {active?.actor && !complete ? (
            <span className="mt-0.5 block truncate text-code" style={{ fontSize: 10.5, color: "var(--muted-foreground)", opacity: 0.7 }}>
              {active.actor}
              {active.detail ? ` · ${active.detail}` : ""}
            </span>
          ) : null}
        </span>

        {typeof elapsed === "number" ? (
          <span className="text-code shrink-0 tabular-nums" style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>
            {complete ? "done" : fmt(elapsed)}
          </span>
        ) : null}

        {history.length ? (
          <ChevronDown
            size={14}
            className="shrink-0"
            style={{
              color: "var(--muted-foreground)",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 220ms var(--ease-out)",
            }}
          />
        ) : null}
      </button>

      {/* ── BODY — chronological history, newest closest to the live row ─ */}
      <Collapsible open={expanded && history.length > 0}>
        <div className="border-t px-2 pb-2 pt-1.5" style={{ borderColor: "var(--border-op)" }}>
          <ul
            className="flex flex-col overflow-y-auto"
            style={{
              maxHeight: 232,
              maskImage: history.length > COLLAPSED_ROWS ? "linear-gradient(to bottom, black 62%, transparent 100%)" : undefined,
              WebkitMaskImage: history.length > COLLAPSED_ROWS ? "linear-gradient(to bottom, black 62%, transparent 100%)" : undefined,
            }}
          >
            {visible.map((e, i) => (
              <HistoryRow key={e.id} event={e} depth={i} />
            ))}
          </ul>
        </div>
      </Collapsible>
    </section>
  );
}

/** Smooth height animation without layout jump. */
function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      style={{
        height: open ? h : 0,
        overflow: "hidden",
        opacity: open ? 1 : 0,
        transition: "height 300ms var(--ease-out), opacity 220ms var(--ease-out)",
      }}
    >
      <div ref={inner}>{children}</div>
    </div>
  );
}

function HistoryRow({ event, depth }: { event: OrchestrationEvent; depth: number }) {
  const fade = Math.max(0.28, 1 - depth * 0.16);
  return (
    <li
      className="orch-row-in flex shrink-0 items-start gap-2.5 rounded-lg px-2.5 py-[7px]"
      style={{ opacity: fade, transition: "opacity 300ms var(--ease-out)" }}
    >
      {event.kind === "retry" ? (
        <RotateCcw size={12} className="mt-[3px] shrink-0" style={{ color: "var(--warning)" }} />
      ) : (
        <span className="mt-[2px] grid h-[14px] w-[14px] shrink-0 place-items-center rounded-full" style={{ background: "color-mix(in oklab, var(--operational) 22%, transparent)" }}>
          <Check size={9} strokeWidth={3} style={{ color: "var(--operational)" }} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate" style={{ fontSize: 12.5, color: "var(--foreground)" }}>
          {event.actor}
        </span>
        <span className="block truncate" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {event.action}
        </span>
      </span>
    </li>
  );
}

function StatusGlyph({ status, kind }: { status: RunStatus; kind?: OrchestrationEvent["kind"] }) {
  if (status === "complete")
    return (
      <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full" style={{ background: "var(--operational)" }}>
        <Check size={11} strokeWidth={3} style={{ color: "#0a1a12" }} />
      </span>
    );
  if (status === "paused" || kind === "interrupted")
    return <PauseCircle size={16} className="shrink-0" style={{ color: "var(--warning)" }} />;
  return (
    <span className="relative grid h-[18px] w-[18px] shrink-0 place-items-center">
      <Loader2 size={16} className="orch-spin" style={{ color: "var(--operational)" }} />
      <Sparkles size={7} className="absolute" style={{ color: "var(--operational)" }} />
    </span>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Floating variant — same card, docked bottom-centre over any surface. */
export function FloatingOrchestrationStream(props: Parameters<typeof OrchestrationStream>[0]) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="pointer-events-auto w-full" style={{ maxWidth: 460 }}>
        <OrchestrationStream {...props} />
      </div>
    </div>
  );
}
