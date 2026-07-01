---
name: knowledge-toc-plan
description: Read an entire topic's accumulated analysis notes under .claude/knowledge/<topic>/ (built up by ml-systems-post-draft over one or more sessions), verify their citations are real (not hallucinated), and decompose the material into a table-of-contents plan — which post covers which scope, in what order, as a series. Then, once confirmed, drive the actual drafting of each planned post. Use when a heavy-library analysis topic (e.g. vLLM, PyTorch internals) has grown too large for one post and needs to be split into a coherent multi-post series.
---

# knowledge-toc-plan

Heavy systems libraries generate more analysis material than fits in one post. This skill takes
everything accumulated for a topic in `.claude/knowledge/<topic-slug>/` (see
`.claude/knowledge/README.md` for the format), checks it's actually grounded in real, checkable
sources rather than plausible-sounding hallucination, and plans how to split it into a coherent
series of real posts — then runs that plan.

## Step 0 — Resolve the topic

The user may name a bare topic slug (e.g. "vllm"), a directory path, or a specific file inside one
(e.g. an `index.md` or a single note) — resolve any of these to the containing
`.claude/knowledge/<topic-slug>/` and read from there. If it doesn't exist, or `notes/` is empty,
tell the user there's nothing to plan yet — run `ml-systems-post-draft` first to build up analysis
material for this topic.

## Step 1 — Ingest the full accumulated material

Read `index.md` and every file under `notes/`. Unlike the drafting skills, this step is meant to
see everything at once — the whole point is to plan boundaries across the full material, not one
narrow slice. If the combined notes are too large to read directly in one pass, delegate to a
`general-purpose` subagent to read them all and return a structured index (per note: scope, key
claims, source links) rather than skipping notes — don't plan from a partial view.

## Step 2 — Verify citations before trusting anything

Check each note's `origin` field first (see `.claude/knowledge/README.md`):

- **`origin: agent`** (from `ml-systems-analyst` via `ml-systems-post-draft`) — its cited sources
  must be real and actually support its claims:
  - **Code permalinks** (`https://github.com/<owner>/<repo>/blob/<sha>/<path>#L<start>-L<end>`):
    `WebFetch` a sample of them (all of them if the note count is small) and confirm the fetched
    content actually contains what the note claims it does — not just that the URL returns 200.
  - **Paper links** (arXiv/ar5iv): confirm they resolve and that the paper actually discusses the
    method the note attributes to it.

  Any note that cites local scratchpad paths instead of durable permalinks, or whose citations
  don't check out, gets flagged: exclude its unverified claims from the plan and mark the note
  `status: needs-reverification` in `index.md` rather than building a post section on top of it.
  Tell the user which notes failed verification and why — this is the concrete defense against a
  plan (and eventually a published post) being built on a hallucinated claim.

- **`origin: user`** (from `knowledge-editor`) — no external citation to verify; the user is the
  source. Carry these into the plan as-is, but keep them labeled as user-provided context rather
  than independently-verified findings when they show up in a post's body (Step 6).

## Step 3 — Decompose into a plan

Using only verified material, decide:

- **How many posts**, and for each: a working title, a slug candidate, and its scope — which
  notes/sections it covers, stated as a concrete boundary ("A부터 B까지": e.g. "블록 할당자 구조
  ~ KV 캐시 스와핑까지", not "vLLM 전반"). Each post must stand alone as a coherent, complete read
  per this blog's normal post conventions — don't cut a post at an arbitrary length; cut where the
  material's own scope boundaries are (one subsystem, one mechanism, one paper's worth of
  correspondence).
- **Depth per post** — rough scope of how much of the verified material it uses, so posts don't
  wildly vary between a paragraph and an essay.
- **Order** — sequence posts so prerequisite concepts come first (e.g. an architecture-overview
  post before a deep dive into one kernel), mirroring how `sortByReferenceOrder` orders paper
  reviews by prerequisite.
- **series** — one shared `series` frontmatter string tying the posts together (check existing
  `series:` values across posts first in case this topic already has one in progress).

Leftover material that doesn't cleanly fit any planned post yet stays in the knowledge store,
untouched, for a future planning pass — don't force it into a post it doesn't belong in.

## Step 4 — Write the plan

Write `.claude/knowledge/<topic-slug>/plan.md`: a table with columns order | title | slug | scope
(which note(s) it draws from) | series | status (`planned`), plus a short note on any material left
unplanned and why.

## Step 5 — Confirm before generating posts

Report the plan to the user — the series name, each post's title/scope/order, which notes were
excluded for failing verification — and get confirmation before drafting. This can spin up several
posts (and, if any gaps need filling, more `ml-systems-analyst` calls) at once, so don't proceed
silently.

## Step 6 — Run the plan

Once confirmed, for each `planned` entry in order:

1. Gather just that entry's assigned notes from the knowledge store.
2. If they don't yet cover everything the post needs, call `ml-systems-analyst` for the specific
   gap, persist the result as a new note (per `ml-systems-post-draft`'s Step 1.5 format), and
   re-verify its citations (Step 2) before using it.
3. Draft the post following the same conventions `ml-systems-post-draft` uses from Step 2 onward
   (slug/category/tags picks, body written from the notes' verified findings, `draft: true`,
   `series` set to the plan's series name) — write to `src/content/posts/ko/<slug>.md`.
4. Update that entry's `status` to `drafted` in `plan.md`, and mark the source note(s) `drafted` in
   `index.md`.

## Step 7 — Report

Summarize: series name and post order; file paths written; notes excluded/deferred and why; any
gaps that were filled with fresh `ml-systems-analyst` calls; and next steps — review each draft for
technical accuracy, flip `draft: false` when ready, and optionally run `translate-content` per post
once finalized.
