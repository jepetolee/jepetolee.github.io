---
name: paper-review-draft
description: Given an arXiv paper URL or ID, fetch and read the paper, then draft a Korean paper-review markdown file under src/content/papers/ko/ following this site's review conventions (frontmatter schema, tag taxonomy, references, writing style), with draft:true for the user to review before publishing. Use when the user pastes an arxiv link and asks for a review, summary, analysis, or draft to be written up.
---

# paper-review-draft

Reads an arXiv paper and produces a first-draft paper review in this blog's established format,
written to `src/content/papers/ko/<slug>.md` with `draft: true` — handed to the user for editing,
not auto-published.

## Step 0 — Check for a referenced file

If the user's request names a specific file to read first (a path under
`.claude/knowledge/<topic>/`, or any other local file), read it with the Read tool before fetching
anything from arXiv. If it's a knowledge-store note (see `.claude/knowledge/README.md`), treat its
findings and durable source links as already-verified prior work — don't re-derive what it already
covers, and cite the same sources it lists rather than re-fetching them yourself. Then continue to
Step 1, using the paper fetch to fill in whatever the referenced file doesn't already cover, or to
verify a specific claim the user is asking about.

## Step 1 — Resolve the paper

Accept an arXiv URL (`/abs/`, `/pdf/`, or `ar5iv`) or a bare ID (e.g. `2010.02193`). Normalize to
the abstract page `https://arxiv.org/abs/<id>`.

Fetch the **full text**, not just the abstract — the review must reflect the actual method,
equations, and results. Use the HTML mirror for readable full text:
`https://arxiv.org/abs/<id>` (WebFetch) first for title/authors/venue/year, then
`https://ar5iv.labs.arxiv.org/html/<id>` (WebFetch) for the full paper body. If ar5iv fails for
that id, fall back to fetching `https://arxiv.org/pdf/<id>` directly.

Before writing anything, check whether this paper is already reviewed: grep `paperUrl` and the
arXiv id across `src/content/papers/*/*.md*`. If a review already exists (in any locale), tell the
user and ask whether they want it revised instead of creating a duplicate.

## Step 2 — Pick a slug and check taxonomy fit

- **Slug**: short kebab-case, matching existing convention (model/method name, not the full paper
  title) — e.g. `dreamer-v2`, `planet`, `ppo`, `world-models`. Check
  `src/content/papers/ko/` for collisions.
- **category / subcategory**: cross-reference `src/taxonomy.ts` `TOPIC_TAGS` and grep existing
  papers' frontmatter (`category:`, `subcategory:`) for a matching topic area. Reuse an existing
  `category`/`subcategory` string exactly if this paper fits one (so `getPaperCategoryTree()`
  groups it correctly instead of creating a near-duplicate heading) — don't coin a new one unless
  nothing fits.
- **tags**: topic tag(s) from `TOPIC_TAGS` first, then venue/company/model/library detail tags
  after, per the README tag-ordering convention. Use canonical spellings from `CONFERENCE_TAGS` /
  `COMPANY_TAGS` in `src/taxonomy.ts` for venues/companies (e.g. `NeurIPS`, `Google DeepMind`) —
  don't invent variant spellings.
- **references**: only include slugs of paper reviews that *actually exist* in
  `src/content/papers/ko/` and that this paper genuinely builds on or should be read after (per
  `sortByReferenceOrder`). Grep to confirm each slug exists before adding it. Leave `[]` if none
  apply — never invent a reference to make the lineage look complete.
- **authors / venue / year / paper / paperUrl**: fill from the fetched metadata. `paper` is the
  paper's own title (English, as published); `title` (frontmatter) is this blog's own Korean
  review title, following the existing "짧은 핵심어: 부제" style (e.g. `"DreamerV2: 이산 잠재로
  Atari를 정복하다"`).

## Step 3 — Write the review body

Match the tone and shape of existing reviews (see `src/content/papers/ko/*.md` for reference,
e.g. `dreamer-v2.md`, `world-models.md`, `ppo.md`): concise, technical, written for an AI/ML-
literate reader. Not a paraphrase of the abstract — it must reflect having actually read the
method and results sections.

Typical structure (adapt headings to what the paper actually needs, don't force all of them):

- `## 한 줄 요약` — the core idea in 1-3 sentences.
- `## 핵심 기여` / `## 핵심 변경점` — the method, as a bullet list of the actual mechanisms
  (with real equations from the paper in `$...$` / `$$...$$` KaTeX, not restated vaguely).
- `## 인사이트` / `## 계보에서의 위치` — why it matters, how it relates to prior work already
  reviewed on this blog (link with `[Name](/papers/<slug>/)` when a `references` entry applies),
  and what it enabled afterward.

Keep code/inline math byte-accurate to what the paper states — don't approximate an equation if
you're not sure of it; describe it in words instead of writing a wrong formula.

## Step 4 — Write the file

Write to `src/content/papers/ko/<slug>.md` with `draft: true` always (this is a first draft, not
ready to publish). `description` is a 1-2 sentence Korean summary in the same style as existing
`description` fields.

If a file at that path already exists, tell the user it will be overwritten and confirm first.

## Step 5 — Report

Tell the user: file path written; the `category`/`subcategory`/`tags` chosen and why (reused vs.
new); which `references` were included (or why none applied); and next steps — review the draft
for technical accuracy, flip `draft: false` when ready to publish, and optionally run the
`translate-content` skill afterward to produce other-locale versions once the Korean draft is
finalized.
