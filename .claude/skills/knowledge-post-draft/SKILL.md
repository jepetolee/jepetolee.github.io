---
name: knowledge-post-draft
description: Draft a Korean blog post on a topic from foundational/existing knowledge — no source paper or URL involved. Writes to src/content/posts/ko/ following this site's post conventions, with draft:true for the user to review before publishing. Use when the user asks for a write-up, explainer, or opinion post about a concept, technique, or topic (e.g. "PPO 설명하는 글 써줘", "트랜스포머 아키텍처 정리 글") without pasting a link. For an arXiv link use paper-review-draft; for any other URL use web-post-draft.
---

# knowledge-post-draft

Writes a first-draft blog post on a topic using existing/foundational knowledge — not a summary
of one specific paper or webpage — to `src/content/posts/ko/<slug>.md` with `draft: true`, handed
to the user for editing, not auto-published.

## Step 0 — Is there actually a source to work from?

If the user pasted or referenced a specific arXiv link, use `paper-review-draft` instead. If they
pasted or referenced any other specific URL, use `web-post-draft` instead. This skill is for the
remaining case: the user wants a post built from general knowledge of a topic (a concept,
algorithm, architecture, technique, comparison, or opinion), not a write-up of one external source.

## Step 0.5 — Check for a referenced file

If the user also points you to a specific file to read first (a path under
`.claude/knowledge/<topic>/`, or any other local file), read it with the Read tool before writing
anything — this counts as grounding material even though this skill is otherwise for source-less
posts. Treat a knowledge-store note's findings and durable source links (see
`.claude/knowledge/README.md`) as verified: for whatever it covers, its claims override the
knowledge-cutoff caution in Step 2 below, since it's already backed by real checkable sources
rather than unaided memory.

## Step 1 — Scope the topic

If the request is already specific (e.g. "PPO의 clipping 메커니즘 설명하는 글"), proceed directly.
If it's broad or ambiguous (e.g. "강화학습에 대한 글 써줘"), ask 1-2 clarifying questions before
writing — the angle (intro/explainer vs. deep dive vs. comparison vs. opinion), and the intended
depth/audience (assume this blog's regular AI/ML-literate reader unless told otherwise).

Grep `src/content/posts/*/*.md*` and `src/content/papers/*/*.md*` (title/description) for the
topic first. If this blog has already covered it, tell the user and ask whether they want a new
angle on it (and to cross-link), a revision of the existing piece, or to proceed anyway.

## Step 2 — Mind the knowledge cutoff

This is drafted from training knowledge, not a fetched source — there is nothing to cite for
freshness. Before asserting anything time-sensitive (a model/library's current version, latest
benchmark numbers, "as of" claims, recent releases, org/product names that change hands), either:

- leave it out or phrase it qualitatively (e.g. "당시 기준" / "초기 버전에서는") instead of stating
  a specific figure you're not certain of, or
- if the fact is important to the post and verifiable, use WebSearch/WebFetch to confirm it rather
  than asserting from memory.

Never invent a citation, benchmark number, or equation to fill a gap — describe it qualitatively
or flag the uncertainty to the user in the Step 5 report instead.

## Step 3 — Pick a slug, category, and tags

- **Slug**: short kebab-case derived from the post's own topic (not a source name) — check
  `src/content/posts/ko/` for collisions.
- **category**: freeform string (see `content.config.ts` — posts don't have a fixed enum). Grep
  existing posts' `category:` values first and reuse one if this post genuinely fits, so
  listing/filtering pages don't fragment into near-duplicate categories. Only coin a new category
  if nothing fits.
- **tags**: topic tag(s) from `TOPIC_TAGS` in `src/taxonomy.ts` first, then venue/company/model/
  library detail tags after, per the README tag-ordering convention. Use canonical spellings from
  `CONFERENCE_TAGS` / `COMPANY_TAGS` for any venue/company mentioned.
- **series**: leave unset unless the user says this continues an existing series — check existing
  `series:` values for an exact-string match before reusing one.
- **featured**: leave `false` unless the user asks to feature it.

## Step 4 — Write the post body

Write for the same AI/ML-literate technical audience as the rest of the blog, in this blog's
first-person voice (see `src/content/posts/ko/*.md` for tone reference):

- Open with why the topic matters or why it's worth writing about — not a dictionary-style
  definition lead.
- Cover the actual substance — mechanism, math, trade-offs, design reasoning — not a shallow
  restatement of what a search-engine snippet would say. Real equations in KaTeX (`$...$` /
  `$$...$$`) where they clarify the mechanism; if unsure of the exact form, describe it in words
  rather than writing a wrong formula.
- Add a real point of view: what's underrated/overrated about it, where it breaks down, how it
  compares to related things already covered on this blog — link with
  `[title](/insight/<slug>/)` or `[title](/papers/<slug>/)` when a real match exists from the
  Step 1 grep (don't invent links).
- This is not a review of one source, so there's no single citation to anchor it — but if specific
  claims were verified via WebSearch in Step 2, link those sources inline.

## Step 5 — Write the file

Write to `src/content/posts/ko/<slug>.md` with `draft: true` always. Frontmatter fields per
`content.config.ts`: `title`, `date` (today), `category`, `tags`, `series` (optional), `featured`
(default false), `description`, `tldr` (optional, 2-4 bullet highlights), and `prerequisites`
(optional, only if real background knowledge is needed to follow the post).

If a file at that path already exists, tell the user it will be overwritten and confirm first.

## Step 6 — Report

Tell the user: file path written; `category`/`series` reused vs. newly coined and why; `tags`
chosen; any claims flagged as uncertain/qualitative due to the knowledge cutoff (Step 2) that they
should double-check; and next steps — review for technical accuracy and voice, flip `draft: false`
when ready to publish, and optionally run `translate-content` afterward once the Korean draft is
finalized.
