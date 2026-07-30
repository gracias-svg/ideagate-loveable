/* ═════════════════════════════════════════════════════════════════════════
 *  DESK DATA MODEL — mirrors the backend exactly, nothing invented.
 *
 *  Backend mapping:
 *    ARTIFACT_FILES        → workspace/<project>/artifacts/*.md
 *    JourneyStage          → journey.json stages[N]
 *      .confidence         → "high" | "medium" | "low"
 *      .reasoning          → agent reasoning string
 *      .startedAt/.completedAt → ISO timestamps
 *      .outputFile         → the markdown file this stage produced
 *    LIFECYCLE_CATEGORIES  → derived grouping of stage indexes (UI only)
 * ══════════════════════════════════════════════════════════════════════ */

export const AGENTS = [
  { code: "C-01", name: "Coordinator" },
  { code: "S-01", name: "Product Strategy" },
  { code: "R-01", name: "Research" },
  { code: "U-01", name: "UX Design" },
  { code: "A-01", name: "Architect" },
  { code: "Q-01", name: "QA" },
] as const;

export type AgentCode = (typeof AGENTS)[number]["code"];

export const CATEGORIES = ["Signal", "Shape", "Define", "Design", "Build", "Ship"] as const;
export type Category = (typeof CATEGORIES)[number];

/** stage index → lifecycle category */
export function categoryOf(stage: number): Category {
  if (stage <= 1) return "Signal";
  if (stage <= 4) return "Shape";
  if (stage <= 6) return "Define";
  if (stage <= 8) return "Design";
  if (stage <= 11) return "Build";
  return "Ship";
}

export const CATEGORY_COLOR: Record<Category, string> = {
  Signal: "var(--info)",
  Shape: "var(--info)",
  Define: "var(--operational)",
  Design: "var(--operational)",
  Build: "var(--warning)",
  Ship: "var(--operational)",
};

export type Confidence = "high" | "medium" | "low";
export const CONFIDENCE_SCORE: Record<Confidence, number> = { high: 90, medium: 70, low: 40 };

export type ArtifactState = "generated" | "generating" | "queued" | "stale";
export type ValidationState = "passing" | "warnings" | "pending" | "approved" | "changes";

export type Artifact = {
  stage: number;
  /** journey.json → stages[N].outputFile */
  outputFile: string;
  /** short stable id used in the UI, e.g. res-041 */
  id: string;
  /** H1 of the generated markdown */
  title: string;
  /** human-readable artifact name (sidebar) */
  name: string;
  docType: string;
  agent: AgentCode;
  state: ArtifactState;
  /** journey.json → stages[N].confidence (absent until generated) */
  confidence?: Confidence;
  /** journey.json → stages[N].reasoning */
  reasoning?: string;
  /** first two sentences of the markdown body */
  summary?: string;
  /** minutes since completedAt */
  updatedMin?: number;
  readMin?: number;
  /** artifact_versions count — how many times improved in Studio */
  version?: number;
  status?: ValidationState;
};

export const PROJECT_NAME = "Nimbus Atlas";
export const WORKSPACE_PATH = "workspace/nimbus-atlas/";

export const ARTIFACTS: Artifact[] = [
  {
    stage: 0, outputFile: "0-idea-intake.md", id: "idea-000", name: "Idea intake", docType: "Intake",
    agent: "C-01", state: "generated", confidence: "high", version: 1, status: "approved", updatedMin: 74, readMin: 3,
    title: "Idea intake — a calm cross-timezone standup",
    summary: "The raw idea, normalised into a structured intake record with an assumed audience and a first framing of the problem. Scope is deliberately wide at this stage; nothing has been validated yet.",
    reasoning: "The idea was specific enough to name both a user (distributed product teams) and a pain (synchronous standups), so intake could be recorded at high confidence without clarifying questions.",
  },
  {
    stage: 1, outputFile: "1-discovery.md", id: "res-001", name: "Discovery", docType: "Research",
    agent: "R-01", state: "generated", confidence: "high", version: 2, status: "passing", updatedMin: 68, readMin: 12,
    title: "How distributed product teams actually run standups",
    summary: "Twelve practitioner accounts and seven public postmortems converge on one insight: standups fail because they optimise for presence over context. Teams need a written artifact, not another meeting.",
    reasoning: "Multiple independent sources agreed on the same failure mode, and the sample spans company sizes, so the discovery findings are treated as high confidence.",
  },
  {
    stage: 2, outputFile: "2-problem-definition.md", id: "prob-002", name: "Problem definition", docType: "Spec",
    agent: "S-01", state: "generated", confidence: "high", version: 1, status: "approved", updatedMin: 61, readMin: 7,
    title: "Problem definition — context loss across timezones",
    summary: "The core problem is context decay: work state written in one timezone is stale by the time the next timezone reads it. The cost is measured in re-explanation, not in missed meetings.",
    reasoning: "The problem statement follows directly from the discovery evidence and does not depend on any unvalidated assumption.",
  },
  {
    stage: 3, outputFile: "3-solution-design.md", id: "sol-003", name: "Solution design", docType: "Spec",
    agent: "S-01", state: "generated", confidence: "medium", version: 3, status: "warnings", updatedMin: 55, readMin: 15,
    title: "Solution design — an async context timeline",
    summary: "Teams write into a shared context timeline instead of speaking into a call. The system composes a morning brief per timezone that reads like an editorial digest rather than a status report.",
    reasoning: "The shape of the solution is well supported, but the summarisation quality assumption has not been tested against real team writing, so confidence is medium.",
  },
  {
    stage: 4, outputFile: "4-mvp-hypothesis.md", id: "mvp-004", name: "MVP hypothesis", docType: "Hypothesis",
    agent: "S-01", state: "generated", confidence: "medium", version: 1, status: "pending", updatedMin: 50, readMin: 6,
    title: "MVP hypothesis — the morning brief is enough",
    summary: "If a team receives one well-composed morning brief, they will skip the synchronous standup within two weeks. The measurable signal is standup attendance decline without a rise in clarification threads.",
    reasoning: "The hypothesis is falsifiable and cheap to run, but the two-week window is an estimate rather than an evidenced figure.",
  },
  {
    stage: 5, outputFile: "5-validation.md", id: "val-005", name: "Validation plan", docType: "Research",
    agent: "R-01", state: "generated", confidence: "medium", version: 2, status: "warnings", updatedMin: 44, readMin: 9,
    title: "Validation plan — two-week concierge trial",
    summary: "Three teams receive a hand-composed brief for ten working days. Success is defined as a measurable drop in synchronous standup time with no increase in asynchronous clarification volume.",
    reasoning: "A concierge trial gives a strong behavioural signal, but three teams is a small sample and the result will not generalise across company sizes.",
  },
  {
    stage: 6, outputFile: "6-prioritization.md", id: "prio-006", name: "Prioritization", docType: "Decision",
    agent: "S-01", state: "generated", confidence: "high", version: 1, status: "approved", updatedMin: 39, readMin: 5,
    title: "Prioritization — brief composition before integrations",
    summary: "Brief quality is the only thing the trial can falsify, so it takes the whole first cycle. Integrations, notifications, and analytics are explicitly deferred past the validation gate.",
    reasoning: "Prioritisation follows mechanically from the MVP hypothesis; there is no contested trade-off at this stage.",
  },
  {
    stage: 7, outputFile: "7-prd.md", id: "prd-007", name: "PRD", docType: "Spec",
    agent: "S-01", state: "generated", confidence: "high", version: 4, status: "passing", updatedMin: 31, readMin: 22,
    title: "Nimbus Atlas — product requirements v0.4",
    summary: "A complete requirements document for the context timeline and the composed morning brief, including entry states, empty states, and the brief composition contract. Non-goals are stated explicitly.",
    reasoning: "Every requirement traces to a discovery finding or a prioritisation decision, and the non-goals section closes the largest scope ambiguity.",
  },
  {
    stage: 8, outputFile: "8-ux-design.md", id: "ux-008", name: "UX design", docType: "Design brief",
    agent: "U-01", state: "generated", confidence: "medium", version: 2, status: "changes", updatedMin: 24, readMin: 11,
    title: "UX design — the morning brief reading surface",
    summary: "The brief reads like an editorial page: wide typographic rhythm, a quiet stage rail, and a running context strip. The reader is here to catch up in three minutes, not to navigate a tool.",
    reasoning: "The reading surface is well specified, but the writing surface still has two competing entry patterns that have not been resolved.",
  },
  {
    stage: 9, outputFile: "9-usability-planning.md", id: "usa-009", name: "Usability planning", docType: "Design brief",
    agent: "U-01", state: "generating", updatedMin: 0, readMin: 8,
  },
  {
    stage: 10, outputFile: "10-architecture.md", id: "arch-010", name: "Architecture", docType: "Architecture",
    agent: "A-01", state: "generating", updatedMin: 0, readMin: 14,
  },
  { stage: 11, outputFile: "11-backlog-release.md", id: "back-011", name: "Backlog & release", docType: "Plan", agent: "C-01", state: "queued" },
  { stage: 12, outputFile: "12-implementation.md", id: "impl-012", name: "Implementation", docType: "Architecture", agent: "A-01", state: "queued" },
  { stage: 13, outputFile: "13-qa-readiness.md", id: "qa-013", name: "QA readiness", docType: "QA plan", agent: "Q-01", state: "queued" },
  { stage: 14, outputFile: "14-prototype-prompt.md", id: "proto-014", name: "Prototype prompt", docType: "Prompt", agent: "C-01", state: "queued" },
];

export const PRESETS: { label: string; idea: string }[] = [
  { label: "SaaS product", idea: "A calm, async-first standup for distributed product teams that composes a morning brief instead of holding a meeting." },
  { label: "Mobile app", idea: "A mobile app that turns a runner's weekly training into a single readable page their coach can review in two minutes." },
  { label: "Internal tool", idea: "An internal tool that gives support engineers one searchable timeline of everything that happened to a customer account." },
  { label: "AI feature", idea: "An AI feature inside a design tool that explains why a layout fails accessibility rules and proposes a corrected version." },
  { label: "Marketplace", idea: "A marketplace connecting independent fabrication shops with hardware startups that need short-run manufacturing." },
];

export const MODELS = ["gpt-5.2", "claude-4.7-sonnet", "gemini-3-pro"];
