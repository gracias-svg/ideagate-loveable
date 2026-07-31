import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AGENTS, ARTIFACTS, CATEGORY_COLOR, CONFIDENCE_SCORE, MODELS,
  PROJECT_NAME, WORKSPACE_PATH, bodyOf, categoryOf,
  type Artifact,
} from "@/lib/desk-data";

export const Route = createFileRoute("/studio")({
  validateSearch: (s: Record<string, unknown>) => ({ artifact: typeof s.artifact === "string" ? s.artifact : undefined }),
  head: () => ({
    meta: [
      { title: "Studio — improve artifacts with AI | IdeaGate" },
      { name: "description", content: "Studio is the IdeaGate document editor: a calm paper surface for reading and improving agent-written product artifacts, with an AI intelligence panel alongside." },
      { property: "og:title", content: "Studio — improve artifacts with AI | IdeaGate" },
      { property: "og:description", content: "A premium document surface for improving agent-written product artifacts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

/* ═════════════════════════════════════════════════════════════════════
 *  STUDIO — edit + improve.  Desk reads. Mission Control watches.
 *
 *  Backend mapping:
 *    LeftPanel      → artifact metadata + parsed headings
 *    DocumentPaper  → persisted artifact markdown (artifact_versions.latest)
 *    SelectionBar   → improvement request (scope = block)
 *    IntelligencePanel → improvement run request (agent_runs)
 * ══════════════════════════════════════════════════════════════════ */

const EDITABLE = ARTIFACTS.filter((a) => a.state === "generated");

function StudioPage() {
  const { artifact: artifactParam } = Route.useSearch();
  const [activeId, setActiveId] = useState<string>(artifactParam ?? "prd-007");
  useEffect(() => { if (artifactParam) setActiveId(artifactParam); }, [artifactParam]);

  const artifact = useMemo(() => EDITABLE.find((a) => a.id === activeId) ?? EDITABLE[0], [activeId]);
  const [dirty, setDirty] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="dark relative flex min-h-screen" style={{ background: "var(--surface-op-sunken)", color: "var(--foreground)" }}>
      <StudioNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudioTopbar artifact={artifact} dirty={dirty} />
        <div className="flex min-w-0 flex-1">
          <DocumentPanel artifact={artifact} onSelect={setActiveId} activeSection={activeSection} onJump={setActiveSection} />
          <DocumentPaper artifact={artifact} dirty={dirty} onDirty={() => setDirty(true)} />
          <IntelligencePanel onRun={() => setDirty(true)} />
        </div>
      </div>
    </div>
  );
}

/* ─── LEFT NAV RAIL (shared shell) ───────────────────────────────────── */

const NAV = [
  { id: "desk", label: "Desk", kbd: "D", href: "/desk" },
  { id: "studio", label: "Studio", kbd: "S", href: "/studio", active: true },
  { id: "mc", label: "Mission Control", kbd: "M", href: "/mission-control" },
];

function StudioNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[212px] shrink-0 flex-col border-r lg:flex" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}>
      <Link to="/" className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="20" height="20" rx="5" stroke="var(--border-strong)" />
          <path d="M6 11h6M12 7l4 4-4 4" stroke="var(--operational)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-ui text-foreground">IdeaGate</span>
          <span className="text-code text-muted-foreground" style={{ fontSize: 10 }}>product os · v0.3</span>
        </div>
      </Link>
      <div className="mx-4 my-2 h-px" style={{ background: "var(--border-op)" }} />
      <nav className="flex-1 px-3 py-2">
        <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>workspace</div>
        <ul className="space-y-0.5">
          {NAV.map((n) => (
            <li key={n.id}>
              <Link
                to={n.href}
                className={`group relative flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-150 ${n.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                style={{ background: n.active ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent" }}
              >
                {n.active ? <span aria-hidden className="absolute inset-y-1 left-0 w-[2px] rounded-full" style={{ background: "var(--operational)" }} /> : null}
                <span className="text-ui pl-2">{n.label}</span>
                <span className="text-code opacity-0 transition-opacity group-hover:opacity-100" style={{ fontSize: 10 }}>{n.kbd}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t px-4 py-3 text-code text-muted-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10, opacity: 0.6 }}>
        {WORKSPACE_PATH}
      </div>
    </aside>
  );
}

function StudioTopbar({ artifact, dirty }: { artifact: Artifact; dirty: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-8" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-code" style={{ fontSize: 11 }}>workspace</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui text-foreground" style={{ fontSize: 13 }}>{PROJECT_NAME}</span>
        <span className="text-code" style={{ fontSize: 11 }}>/</span>
        <span className="text-ui" style={{ fontSize: 13 }}>Studio</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-code" style={{ fontSize: 11, color: dirty ? "var(--warning)" : "var(--muted-foreground)", opacity: dirty ? 1 : 0.6 }}>
          {dirty ? "Unsaved changes" : "Saved"}
        </span>
        <Link to="/desk" className="text-ui rounded-md border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 12 }}>
          ← Back to Desk
        </Link>
      </div>
    </header>
  );
}

/* ─── LEFT PANEL → artifact metadata + parsed headings ───────────────── */

function DocumentPanel({ artifact, onSelect, activeSection, onJump }: { artifact: Artifact; onSelect: (id: string) => void; activeSection: string | null; onJump: (h: string) => void }) {
  const sections = bodyOf(artifact);
  const cat = categoryOf(artifact.stage);
  const health = artifact.status === "warnings" || artifact.status === "changes" ? "var(--warning)" : "var(--operational)";
  const [switching, setSwitching] = useState(false);

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[240px] shrink-0 flex-col border-r xl:flex" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}>
      <div className="border-b px-5 py-5" style={{ borderColor: "var(--border-op)" }}>
        <div className="text-code" style={{ fontSize: 11, color: CATEGORY_COLOR[cat], opacity: 0.85 }}>{cat} · stage {artifact.stage}</div>
        <h2 className="mt-2 text-foreground" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{artifact.name}</h2>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-code rounded-md px-1.5 py-0.5" style={{ fontSize: 10, background: "color-mix(in oklab, var(--info) 14%, transparent)", color: "var(--info)" }}>v{artifact.version}</span>
          <span className="text-code inline-flex items-center gap-1.5" style={{ fontSize: 11, color: health }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: health }} />
            {artifact.status}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="text-label px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>sections</div>
        <ul className="space-y-0.5">
          {sections.map((s) => {
            const on = activeSection === s.heading;
            return (
              <li key={s.heading}>
                <button
                  onClick={() => { onJump(s.heading); document.getElementById(slug(s.heading))?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left transition-colors duration-150"
                  style={{ fontSize: 12.5, color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "color-mix(in oklab, var(--operational) 10%, transparent)" : "transparent" }}
                >
                  {s.heading}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="text-label mt-6 px-2 pb-2 text-muted-foreground" style={{ fontSize: 10 }}>other artifacts</div>
        <ul className="space-y-0.5">
          {EDITABLE.filter((a) => a.id !== artifact.id).map((a) => (
            <li key={a.id}>
              <button
                onMouseDown={() => setSwitching(true)}
                onClick={() => { onSelect(a.id); setSwitching(false); }}
                className="w-full truncate rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors duration-150 hover:text-foreground"
                style={{ fontSize: 12.5 }}
              >
                {a.name}
              </button>
            </li>
          ))}
        </ul>
        {switching ? null : null}
      </div>

      <div className="border-t px-5 py-4" style={{ borderColor: "var(--border-op)" }}>
        <div className="text-code text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>health</div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}>
          <div style={{ width: `${artifact.confidence ? CONFIDENCE_SCORE[artifact.confidence] : 0}%`, height: "100%", background: health, transition: "width 200ms ease-out" }} />
        </div>
        <div className="text-code mt-2 text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>
          {artifact.confidence} confidence · {artifact.agent}
        </div>
      </div>
    </aside>
  );
}

const slug = (h: string) => "sec-" + h.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* ─── CENTER → persisted artifact markdown, warm paper surface ───────── */

function DocumentPaper({ artifact, dirty, onDirty }: { artifact: Artifact; dirty: boolean; onDirty: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  const sections = bodyOf(artifact);

  useEffect(() => {
    const onUp = () => {
      const s = window.getSelection();
      if (!s || s.isCollapsed || !s.rangeCount || !ref.current) { setSel(null); return; }
      const range = s.getRangeAt(0);
      if (!ref.current.contains(range.commonAncestorContainer)) { setSel(null); return; }
      const r = range.getBoundingClientRect();
      setSel({ x: r.left + r.width / 2, y: r.top });
    };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    return () => { document.removeEventListener("mouseup", onUp); document.removeEventListener("keyup", onUp); };
  }, []);

  const ink = "#1b1a17";
  const muted = "#6b6660";

  return (
    <main className="relative min-w-0 flex-1 overflow-y-auto px-10 py-10" style={{ maxHeight: "calc(100vh - 3.5rem)" }}>
      <div
        className="mx-auto rounded-xl px-10 py-14 sm:px-14"
        style={{ maxWidth: 780, background: "#FDF8F3", color: ink, boxShadow: "0 30px 70px -40px rgba(0,0,0,0.7)" }}
      >
        <div className="mx-auto" style={{ maxWidth: 680 }}>
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: muted, opacity: 0.7 }}>{artifact.outputFile}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: dirty ? "#b45309" : muted, opacity: dirty ? 1 : 0.6 }}>
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>

          <h1 style={{ color: ink, fontSize: 28, fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.015em" }}>{artifact.title}</h1>
          <div className="mt-3" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: muted, opacity: 0.7 }}>
            {artifact.agent} · v{artifact.version} · {artifact.confidence} confidence · {artifact.readMin} min read
          </div>

          <div ref={ref} onInput={onDirty}>
            {sections.map((s) => (
              <section key={s.heading} id={slug(s.heading)} className="mt-9 scroll-mt-8">
                <h2 style={{ color: ink, fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{s.heading}</h2>
                {s.blocks.map((b, i) => {
                  if (b.kind === "p") return <p key={i} className="mt-3" style={{ fontSize: 15, lineHeight: 1.75, color: "#2c2a26" }}>{b.text}</p>;
                  if (b.kind === "ul") return (
                    <ul key={i} className="mt-3 space-y-2">
                      {b.items.map((it) => (
                        <li key={it} className="flex gap-3" style={{ fontSize: 15, lineHeight: 1.75, color: "#2c2a26" }}>
                          <span aria-hidden className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full" style={{ background: "#a8a29a" }} />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  );
                  return (
                    <div key={i} className="mt-5 overflow-hidden rounded-lg" style={{ border: "1px solid #e6ded3" }}>
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr>{b.head.map((h) => (<th key={h} className="px-4 py-2" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: muted, borderBottom: "1px solid #e6ded3", background: "#f6efe6" }}>{h}</th>))}</tr>
                        </thead>
                        <tbody>
                          {b.rows.map((r, ri) => (
                            <tr key={ri}>{r.map((c, ci) => (<td key={ci} className="px-4 py-2.5" style={{ fontSize: 14, lineHeight: 1.6, color: "#2c2a26", borderTop: ri ? "1px solid #efe7dc" : "none", fontWeight: ci === 0 ? 600 : 400 }}>{c}</td>))}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </div>
      </div>

      {sel ? <SelectionBar x={sel.x} y={sel.y} onAction={() => { setSel(null); onDirty(); }} /> : null}
    </main>
  );
}

/** floating formatting toolbar → improvement request, scope = block */
function SelectionBar({ x, y, onAction }: { x: number; y: number; onAction: () => void }) {
  return (
    <div
      className="fixed z-40 flex items-center gap-0.5 rounded-lg border p-1"
      style={{ left: x, top: y - 46, transform: "translateX(-50%)", background: "var(--surface-op-elevated)", borderColor: "var(--border-op)", boxShadow: "0 18px 40px -24px rgba(0,0,0,0.8)", animation: "ig-fade-up 140ms var(--ease-out) both" }}
    >
      {["Rewrite", "Expand", "Clarify", "Evidence"].map((a) => (
        <button key={a} onClick={onAction} className="text-ui rounded-md px-2.5 py-1 text-muted-foreground transition-colors duration-150 hover:bg-white/[0.06] hover:text-foreground" style={{ fontSize: 12 }}>{a}</button>
      ))}
    </div>
  );
}

/* ─── RIGHT → improvement run request (agent_runs) ───────────────────── */

const PRESET_CHIPS = ["More concise", "Add evidence", "Strengthen recommendation"];
const EXTENTS = ["Light", "Medium", "Strong"] as const;
const SCOPES = ["Block", "Stage", "Project"] as const;

function IntelligencePanel({ onRun }: { onRun: () => void }) {
  const [intent, setIntent] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [extent, setExtent] = useState<(typeof EXTENTS)[number]>("Medium");
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("Stage");

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[280px] shrink-0 flex-col overflow-y-auto border-l px-5 py-6 lg:flex" style={{ background: "var(--surface-op)", borderColor: "var(--border-op)" }}>
      <div className="text-label text-muted-foreground" style={{ fontSize: 10 }}>improvement intent</div>
      <textarea
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        rows={5}
        placeholder="Resolve the pricing conflict: per-location billing contradicts the decision to defer multi-location support."
        className="mt-2 w-full resize-none rounded-lg border bg-transparent px-3 py-2.5 text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground/60 focus:border-[color-mix(in_oklab,var(--operational)_45%,transparent)]"
        style={{ borderColor: "var(--border-op)", fontSize: 13.5, lineHeight: 1.6 }}
      />

      <div className="mt-6 flex items-center justify-between gap-2">
        <span className="text-code text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>model</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="text-ui max-w-[170px] truncate rounded-md border bg-transparent px-2 py-1 text-foreground outline-none"
          style={{ borderColor: "var(--border-op)", fontSize: 12 }}
        >
          {MODELS.map((m) => (<option key={m} value={m} style={{ background: "#111" }}>{m}</option>))}
        </select>
      </div>

      <div className="mt-6">
        <div className="text-label pb-2 text-muted-foreground" style={{ fontSize: 10 }}>presets</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => setIntent(c === "More concise" ? "Tighten every section. Remove restatement, keep every requirement." : c === "Add evidence" ? "Attach a source or interview reference to each claim in this document." : "Make the recommendation explicit and commit to one option.")}
              className="rounded-full px-3 py-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
              style={{ fontSize: 12, background: "color-mix(in oklab, var(--foreground) 6%, transparent)" }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-label pb-2 text-muted-foreground" style={{ fontSize: 10 }}>extent</div>
        <Segmented options={EXTENTS as unknown as string[]} value={extent} onChange={(v) => setExtent(v as typeof extent)} />
      </div>

      <div className="mt-5">
        <div className="text-label pb-2 text-muted-foreground" style={{ fontSize: 10 }}>scope</div>
        <Segmented options={SCOPES as unknown as string[]} value={scope} onChange={(v) => setScope(v as typeof scope)} />
      </div>

      <button
        onClick={onRun}
        className="mt-7 w-full rounded-lg py-2.5 font-medium transition-transform duration-150 hover:-translate-y-px"
        style={{ background: "var(--operational)", color: "#0a1a12", fontSize: 14 }}
      >
        Improve →
      </button>

      <div className="text-code mt-4 text-muted-foreground" style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.55 }}>
        Improvements write a new artifact version. Nothing is overwritten.
      </div>

      <div className="mt-auto pt-8">
        <div className="text-code text-muted-foreground" style={{ fontSize: 11, opacity: 0.6 }}>
          {AGENTS.length} agents · 15 stages
        </div>
      </div>
    </aside>
  );
}

function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-md border p-0.5" style={{ borderColor: "var(--border-op)" }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className="flex-1 rounded-[5px] py-1 transition-colors duration-150"
            style={{ fontSize: 12, color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "color-mix(in oklab, var(--foreground) 8%, transparent)" : "transparent" }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
