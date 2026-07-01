---
name: web-post-draft
description: Given a general website URL (article, docs, GitHub repo, product page, blog post — anything that isn't an arXiv paper), fetch and analyze it, then draft a Korean blog post markdown file under src/content/posts/ko/ following this site's post conventions, with draft:true for the user to review before publishing. Use when the user pastes a non-arXiv link and asks for a post, write-up, summary, or analysis to be drafted. For arXiv paper links, use paper-review-draft instead.
---

# web-post-draft

Reads a general website (not an arXiv paper — see `paper-review-draft` for that) and produces a
first-draft blog post in this blog's established format, written to
`src/content/posts/ko/<slug>.md` with `draft: true` — handed to the user for editing, not
auto-published.

## Step 0 — Is this actually an arXiv link?

If the URL is `arxiv.org` (or resolves to one, e.g. a redirect), stop and use the
`paper-review-draft` skill instead — it has the correct frontmatter schema (`papers` collection,
not `posts`) and citation conventions for papers.

## Step 0.5 — Check for a referenced file

If the user's request also names a specific file to read (a path under `.claude/knowledge/<topic>/`,
or any other local file), read it with the Read tool before fetching the URL. If it's a
knowledge-store note (see `.claude/knowledge/README.md`), treat its findings and durable source
links as already-verified prior work — don't re-derive what it already covers. Then continue to
Step 1, fetching the URL to fill in whatever the referenced file doesn't already cover.

## Step 1 — Fetch and read the source

Fetch the URL with WebFetch and read the actual content — title, author/org, publish date if
available, and the full body (not just the opening paragraph).

**If the page is long or multi-page** (a full doc site, a long GitHub README plus linked docs, a
multi-part article), don't pull all of it into the main conversation. Instead, delegate the
fetch-and-read step to a `general-purpose` subagent via the Agent tool: give it the URL(s) and ask
it to return a condensed structured summary — key claims, notable quotes, data/numbers, code
snippets worth citing — rather than raw page text. Then draft from that summary. This keeps the
raw HTML/markdown out of your own context. For a single normal-length page, just WebFetch it
directly yourself; delegating is only worth it when the source is large.

Before writing anything, check whether this source is already covered: grep the URL's domain or
the likely topic across `src/content/posts/*/*.md*` (title/description) to avoid an accidental
duplicate. If something close already exists, tell the user and ask whether they want a new post
or a revision of the existing one.

## Step 2 — Pick a slug, category, and tags

- **Slug**: short kebab-case, derived from the post's own topic/title (not the source site's
  name) — check `src/content/posts/ko/` for collisions.
- **category**: freeform string (see `content.config.ts` — posts don't have a fixed enum, unlike
  papers). Grep existing posts' `category:` values first and reuse one if this post genuinely
  fits it, so listing/filtering pages don't fragment into near-duplicate categories. Only coin a
  new category if nothing fits.
- **tags**: topic tag(s) from `TOPIC_TAGS` in `src/taxonomy.ts` first, then venue/company/
  model/library detail tags after, per the README tag-ordering convention. Use canonical
  spellings from `CONFERENCE_TAGS` / `COMPANY_TAGS` for any venue/company mentioned.
- **series**: leave unset unless the user says this post continues an existing series (e.g. an
  ongoing project log) — check `series:` values across existing posts for an exact-string match
  before reusing one, same reasoning as `translate-content`'s series consistency check.
- **featured**: leave `false` unless the user asks to feature it.

## Step 3 — Write the post body

This blog's existing posts (`src/content/posts/ko/*.md`) are personal, first-person project logs
— but a post drafted from analyzing an external source should read as **analysis/commentary**,
not a paraphrase of the source. Write for the same AI/ML-literate technical audience as the rest
of the blog:

- Open with why this source is worth writing about (what problem it addresses, what's new).
- Cover the actual substantive content — architecture, method, data, results, design decisions —
  not just a restatement of the source's own summary/marketing copy.
- Add your own take: what's convincing, what's missing, how it compares to related things already
  covered on this blog (link with `[title](/insight/<slug>/)` or `[title](/papers/<slug>/)` when
  relevant — check for real matches, don't invent links).
- Cite the source with a real link at least once; don't present its claims as verified fact if the
  source itself is a marketing page or unverified blog post — say so.
- Preserve code blocks and KaTeX math (`$...$`, `$$...$$`) byte-accurate to what you're quoting.

## Step 4 — Write the file

Write to `src/content/posts/ko/<slug>.md` with `draft: true` always. Frontmatter fields per
`content.config.ts`: `title`, `date` (today), `category`, `tags`, `series` (optional),
`featured` (default false), `description`, `tldr` (optional, 2-4 bullet highlights), and
`prerequisites` (optional, only if real background knowledge is needed to follow the post).

If a file at that path already exists, tell the user it will be overwritten and confirm first.

## Step 5 — Report

Tell the user: file path written; source URL analyzed; `category`/`series` reused vs. newly
coined and why; `tags` chosen; and next steps — review for technical accuracy and voice, flip
`draft: false` when ready to publish, and optionally run `translate-content` afterward once the
Korean draft is finalized.
