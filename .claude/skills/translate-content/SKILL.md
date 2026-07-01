---
name: translate-content
description: Translate a Korean blog post or paper review under src/content/{posts,papers}/ko/ into all other supported locales (en, es, ja, zh, ru, fr, de), writing one file per locale with the same filename. Use when the user asks to translate a post/paper, add other-language versions of a Korean article, or fill in missing translations.
---

# translate-content

Translates a Korean source article (blog post or paper review) into every other locale this site
supports, producing one file per locale under the matching content folder — mirroring this
project's translation convention: **same filename (slug), different locale folder.**

## Supported locales

Target locales (from `src/i18n/config.ts`): `en`, `es`, `ja`, `zh`, `ru`, `fr`, `de`.
Source is always `ko` (`DEFAULT_LOCALE`).

## Step 1 — Resolve the source file

The skill argument may be a full path, a path relative to `src/content/`, or a bare slug.
Resolve it to exactly one of:

- `src/content/posts/ko/<slug>.md` or `.mdx`
- `src/content/papers/ko/<slug>.md` or `.mdx`

If the slug exists in both collections, or doesn't exist in either, ask the user to disambiguate
instead of guessing. Read the file once with the Read tool.

## Step 2 — Parse frontmatter vs. body

Split the file into YAML frontmatter and Markdown/MDX body. Frontmatter fields differ by
collection — see `src/content.config.ts` for the authoritative schema. Handle fields as follows:

**Translate the natural-language fields:**
- `title`, `description`
- `tldr[]`, `prerequisites[]` (posts)
- `category`, `subcategory` (papers — see consistency note below)
- `series` (posts — see consistency note below)

**Never translate — copy verbatim:**
- `tags[]` — these are canonical identifiers from `src/taxonomy.ts` used for tag-page routing and
  cross-locale tag counting (`getAllTags` in `src/utils/posts.ts`). Translating a tag breaks the
  tag page for that locale. Topic tags happen to be Korean strings (e.g. `자연어 처리`) and
  conference/company tags are English acronyms/names (e.g. `NeurIPS`, `OpenAI`) — both stay as-is
  in every locale's frontmatter.
- `references[]` (papers) — these are locale-agnostic slugs, not display text.
- `authors`, `venue`, `paper` (papers) — proper nouns / citation strings, not translated.
- `date`, `year`, `featured`, `draft`, `paperUrl` — non-text values, copy unchanged.

**Consistency checks before translating `series` / `category` / `subcategory`:**
- `series`: if other posts share this exact Korean `series` value, check whether any of them
  already have a translation in the target locale folder, and reuse that exact translated string.
  `getSeries()` groups posts by an exact string match per locale — an inconsistent translation
  silently splits the series into two groups on that locale's series page.
- `category` / `subcategory` (papers): similarly, prefer reusing an existing translation of the
  same source string elsewhere in that locale, so `getPaperCategoryTree()` groups papers under one
  category/subcategory heading instead of near-duplicates.

## Step 3 — Translate the body

- Keep fenced code blocks (` ``` `) and inline code (`` `code` ``) byte-for-byte unchanged.
- Keep KaTeX math (`$...$` and `$$...$$`) byte-for-byte unchanged.
- Keep link/image URLs and slugs unchanged; translate link text and image alt text.
- Keep any embedded MDX components/HTML tags and their props unchanged; translate only the
  human-readable text they wrap.
- Preserve Markdown structure: heading levels, list/table shape, blockquotes, footnote markers.
- Match the tone of this blog: technical, direct, written for an AI/ML-literate reader — avoid
  over-explaining basic terms that the Korean source doesn't over-explain.

## Step 4 — Write output files

For each target locale, write to `src/content/<collection>/<locale>/<same-filename-and-extension>`.

Before overwriting, check whether the target file already exists. If it does, tell the user it
will be overwritten (it may have been hand-edited) and get confirmation before proceeding, unless
the user's request already made clear they want existing translations regenerated.

## Step 5 — Report

Summarize: which locale files were created vs. overwritten, which frontmatter fields were left
untranslated by design (tags, references, authors, venue, paper), and any `series`/`category`
consistency decisions made (reused an existing translation vs. coined a new one).
