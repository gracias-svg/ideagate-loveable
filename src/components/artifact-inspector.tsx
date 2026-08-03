import { ARTIFACTS, HEALTH_COLOR, bodyOf, healthOf, phaseOf, type Artifact } from "@/lib/desk-data";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
 *  INSPECTOR → artifact_versions (read-only detail)
 *  Slides in from the right. Never blocks the workspace: no backdrop.
 * ════════════════════════════════════════════════════════════════════ */

export function ArtifactInspector({ id, onClose }: { id: string | null; onClose: () => void }) {
  const artifact = id ? ARTIFACTS.find((a) => a.id === id) ?? null : null;
  const [mounted, setMounted] = useState<Artifact | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (artifact) {
      setMounted(artifact);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(null), 220);
    return () => clearTimeout(t);
  }, [artifact]);

  if (!mounted) return null;

  const health = healthOf(mounted);
  const phase = phaseOf(mounted.stage);
  const sections = bodyOf(mounted).filter((s) => s.heading.toLowerCase() !== "executive summary");
  const downstream = (mounted.downstream ?? []).length;
  const confidenceLine =
    health === "attention" ? "Needs review" : mounted.confidence === "high" ? "High confidence" : mounted.confidence === "medium" ? "Moderate confidence" : "Low confidence";

  return (
    <div
      role="complementary"
      aria-label={`${mounted.name} inspector`}
      className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-[420px] max-w-[92vw] flex-col border-l"
      style={{
        background: "var(--surface-op-elevated)",
        borderColor: "var(--border-op)",
        boxShadow: "-30px 0 70px -50px rgba(0,0,0,0.9)",
        transform: entered ? "translateX(0)" : "translateX(100%)",
        transition: "transform 200ms var(--ease-out)",
      }}
    >
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div className="min-w-0">
          <h2 className="text-foreground" style={{ fontFamily: "var(--font-serif)", fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.015em" }}>{mounted.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-code rounded-full border px-2 py-0.5 text-muted-foreground" style={{ fontSize: 10, borderColor: "var(--border-op)" }}>{phase}</span>
            <span className="text-code inline-flex items-center gap-1.5" style={{ fontSize: 10, color: HEALTH_COLOR[health] }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: HEALTH_COLOR[health] }} />
              {health === "healthy" ? "healthy" : health === "attention" ? "needs attention" : "not generated"}
            </span>
          </div>
          <div className="text-ui mt-2 text-muted-foreground" style={{ fontSize: 13 }}>{confidenceLine}</div>
        </div>
        <button onClick={onClose} className="text-code shrink-0 rounded-md border px-2 py-1 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>close</button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {mounted.summary ? (
          <div className="rounded-lg border px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
            <div className="text-label text-muted-foreground" style={{ fontSize: 9.5 }}>executive summary</div>
            <p className="mt-2 text-foreground/85" style={{ fontSize: 13.5, lineHeight: 1.65 }}>{mounted.summary}</p>
          </div>
        ) : (
          <div className="text-ui text-muted-foreground" style={{ fontSize: 13 }}>This artifact has not been written yet.</div>
        )}

        {sections.map((sec) => (
          <section key={sec.heading} className="mt-7">
            <h3 className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>{sec.heading}</h3>
            {sec.blocks.map((b, i) => {
              if (b.kind === "p") return <p key={i} className="mt-2 text-foreground/75" style={{ fontSize: 13.5, lineHeight: 1.7 }}>{b.text}</p>;
              if (b.kind === "ul") return (
                <ul key={i} className="mt-2 space-y-1.5">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-foreground/75" style={{ fontSize: 13, lineHeight: 1.65 }}>
                      <span aria-hidden className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--operational)" }} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              );
              return (
                <div key={i} className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-op)" }}>
                  <table className="w-full border-collapse text-left">
                    <thead><tr>{b.head.map((h) => <th key={h} className="text-label px-3 py-1.5 text-muted-foreground" style={{ fontSize: 9.5, borderBottom: "1px solid var(--border-op)" }}>{h}</th>)}</tr></thead>
                    <tbody>{b.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} className="px-3 py-1.5 text-foreground/75" style={{ fontSize: 12.5, borderTop: ri ? "1px solid var(--border-op)" : "none" }}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              );
            })}
          </section>
        ))}

        <div className="text-code mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-muted-foreground" style={{ borderColor: "var(--border-op)", fontSize: 10 }}>
          <span>v{mounted.version ?? 0}</span>
          <span>{mounted.agent}</span>
          <span>{downstream} downstream</span>
          <span>stage {mounted.stage}</span>
        </div>
      </div>

      <div className="shrink-0 border-t px-6 py-4" style={{ borderColor: "var(--border-op)", background: "var(--surface-op-elevated)" }}>
        <Link
          to="/studio"
          search={{ artifact: mounted.id }}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-transform duration-150 hover:-translate-y-px"
          style={{ background: "var(--operational)", color: "#0a1a12", fontSize: 13.5 }}
        >
          Open in Studio
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </div>
  );
}
