# .claude/knowledge/

A durable, cross-session store for heavy analysis material that isn't itself a blog post — it's
raw material other Claude Code skills/agents accumulate and later decompose into one or more real
posts. Nothing under here is read by Astro (content collections only load from `src/content/`), so
this directory is never published.

This exists because some sources (e.g. PyTorch/vLLM/veRL-scale codebases analyzed by
`ml-systems-analyst`) are too large to fully analyze and turn into a post in one pass. Analysis
accumulates here across multiple runs/sessions, then a planning skill decides how to split it into
actual posts once there's enough material.

## Layout

```
.claude/knowledge/<topic-slug>/
  index.md            manifest: one row per note — slug, scope covered, source links, status
  notes/<note-slug>.md  one analysis note per subsystem/paper/angle analyzed so far
  plan.md              table-of-contents decomposition plan (written by knowledge-toc-plan),
                        listing the posts to be written from this topic's notes, their scope,
                        order, and draft status
```

`<topic-slug>` is a short kebab-case identifier for the overall subject (e.g. `vllm`, `verl-grpo`),
not any single post's slug.

## Note format

Each `notes/<note-slug>.md` file:

```markdown
---
scope: <what this note covers, e.g. "PagedAttention kv-cache management">
origin: agent   # agent | user
sources:
  - <durable permalink or arXiv URL used as evidence, if any>
status: pending   # pending | planned | drafted
---

<the actual findings — architecture, code-to-paper correspondence, divergences, open questions>
```

`origin: agent` means an agent (e.g. `ml-systems-analyst`) derived this by reading real code/papers
— its claims must carry durable citations (see below). `origin: user` means the user directly
asserted this (a fact, a decision, something said earlier in conversation) via `knowledge-editor` —
it may have no citation at all, since the source of truth is the user, not a fetched document.
Don't blur the two: never write an agent-derived claim as `origin: user` to skip citation, and don't
present a `user`-origin note as independently verified when it wasn't.

## Citation rule

For `origin: agent` notes, every claim must be traceable to a **durable** link — a GitHub permalink
pinned to a commit SHA (`.../blob/<sha>/path#Lstart-Lend`), not a local scratchpad path, and not a
bare "trust me". Scratchpad clones don't survive past the session that made them; a future agent
reading these notes has no way to verify an ephemeral local path. This is the mechanism that lets a
later planning/drafting step tell real findings apart from a hallucinated-sounding claim: if a
citation doesn't resolve, the claim doesn't get used.

`origin: user` notes are exempt from this — they're taken on the user's authority, not verified
against an external source — but stay labeled as such wherever they're used downstream.

## Who writes/reads this

- `ml-systems-post-draft` (research step) persists `ml-systems-analyst`'s findings here as it goes
  (`origin: agent`).
- `knowledge-editor` persists knowledge the user states directly, on request (`origin: user`).
- `knowledge-toc-plan` reads an entire topic's notes, verifies `agent`-origin citations, and writes
  `plan.md`.
- Drafting skills then write real posts to `src/content/posts/ko/`, referencing which notes each
  post came from.
