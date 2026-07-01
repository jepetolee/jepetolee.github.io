---
name: repo-analysis-draft
description: Given a GitHub (or other public git host) repository link, clone it and read the actual source code — not just the README — then draft a Korean blog post analyzing its real architecture and implementation. Writes to src/content/posts/ko/ following this site's post conventions, with draft:true for the user to review before publishing. Use when the user pastes a repo link and wants the source code itself explored/analyzed, as opposed to web-post-draft which works from the repo's rendered page/README only.
---

# repo-analysis-draft

Clones a git repository and reads its actual source files (not the marketing/README surface),
then produces a first-draft blog post reflecting the real implementation — written to
`src/content/posts/ko/<slug>.md` with `draft: true`, handed to the user for editing, not
auto-published.

## Step 0 — Confirm this is a source-code exploration task

If the link is `arxiv.org`, use `paper-review-draft` instead. If the user just wants a summary of
a repo's README/landing page (no interest in the actual code), `web-post-draft` already covers
that via WebFetch and is cheaper — use this skill specifically when the value is in reading real
implementation code: architecture, algorithms, data flow, notable design choices.

## Step 0.5 — Check for a referenced file

If the user's request also names a specific file to read first (a path under
`.claude/knowledge/<topic>/`, or any other local file), read it with the Read tool before cloning
anything. If it's a knowledge-store note (see `.claude/knowledge/README.md`) that already analyzed
this repo, treat its findings and durable permalink citations as already-verified — skip re-reading
whatever it already covers, and clone/read only to fill gaps or verify a specific new question.

## Step 1 — Clone the repo

Clone into the scratchpad directory (never into this project's working tree):

```bash
git clone --depth 1 <repo-url> /tmp/claude-*/.../scratchpad/<repo-name>
```

Use the actual scratchpad path given in your environment, not a literal `/tmp`. For a specific
branch/tag/commit the user mentioned, add `--branch <ref>`. If the clone fails (private repo, auth
required, rate-limited), tell the user rather than guessing credentials.

If the repo is very large (monorepo, huge history even at depth 1), don't read it wholesale —
proceed to Step 2 to scope down before reading file contents.

## Step 2 — Map the structure before reading code

Get the shape first: language(s), build/package manifest (`package.json`, `pyproject.toml`,
`Cargo.toml`, `go.mod`, etc.), entry points, directory layout (`find`/`ls` — not a full recursive
dump for large repos). Skim the README for stated purpose and architecture claims, but treat it as
a hypothesis to verify against the actual code, not as the source of truth.

Then decide what's actually worth reading in depth. If the user asked about something specific
(an algorithm, a module, "how does X work"), scope to the files that implement it. If the user
wants a general architecture overview, identify the 3-6 files/modules that carry the real design
(core logic, not generated code, vendored deps, or boilerplate config).

**For a large repo**, delegate the deep-read to a `general-purpose` subagent via the Agent tool:
point it at the cloned path and the specific files/modules to read, and ask it to return a
condensed structured summary — actual function/class responsibilities, data flow between modules,
notable algorithms with real code excerpts, anything surprising vs. what the README claims — not
a restatement of file names. This keeps raw source dumps out of your own context. For a small,
focused repo or a single file of interest, just Read it directly yourself.

Before writing anything, check whether this repo is already covered: grep the repo name/URL across
`src/content/posts/*/*.md*`. If something close already exists, tell the user and ask whether they
want a new post or a revision.

## Step 3 — Check the license before quoting code

Read the `LICENSE`/`LICENSE.md` file (or note its absence). Quote only the specific snippets that
illustrate a real point being made — not whole files — and attribute them (repo name/link,
license) the way `icrl.md` credits a referenced Dreamer implementation. If the repo has no license
file or an unusual/restrictive one, say so explicitly to the user in the Step 6 report rather than
quoting freely.

## Step 4 — Pick a slug, category, and tags

- **Slug**: short kebab-case from the project's own name/topic — check `src/content/posts/ko/`
  for collisions.
- **category**: freeform string (see `content.config.ts`). Grep existing posts' `category:` values
  and reuse one if this genuinely fits; only coin a new one if nothing does.
- **tags**: topic tag(s) from `TOPIC_TAGS` in `src/taxonomy.ts` first, then venue/company/model/
  library detail tags after, per the README tag-ordering convention. Use canonical spellings from
  `CONFERENCE_TAGS` / `COMPANY_TAGS` for any venue/company mentioned.
- **series**: leave unset unless the user says this continues an existing series — check existing
  `series:` values for an exact-string match first.
- **featured**: leave `false` unless asked to feature it.

## Step 5 — Write the post body

Write for this blog's usual AI/ML-literate technical audience, and make it read as **code
analysis**, not a paraphrase of the README:

- Open with what the project actually does and why its implementation is worth digging into.
- Walk through the real architecture: core modules/classes and their responsibilities, how control
  and data flow between them, the algorithms/techniques actually implemented (with real code
  excerpts, byte-accurate to the source — never reconstruct a snippet from memory of "typical"
  code) and real equations in KaTeX (`$...$`/`$$...$$`) where the code implements known math.
- Call out anything notable: a clever or unusual design choice, a mismatch between what the docs
  claim and what the code does, a limitation or rough edge you found reading it.
- Add a real point of view — how this compares to related implementations/papers already covered
  on this blog, linking with `[title](/insight/<slug>/)` or `[title](/papers/<slug>/)` when a real
  match exists (don't invent links).
- Link the repo itself at least once, and note the commit/tag analyzed if the repo is actively
  changing (so the post doesn't silently drift from what's now in the repo).

## Step 6 — Write the file and clean up

Write to `src/content/posts/ko/<slug>.md` with `draft: true` always. Frontmatter fields per
`content.config.ts`: `title`, `date` (today), `category`, `tags`, `series` (optional), `featured`
(default false), `description`, `tldr` (optional), `prerequisites` (optional).

If a file at that path already exists, tell the user it will be overwritten and confirm first.

The cloned repo lives only in the scratchpad directory and needs no manual cleanup, but you may
`rm -rf` it once the draft is written if it's large.

## Step 7 — Report

Tell the user: file path written; repo/ref analyzed; `category`/`series` reused vs. newly coined
and why; `tags` chosen; license situation and how quoting was handled; and next steps — review for
technical accuracy, flip `draft: false` when ready to publish, and optionally run
`translate-content` afterward once the Korean draft is finalized.
