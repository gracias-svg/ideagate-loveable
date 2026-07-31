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
  title?: string;
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
  /** artifact ids that consume this one */
  downstream?: string[];
};

export const PROJECT_NAME = "Stockwise";
export const WORKSPACE_PATH = "workspace/stockwise/";
export const PRODUCT_IDEA =
  "AI-powered inventory management for retail SMBs — forecasts demand, flags dead stock, and writes the reorder list before the owner opens the shop.";

export const ARTIFACTS: Artifact[] = [
  {
    stage: 0, outputFile: "0-idea-intake.md", id: "idea-000", name: "Idea intake", docType: "Intake",
    agent: "C-01", state: "generated", confidence: "high", version: 1, status: "approved", updatedMin: 74, readMin: 3,
    title: "Idea intake — inventory that reorders itself",
    summary: "The raw idea, normalised into a structured intake record: independent retailers with 1–4 locations, drowning in spreadsheet stock counts, losing margin to both stockouts and dead inventory.",
    reasoning: "The idea named both a user (retail SMB owner-operators) and a measurable pain (manual reorder decisions), so intake was recorded at high confidence without clarifying questions.",
    downstream: ["res-001", "prob-002"],
  },
  {
    stage: 1, outputFile: "1-discovery.md", id: "res-001", name: "Discovery", docType: "Research",
    agent: "R-01", state: "generated", confidence: "high", version: 2, status: "passing", updatedMin: 68, readMin: 12,
    title: "How independent retailers actually decide what to reorder",
    summary: "Fourteen owner-operator interviews and nine public retail postmortems converge on one insight: reordering is a memory exercise, not a data exercise. Owners trust their gut because the data arrives too late to trust.",
    reasoning: "Independent sources across grocery, apparel, and hardware retail described the same failure mode, and the sample spans store counts, so the findings are treated as high confidence.",
    downstream: ["prob-002", "sol-003", "prd-007"],
  },
  {
    stage: 2, outputFile: "2-problem-definition.md", id: "prob-002", name: "Problem definition", docType: "Spec",
    agent: "S-01", state: "generated", confidence: "high", version: 1, status: "approved", updatedMin: 61, readMin: 7,
    title: "Problem definition — capital trapped on the wrong shelves",
    summary: "The core problem is misallocated working capital: SMB retailers hold 30–40% of stock value in items that will not sell this quarter while running out of their top ten sellers. The cost is measured in margin, not in hours.",
    reasoning: "The problem statement follows directly from the discovery evidence and does not depend on any unvalidated assumption.",
    downstream: ["sol-003", "mvp-004", "prio-006"],
  },
  {
    stage: 3, outputFile: "3-solution-design.md", id: "sol-003", name: "Solution design", docType: "Spec",
    agent: "S-01", state: "generated", confidence: "medium", version: 3, status: "warnings", updatedMin: 55, readMin: 15,
    title: "Solution design — the morning reorder list",
    summary: "Stockwise reads POS history nightly and composes a single ranked reorder list each morning: what to buy, how much, and why. The owner approves or edits in under three minutes instead of auditing a dashboard.",
    reasoning: "The shape of the solution is well supported, but the forecast accuracy assumption has not been tested against real seasonal POS data, so confidence is medium.",
    downstream: ["mvp-004", "prd-007", "ux-008"],
  },
  {
    stage: 4, outputFile: "4-mvp-hypothesis.md", id: "mvp-004", name: "MVP hypothesis", docType: "Hypothesis",
    agent: "S-01", state: "generated", confidence: "medium", version: 1, status: "pending", updatedMin: 50, readMin: 6,
    title: "MVP hypothesis — the list is enough",
    summary: "If an owner receives one accurate morning reorder list, they will stop maintaining their reorder spreadsheet within three weeks. The measurable signal is spreadsheet abandonment without a rise in stockout incidents.",
    reasoning: "The hypothesis is falsifiable and cheap to run, but the three-week window is an estimate rather than an evidenced figure.",
    downstream: ["val-005", "prio-006"],
  },
  {
    stage: 5, outputFile: "5-validation.md", id: "val-005", name: "Validation plan", docType: "Research",
    agent: "R-01", state: "generated", confidence: "medium", version: 2, status: "warnings", updatedMin: 44, readMin: 9,
    title: "Validation plan — four-store concierge trial",
    summary: "Four independent stores receive a hand-composed reorder list every trading morning for four weeks. Success is a measurable drop in stockouts on top sellers with no increase in total inventory value.",
    reasoning: "A concierge trial gives a strong behavioural signal, but four stores is a small sample and the result will not generalise across retail verticals.",
    downstream: ["prio-006", "qa-013"],
  },
  {
    stage: 6, outputFile: "6-prioritization.md", id: "prio-006", name: "Prioritization", docType: "Decision",
    agent: "S-01", state: "generated", confidence: "high", version: 1, status: "approved", updatedMin: 39, readMin: 5,
    title: "Prioritization — forecast quality before integrations",
    summary: "Forecast quality is the only thing the trial can falsify, so it takes the whole first cycle. Supplier integrations, multi-location transfers, and purchase-order automation are deferred past the validation gate.",
    reasoning: "Prioritisation follows mechanically from the MVP hypothesis; there is no contested trade-off at this stage.",
    downstream: ["prd-007", "back-011"],
  },
  {
    stage: 7, outputFile: "7-prd.md", id: "prd-007", name: "PRD", docType: "Spec",
    agent: "S-01", state: "generated", confidence: "high", version: 4, status: "warnings", updatedMin: 31, readMin: 22,
    title: "Stockwise — product requirements v0.4",
    summary: "A complete requirements document for POS ingestion, the demand forecast, and the morning reorder list, including onboarding, low-data states, and the approval contract. Non-goals are stated explicitly.",
    reasoning: "Every requirement traces to a discovery finding or a prioritisation decision, but the pricing section still contradicts the prioritisation decision to defer multi-location support.",
    downstream: ["ux-008", "arch-010", "back-011", "impl-012"],
  },
  {
    stage: 8, outputFile: "8-ux-design.md", id: "ux-008", name: "UX design", docType: "Design brief",
    agent: "U-01", state: "generated", confidence: "medium", version: 2, status: "changes", updatedMin: 24, readMin: 11,
    title: "UX design — the reorder list reading surface",
    summary: "The list reads like a printed order sheet: wide typographic rhythm, one line per SKU, reasoning available but never in the way. The owner is here to approve in three minutes, not to explore a tool.",
    reasoning: "The reading surface is well specified, but the edit-quantity interaction still has two competing patterns that have not been resolved.",
    downstream: ["usa-009", "impl-012"],
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

/* ─── DOCUMENT BODIES → persisted artifact markdown ──────────────────── */

export type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

export type DocSection = { heading: string; blocks: DocBlock[] };

const GENERIC = (a: Artifact): DocSection[] => [
  {
    heading: "Executive summary",
    blocks: [{ kind: "p", text: a.summary ?? "" }],
  },
  {
    heading: "Agent reasoning",
    blocks: [{ kind: "p", text: a.reasoning ?? "" }],
  },
];

export const DOC_BODIES: Record<string, DocSection[]> = {
  "prd-007": [
    {
      heading: "Executive summary",
      blocks: [
        { kind: "p", text: "Stockwise turns a retail SMB's point-of-sale history into one ranked reorder list each trading morning. The owner approves, edits quantities, or skips lines — and the decision record feeds the next forecast. This document specifies the ingestion path, the forecast contract, and the approval surface required to run the four-store concierge trial." },
        { kind: "p", text: "Everything outside that loop is explicitly a non-goal for v1. Supplier integrations, purchase-order transmission, and multi-location transfers are deferred until forecast quality is proven." },
      ],
    },
    {
      heading: "Target user",
      blocks: [
        { kind: "p", text: "Owner-operators of independent retail businesses with one to four locations, 400–4,000 active SKUs, and an existing cloud POS. They currently reorder from memory supported by a spreadsheet that is between two days and three weeks stale." },
        { kind: "ul", items: [
          "Reviews stock in the first 20 minutes of the trading day, before staff arrive.",
          "Places orders with 5–15 suppliers, mostly by email or supplier portal.",
          "Measures success in margin and shelf availability, never in dashboard usage.",
        ] },
      ],
    },
    {
      heading: "Core requirements",
      blocks: [
        { kind: "table", head: ["ID", "Requirement", "Priority"], rows: [
          ["R-01", "Nightly POS sync with 24-month sales history backfill", "Must"],
          ["R-02", "Per-SKU demand forecast with a stated confidence band", "Must"],
          ["R-03", "Ranked morning reorder list, one line per SKU", "Must"],
          ["R-04", "Inline reasoning: why this SKU, why this quantity", "Must"],
          ["R-05", "Approve / edit quantity / skip, with reason capture on skip", "Must"],
          ["R-06", "Dead stock flag for items with no movement in 90 days", "Should"],
          ["R-07", "Export approved list as CSV or plain-text email", "Should"],
        ] },
      ],
    },
    {
      heading: "Low-data and onboarding states",
      blocks: [
        { kind: "p", text: "A store with under 90 days of history cannot receive a confident forecast. In that state the list is composed from velocity only, is labelled as provisional, and confidence bands are widened rather than hidden. The product never presents a number it cannot defend." },
      ],
    },
    {
      heading: "Non-goals",
      blocks: [
        { kind: "ul", items: [
          "Purchase-order transmission to suppliers.",
          "Multi-location stock transfer recommendations.",
          "Price optimisation or markdown planning.",
          "Any native mobile application in v1.",
        ] },
      ],
    },
    {
      heading: "Open conflict",
      blocks: [
        { kind: "p", text: "The pricing section proposes per-location billing, which assumes multi-location support. Prioritization (stage 6) defers multi-location past the validation gate. One of the two must change before this document can pass validation." },
      ],
    },
  ],
  "res-001": [
    {
      heading: "Executive summary",
      blocks: [
        { kind: "p", text: "Fourteen owner-operator interviews and nine public retail postmortems converge on one insight: reordering is a memory exercise, not a data exercise. Owners trust their gut because the data arrives too late to trust." },
      ],
    },
    {
      heading: "What we heard",
      blocks: [
        { kind: "ul", items: [
          "11 of 14 owners keep a private reorder spreadsheet that no employee can read.",
          "9 of 14 described running out of a top-ten seller within the last 30 days.",
          "Every owner could name dead stock on sight, and none could quantify its value.",
          "POS reports were described as \"accurate and useless\" — correct data, wrong moment.",
        ] },
      ],
    },
    {
      heading: "Evidence table",
      blocks: [
        { kind: "table", head: ["Segment", "Stores", "Stockout in 30d", "Uses spreadsheet"], rows: [
          ["Grocery / convenience", "5", "5", "4"],
          ["Apparel", "4", "2", "3"],
          ["Hardware / trade", "5", "2", "4"],
        ] },
      ],
    },
    {
      heading: "Implication",
      blocks: [
        { kind: "p", text: "The opportunity is not a better report. It is a decision delivered at the moment the decision is already being made — the first twenty minutes of the trading day." },
      ],
    },
  ],
};

export function bodyOf(a: Artifact): DocSection[] {
  return DOC_BODIES[a.id] ?? GENERIC(a);
}

export const PRESETS: { label: string; idea: string }[] = [
  { label: "SaaS product", idea: "A calm, async-first standup for distributed product teams that composes a morning brief instead of holding a meeting." },
  { label: "Mobile app", idea: "A mobile app that turns a runner's weekly training into a single readable page their coach can review in two minutes." },
  { label: "Internal tool", idea: "An internal tool that gives support engineers one searchable timeline of everything that happened to a customer account." },
  { label: "AI feature", idea: "An AI feature inside a design tool that explains why a layout fails accessibility rules and proposes a corrected version." },
  { label: "Marketplace", idea: "A marketplace connecting independent fabrication shops with hardware startups that need short-run manufacturing." },
];

export const MODELS = ["gpt-5.2", "claude-4.7-sonnet", "gemini-3-pro"];
