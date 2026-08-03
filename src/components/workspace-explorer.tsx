import { useLayoutEffect, useRef, useState } from "react";
import {
  ARTIFACTS, HEALTH_COLOR, HISTORY, PHASES, PROJECT_NAME,
  healthOf, phaseOf, type Artifact,
} from "@/lib/desk-data";

/* ═══════════════════════════════════════════════════════════════════════
 *  WORKSPACE EXPLORER → workspace filesystem
 *    Journey            → journey_runs.name
 *    Documents/<Phase>  → workspace/<project>/documents/<phase>/*.md
 *    History            → journey_events
 *    Knowledge/Assets/Decision Log/Snapshots/Exports → not yet backed
 *
 *  One component. Desk and Studio both mount it; only `activeId` differs.
 * ════════════════════════════════════════════════════════════════════ */

const SPRING = "cubic-bezier(0.22, 1.12, 0.36, 1)"; // stiffness ~300, damping ~30

type Row =
  | { kind: "section"; id: string; label: string }
  | { kind: "folder"; id: string; label: string; count: number; depth: number }
  | { kind: "file"; id: string; label: string; artifact: Artifact; depth: number }
  | { kind: "locked"; id: string; label: string; depth: number }
  | { kind: "event"; id: string; label: string; detail: string; ago: string; depth: number };

export function WorkspaceExplorer({
  activeId,
  onSelect,
  journeyName = PROJECT_NAME,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  journeyName?: string;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({
    Documents: true, History: true,
    ...Object.fromEntries(PHASES.map((p) => [p, p === "Discover" || p === "Decide"])),
  }));
  const [hovered, setHovered] = useState<string | null>(null);
  const [rect, setRect] = useState<{ top: number; height: number } | null>(null);
  const [ready, setReady] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLElement | null>>({});

  const target = hovered ?? activeId;

  useLayoutEffect(() => {
    const el = target ? rowRefs.current[target] : null;
    const host = listRef.current;
    if (!el || !host) { setRect(null); return; }
    const a = el.getBoundingClientRect();
    const b = host.getBoundingClientRect();
    setRect({ top: a.top - b.top + host.scrollTop, height: a.height });
    setReady(true);
  }, [target, open]);

  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));
  const bind = (id: string) => ({
    ref: (n: HTMLElement | null) => { rowRefs.current[id] = n; },
    onMouseEnter: () => setHovered(id),
  });

  return (
    <aside
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[240px] shrink-0 flex-col border-r md:flex"
      style={{ background: "color-mix(in oklab, var(--surface-op-sunken) 55%, transparent)", borderColor: "var(--border-op)" }}
      aria-label="Workspace explorer"
    >
      <div className="px-4 pb-2 pt-4">
        <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>workspace</div>
        <div className="text-ui mt-0.5 text-foreground" style={{ fontSize: 13 }}>{journeyName}</div>
      </div>

      <div
        ref={listRef}
        onMouseLeave={() => setHovered(null)}
        className="relative flex-1 overflow-y-auto px-2 pb-6"
      >
        {/* ONE shared highlight — glides and resizes between rows */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-2 right-2 rounded-md"
          style={{
            top: 0,
            height: rect?.height ?? 0,
            transform: `translateY(${rect?.top ?? 0}px)`,
            opacity: rect ? 1 : 0,
            background: target === activeId && target
              ? "color-mix(in oklab, var(--operational) 13%, transparent)"
              : "color-mix(in oklab, var(--foreground) 6%, transparent)",
            boxShadow: target === activeId && target
              ? "inset 0 0 0 1px color-mix(in oklab, var(--operational) 30%, transparent)"
              : "none",
            transition: ready
              ? "transform 120ms cubic-bezier(0.32,0.72,0,1), height 120ms cubic-bezier(0.32,0.72,0,1), opacity 120ms ease-out, background 120ms ease-out"
              : "none",
          }}
        />

        {/* Journey */}
        <SectionLabel>journey</SectionLabel>
        <Row {...bind("journey")} depth={0}>
          <Glyph kind="journey" />
          <span className="truncate text-ui" style={{ fontSize: 12, color: "var(--foreground)" }}>{journeyName} · run 01</span>
          <span className="pulse-dot ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />
        </Row>

        {/* Documents */}
        <SectionLabel>documents</SectionLabel>
        {PHASES.map((phase) => {
          const files = ARTIFACTS.filter((a) => phaseOf(a.stage) === phase);
          const isOpen = !!open[phase];
          return (
            <div key={phase}>
              <Row {...bind(`folder-${phase}`)} depth={0} onClick={() => toggle(phase)}>
                <Chevron open={isOpen} />
                <Glyph kind={isOpen ? "folder-open" : "folder"} />
                <span className="truncate text-ui" style={{ fontSize: 12, color: "var(--foreground)" }}>{phase}</span>
                <span className="text-code ml-auto tabular-nums text-muted-foreground" style={{ fontSize: 10, opacity: 0.6 }}>{files.length}</span>
              </Row>
              <div
                className="grid overflow-hidden"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", transition: `grid-template-rows 320ms ${SPRING}` }}
              >
                <div className="min-h-0">
                  {files.map((a) => {
                    const health = healthOf(a);
                    return (
                      <Row key={a.id} {...bind(a.id)} depth={1} onClick={() => onSelect(a.id)} active={activeId === a.id}>
                        <Glyph kind="file" />
                        <span className="truncate text-ui" style={{ fontSize: 12, color: activeId === a.id ? "var(--foreground)" : "var(--muted-foreground)" }}>{a.name}</span>
                        <span className="ml-auto inline-block h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: HEALTH_COLOR[health] }} title={health} />
                      </Row>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Not-yet-backed sections */}
        <SectionLabel>context</SectionLabel>
        {["Knowledge", "Assets", "Decision Log"].map((l) => (
          <LockedRow key={l} label={l} {...bind(`locked-${l}`)} />
        ))}

        {/* History → journey_events */}
        <SectionLabel>history</SectionLabel>
        <Row {...bind("folder-History")} depth={0} onClick={() => toggle("History")}>
          <Chevron open={!!open.History} />
          <Glyph kind={open.History ? "folder-open" : "folder"} />
          <span className="truncate text-ui" style={{ fontSize: 12, color: "var(--foreground)" }}>Recent activity</span>
          <span className="text-code ml-auto tabular-nums text-muted-foreground" style={{ fontSize: 10, opacity: 0.6 }}>{HISTORY.length}</span>
        </Row>
        <div className="grid overflow-hidden" style={{ gridTemplateRows: open.History ? "1fr" : "0fr", transition: `grid-template-rows 320ms ${SPRING}` }}>
          <div className="min-h-0">
            {HISTORY.map((h) => (
              <Row key={h.id} {...bind(h.id)} depth={1}>
                <Glyph kind="event" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ui" style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>{h.label}</span>
                  <span className="text-code block truncate text-muted-foreground" style={{ fontSize: 9.5, opacity: 0.55 }}>{h.detail}</span>
                </span>
                <span className="text-code ml-auto shrink-0 text-muted-foreground tabular-nums" style={{ fontSize: 9.5, opacity: 0.5 }}>{h.ago}</span>
              </Row>
            ))}
          </div>
        </div>

        <SectionLabel>output</SectionLabel>
        {["Snapshots", "Exports"].map((l) => (
          <LockedRow key={l} label={l} {...bind(`locked-${l}`)} />
        ))}
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-label px-2 pb-1 pt-4 text-muted-foreground" style={{ fontSize: 9.5, opacity: 0.55 }}>{children}</div>;
}

const Row = ({
  children, depth, onClick, active, ...rest
}: {
  children: React.ReactNode; depth: number; onClick?: () => void; active?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> & { ref?: (n: HTMLElement | null) => void }) => (
  <div
    {...rest}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    aria-current={active ? "true" : undefined}
    className={`relative z-10 flex items-center gap-2 rounded-md py-[5px] pr-2 outline-none ${onClick ? "cursor-pointer" : ""}`}
    style={{ paddingLeft: 8 + depth * 14 }}
  >
    {children}
  </div>
);

function LockedRow({ label, ...rest }: { label: string } & Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">) {
  return (
    <Row {...rest} depth={0}>
      <Glyph kind="lock" />
      <span className="truncate text-ui" style={{ fontSize: 12, color: "var(--muted-foreground)", opacity: 0.45 }}>{label}</span>
      <span className="text-code ml-auto shrink-0 text-muted-foreground" style={{ fontSize: 9, opacity: 0.35 }}>coming soon</span>
    </Row>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="shrink-0 text-muted-foreground"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: `transform 280ms ${SPRING}` }}>
      <path d="M4.5 3l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Glyph({ kind }: { kind: "file" | "folder" | "folder-open" | "journey" | "lock" | "event" }) {
  const s = { width: 13, height: 13, viewBox: "0 0 16 16", fill: "none" as const, className: "shrink-0 text-muted-foreground", style: { opacity: 0.7 } };
  if (kind === "file")
    return <svg {...s}><path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
  if (kind === "folder")
    return <svg {...s}><path d="M2 4.5A1.5 1.5 0 013.5 3h2.2l1.2 1.5h5.6A1.5 1.5 0 0114 6v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
  if (kind === "folder-open")
    return <svg {...s} style={{ opacity: 0.9, color: "var(--operational)" }}><path d="M2 5A1.5 1.5 0 013.5 3.5h2.2L7 5h5.5A1.5 1.5 0 0114 6.5v.5H4.4L2 13V5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="M4.4 7H15l-2.2 6H3l1.4-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
  if (kind === "journey")
    return <svg {...s} style={{ color: "var(--operational)", opacity: 0.9 }}><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" /><circle cx="8" cy="8" r="1.8" fill="currentColor" /></svg>;
  if (kind === "event")
    return <svg {...s} style={{ opacity: 0.4 }}><path d="M8 3v5l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" /></svg>;
  return <svg {...s} style={{ opacity: 0.35 }}><rect x="3.5" y="7" width="9" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.2" /><path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.2" /></svg>;
}
