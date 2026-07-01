# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An Astro-based, multilingual technical blog ("jepetolee's Insight") covering AI, reinforcement
learning, and data science, deployed to GitHub Pages. Content and UI strings are primarily
authored in Korean (`ko`), with translations for `en`, `es`, `ja`, `zh`, `ru`, `fr`, `de`.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro build && pagefind --site dist (search index requires this full build)
npm run preview  # preview the production build
```

There is no test suite or linter configured — verify changes with `npm run build` (Astro's
strict TS config, via `astro/tsconfigs/strict`, will surface type errors) and by checking pages
with `npm run dev`.

## Architecture

### Routing & i18n

Every route is generated under a locale prefix via `src/pages/[locale]/...` (e.g. `/ko/insight/`,
`/en/papers/`). `astro.config.mjs` sets `defaultLocale: 'ko'` with `prefixDefaultLocale: true` and
`redirectToDefaultLocale: false`; the root `src/pages/index.astro` handles auto-redirect based on
`navigator.language` plus a manual locale picker.

- `src/i18n/config.ts` — `LOCALES` tuple and `LOCALE_META` (per-locale label, html lang, BCP-47,
  Giscus lang, sitemap tag, og:locale, dir). Adding a language means updating this file, the
  `locales` list in `astro.config.mjs` (including the sitemap i18n mapping), and `src/i18n/ui.ts`.
- `src/i18n/ui.ts` — flat UI string dictionary keyed the same across all locales. Missing keys in
  a non-`ko` locale silently fall back to `ko`. Use `useTranslations(locale)` to get a `t(key,
  params)` function; params are interpolated via `{name}` placeholders.
- `src/i18n/utils.ts` — `getLocaleFromUrl`, `localizedPath(locale, path)`, and
  `switchLocalePath(pathname, targetLocale)` are the canonical way to build/convert locale-prefixed
  URLs; don't hand-roll path prefixing.

### Content collections and locale fallback

Content lives in `src/content/{posts,papers}/<locale>/<slug>.md(x)`, defined in
`src/content.config.ts` via `glob` loaders. A collection entry's `id` is `<locale>/<slug>`.

The key architectural detail: **translations share the same filename (slug) across locale
folders**, and `src/utils/posts.ts` resolves one entry per slug per requested locale, falling back
to `ko` then to any available locale when a translation is missing (`resolveByLocale`). Almost all
page/listing code should go through `getPublishedPosts(locale)` / `getPapers(locale)` rather than
calling `getCollection` directly, to get this fallback behavior for free.

`src/utils/posts.ts` also provides:
- `parseId` / `slugOf` — split/extract the locale-agnostic slug from a collection entry id.
- `sortByReferenceOrder` — topologically sorts paper reviews so a paper always appears after the
  prior-work reviews listed in its `references` (which are locale-agnostic slugs, no prefix).
- `getPaperCategoryTree` — builds category → subcategory → ordered-papers structure used by the
  papers index.
- `getPaperReferences` / `getPapersCiting` — resolve a paper's cited-by / citing relationships.
- `readingTime` — CJK-aware estimate (counts CJK chars separately from word tokens).

### Taxonomy (`src/taxonomy.ts`)

Defines the canonical tag vocabulary and metadata used across tag pages:
- `TOPIC_TAGS` — core subject-area tags (자연어 처리, 컴퓨터 비전, 강화학습, 월드 모델, etc.).
- `CONFERENCE_TAGS` / `COMPANY_TAGS` — standardized venue/organization tags, each with a
  description and `representativeResearchers` list, rendered on that tag's page grouped by year.
- `compareTags` / `CANONICAL_TAG_NAMES` (used by `getAllTags` in `posts.ts`) — canonical tag
  ordering so topic tags sort ahead of ad hoc detail tags.

When adding content, tag ordering convention: put core topic tag(s) first, then venue/company/
model/library detail tags after (see README.md for the full authoring guide in Korean).

### Site config

`src/config.ts` holds site metadata (`SITE`), top nav (`NAV`, keyed by `UIKey` from `ui.ts`), and
`SOCIAL` links. `SITE.giscus` needs `repoId`/`categoryId` filled in (via giscus.app) for comments
to work; GA4 id is also set here.

### Search

Pagefind indexes the built `dist/` output as a separate build step (`pagefind --site dist`, run
via `npm run build`). This means the search index is stale/absent unless you run a full build —
`npm run dev` alone won't populate it. `src/pages/[locale]/search.astro` loads the Pagefind UI
assets from `dist/pagefind/` and falls back to a hint message if the script isn't present.

### Math rendering

Markdown/MDX content supports `$...$` / `$$...$$` via `remark-math` + `rehype-katex`, configured
in `astro.config.mjs`.

### Legacy

`legacy/` contains the previous Jekyll-based version of the site, preserved for reference. It is
excluded from the TS project (`tsconfig.json`) and not part of the active Astro build.

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build`
and deploys `dist/` to GitHub Pages via `actions/deploy-pages`.
