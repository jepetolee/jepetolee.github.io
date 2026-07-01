---
name: ml-systems-post-draft
description: Analyze a heavy ML systems library (PyTorch, vLLM, veRL, DeepSpeed, Megatron-LM, and similar training/inference frameworks) cross-referenced against its source paper(s), by delegating the deep code+paper reading to the ml-systems-analyst subagent, then draft a Korean blog post from its findings. Writes to src/content/posts/ko/ following this site's post conventions, with draft:true for the user to review before publishing. Use when the user wants a post about a heavy systems library's real implementation vs. the paper(s) it's based on — not for lightweight repos (use repo-analysis-draft) or single papers with no code angle (use paper-review-draft).
---

# ml-systems-post-draft

Delegates the actual code-reading and code-vs-paper cross-referencing to the `ml-systems-analyst`
subagent (read-only, Opus-tier, built for exactly this: heavy systems libraries like PyTorch,
vLLM, veRL, DeepSpeed, Megatron-LM traced against the papers they implement), then turns its
findings into a first-draft blog post at `src/content/posts/ko/<slug>.md` with `draft: true` —
handed to the user for editing, not auto-published.

`ml-systems-analyst` has no `Write`/`Edit` access by design (read-only, so it's safe to point at
large unfamiliar codebases without risk of it running or modifying anything) — it returns a
structured report, and **this skill runs in the main conversation to do the actual file-writing**.

## Step 0 — Confirm this is the right skill

If the target is a small/simple repo with no meaningful paper cross-reference angle, use
`repo-analysis-draft` instead — it's cheaper and doesn't need Opus. If the target is a single paper
with no reference implementation worth reading, use `paper-review-draft` instead. This skill is for
the specific case of a heavy systems library where the value is in verifying the paper's method
against the actual (often diverging) implementation.

## Step 0.5 — Check for a referenced file

If the user's request names a specific file to read first (most likely a note under
`.claude/knowledge/<topic-slug>/notes/`, but possibly any other local file), read it with the Read
tool before calling `ml-systems-analyst`. If it's an existing knowledge-store note that already
covers the requested angle, its findings and durable permalink citations are already-verified —
skip straight to Step 2 and draft from it directly, without spending a new agent call. Only call
`ml-systems-analyst` (Step 1) for whatever the referenced file doesn't already cover.

## Step 1 — Delegate the research

Call the `ml-systems-analyst` subagent via the Agent tool. Give it in the prompt:

- The repo URL (and branch/tag/commit if the user specified one).
- The paper(s) to cross-reference, if the user named them — otherwise ask the agent to identify
  the relevant paper(s) itself from the repo's docs/citations.
- The specific angle the user wants (e.g. "PagedAttention 구현", "GRPO 학습 루프 전체 아키텍처") —
  if the user's ask is broad ("vLLM 분석해줘"), ask them to narrow it before spending an Opus call,
  since these codebases are large and an unscoped analysis will be shallow.

For genuinely broad requests (e.g. "이 라이브러리 전체 아키텍처와 논문 근거를 다 정리해줘"), it's
fine to call the agent more than once for different subsystems/papers and combine the reports
yourself before drafting — don't try to force one call to cover everything.

Before spending the call, grep `src/content/posts/*/*.md*` and `src/content/papers/*/*.md*` for
the library/paper name to check for existing coverage. If something close exists, tell the user and
ask whether they want a new angle (cross-link it) or a revision instead.

## Step 1.5 — Persist the findings before drafting

Always write the agent's report(s) into the durable knowledge store before turning them into a
post — see `.claude/knowledge/README.md` for the format. Pick (or reuse) a topic slug for the
library/subject, e.g. `.claude/knowledge/vllm/`, and for each `ml-systems-analyst` call:

- Write/append `.claude/knowledge/<topic-slug>/notes/<note-slug>.md` with the report's scope,
  durable permalink sources, and findings, `status: pending`.
- Update `.claude/knowledge/<topic-slug>/index.md` with a row for the new note.

This is what makes the analysis reusable across sessions instead of disappearing once this
conversation ends, and it's required input for `knowledge-toc-plan` if this topic later grows into
a multi-post series.

**If, once persisted, the accumulated notes for this topic are clearly more than one post's worth**
(the user asked for a broad survey, or you can see this is the 3rd+ note accumulating for the same
topic slug), stop here instead of drafting directly — tell the user the material now warrants
running the `knowledge-toc-plan` skill to decompose it into a series, rather than cramming
everything into one post or arbitrarily picking a slice.

For a single, narrowly-scoped ask, continue to Step 2 and draft directly from the note(s) just
written.

## Step 2 — Pick a slug, category, and tags

- **Slug**: short kebab-case from the library + the specific angle analyzed (not just the library
  name, if this is a narrow deep-dive) — check `src/content/posts/ko/` for collisions.
- **category**: freeform string (see `content.config.ts`). Grep existing posts' `category:` values
  and reuse one if this genuinely fits; only coin a new one if nothing does.
- **tags**: topic tag(s) from `TOPIC_TAGS` in `src/taxonomy.ts` first, then venue/company/model/
  library detail tags after, per the README tag-ordering convention. Use canonical spellings from
  `CONFERENCE_TAGS` / `COMPANY_TAGS` for any venue/company mentioned (e.g. the org behind the
  library, the conference the paper appeared at).
- **series**: leave unset unless the user says this continues an existing series — check existing
  `series:` values for an exact-string match first.
- **featured**: leave `false` unless asked to feature it.

## Step 3 — Write the post body from the persisted note

Use the persisted note's (Step 1.5) findings as the factual basis — don't re-derive or guess at code
behavior yourself; if something is unclear, call the agent again with a narrower follow-up rather
than filling the gap from general knowledge. Write for this blog's usual AI/ML-literate audience:

- Open with what the paper claims and why the implementation is worth checking against it.
- Walk through the actual code-to-paper correspondence the agent found: real code excerpts
  (byte-accurate, with file paths) next to the paper's method/equations (KaTeX `$...$`/`$$...$$`).
- Foreground the divergences — this is usually the most interesting part: where the systems code
  takes shortcuts, optimizes differently, or extends beyond what the paper describes, and why
  (performance, memory, hardware constraints).
- Note anything the agent flagged as unverified/unclear rather than presenting it as confirmed.
- Add a real point of view and cross-link related posts/papers already on this blog
  (`[title](/insight/<slug>/)` / `[title](/papers/<slug>/)`) when a real match exists from the
  Step 1 grep.
- Link the repo and paper(s), and note the commit/ref analyzed since these libraries move fast.

## Step 4 — Write the file

Write to `src/content/posts/ko/<slug>.md` with `draft: true` always. Frontmatter fields per
`content.config.ts`: `title`, `date` (today), `category`, `tags`, `series` (optional), `featured`
(default false), `description`, `tldr` (optional), `prerequisites` (optional — these posts usually
assume real background, e.g. "PPO/GRPO에 대한 기본 이해", so fill this in more often than not).

If a file at that path already exists, tell the user it will be overwritten and confirm first.

Update the note(s) in `.claude/knowledge/<topic-slug>/` this post was drafted from: set
`status: drafted` and record the resulting post slug, so `knowledge-toc-plan` (or a future run of
this skill) knows this material has already been turned into a post.

## Step 5 — Report

Tell the user: file path written; which `ml-systems-analyst` call(s) were made and what they
covered; where the findings were persisted under `.claude/knowledge/`; `category`/`series` reused
vs. newly coined and why; `tags` chosen; any findings the agent flagged as unverified that they
should double-check; and next steps — review for technical accuracy, flip `draft: false` when
ready, and optionally run `translate-content` afterward.
