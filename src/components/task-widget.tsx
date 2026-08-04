import { useEffect, useState } from "react";

/* ── FLOATING TASK WIDGET → personal_tasks (per-user, not journey state) ── */

type Task = { id: string; text: string; done: boolean; leaving?: boolean };

const SEED: Task[] = [
  { id: "t1", text: "Review Discovery artifact for the retail project", done: true },
  { id: "t2", text: "Update PRD with pricing feedback from stakeholder", done: false },
  { id: "t3", text: "Ask team to validate the UX flows before architecture", done: false },
];

export function TaskWidget() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [draft, setDraft] = useState("");
  const [hover, setHover] = useState<string | null>(null);

  const remaining = tasks.filter((t) => !t.done).length;

  useEffect(() => {
    const leaving = tasks.filter((t) => t.done && !t.leaving);
    if (!leaving.length) return;
    const ids = leaving.map((t) => t.id);
    const a = setTimeout(() => setTasks((ts) => ts.map((t) => (ids.includes(t.id) ? { ...t, leaving: true } : t))), 1000);
    return () => clearTimeout(a);
  }, [tasks]);

  const toggle = (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done, leaving: false } : t)));
  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const add = () => {
    if (!draft.trim()) return;
    setTasks((ts) => [...ts, { id: String(Date.now()), text: draft.trim(), done: false }]);
    setDraft("");
  };

  return (
    <div className="dark fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
      {open ? (
        <div
          className="spring-in flex w-[320px] flex-col rounded-xl border"
          style={{ background: "var(--surface-op-elevated)", borderColor: "var(--border-op)", boxShadow: "0 24px 60px -30px rgba(0,0,0,0.85)" }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border-op)" }}>
            <span className="text-ui text-foreground" style={{ fontSize: 13 }}>Personal Tasks</span>
            <button onClick={() => setOpen(false)} aria-label="Close tasks" className="text-muted-foreground transition-colors hover:text-foreground" style={{ fontSize: 15, lineHeight: 1 }}>×</button>
          </div>

          <div className="px-3 pt-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
              placeholder="Add a task..."
              className="w-full rounded-md border bg-transparent px-3 py-2 text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[color-mix(in_oklab,var(--operational)_45%,transparent)]"
              style={{ borderColor: "var(--border-op)", fontSize: 12.5 }}
            />
          </div>

          <ul className="max-h-[280px] space-y-0.5 overflow-y-auto p-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
                className="flex items-start gap-2.5 rounded-md px-2 py-2"
                style={{
                  opacity: t.leaving ? 0 : 1,
                  maxHeight: t.leaving ? 0 : 80,
                  transform: t.leaving ? "translateX(12px)" : "none",
                  transition: "opacity 200ms var(--ease-out), transform 200ms var(--ease-out), max-height 200ms var(--ease-out)",
                  background: hover === t.id ? "color-mix(in oklab, var(--foreground) 5%, transparent)" : "transparent",
                }}
              >
                <button onClick={() => toggle(t.id)} aria-label="Toggle task" className="mt-[2px] shrink-0">
                  {t.done ? (
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <circle cx="7" cy="7" r="7" fill="var(--operational)" />
                      <path d="M4 7.2l2 2 4-4.2" stroke="#0a1a12" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="block h-[13px] w-[13px] rounded-full border" style={{ borderColor: "color-mix(in oklab, var(--muted-foreground) 60%, transparent)" }} />
                  )}
                </button>
                <span
                  className="flex-1"
                  style={{
                    fontSize: 12.5, lineHeight: 1.5,
                    color: t.done ? "var(--muted-foreground)" : "var(--foreground)",
                    textDecoration: t.done ? "line-through" : "none",
                    opacity: t.done ? 0.6 : 1,
                  }}
                >
                  {t.text}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Delete task"
                  className="shrink-0 text-muted-foreground transition-opacity hover:text-foreground"
                  style={{ fontSize: 13, lineHeight: 1, opacity: hover === t.id ? 0.7 : 0 }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-150 hover:-translate-y-px"
        style={{ background: "var(--surface-op-elevated)", borderColor: "var(--border-op)", boxShadow: "0 12px 30px -18px rgba(0,0,0,0.9)" }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14"><path d="M3 7.4l2.6 2.6L11 4.4" stroke="var(--operational)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="text-ui text-foreground" style={{ fontSize: 12 }}>Tasks</span>
        <span className="text-code" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {remaining}</span>
      </button>
    </div>
  );
}
