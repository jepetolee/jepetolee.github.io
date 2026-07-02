---
name: add-post-image
description: Adds an image to an existing post or paper review under src/content/{posts,papers}/ko/<slug>.md(x) — sourced from a PDF page/figure (e.g. an arXiv paper), a direct image URL, or a local file — saved under public/img/<slug>/ and embedded with a root-relative markdown image reference plus Korean alt text and source attribution. Use when the user asks to add a figure, image, screenshot, or diagram to a specific post/paper, names a PDF page or figure number to pull from, or gives an image URL/local path to embed.
---

# add-post-image

Adds one image to an already-existing post or paper review markdown file. This skill only
inserts images into content that already exists — it doesn't draft new posts (see
`paper-review-draft`, `web-post-draft`, `knowledge-post-draft`, `repo-analysis-draft` for that).

No post or paper in this blog currently embeds any image — this is the first-of-its-kind
convention, so follow this skill's placement rules exactly (root-relative `/img/<slug>/...` path,
matching how `public/logo.png` is already referenced elsewhere in the codebase) rather than
inventing a different layout.

## Step 0 — Resolve the target file and the image source

- **Target file**: the user should name a post/paper (slug or path). If only a slug is given,
  check both `src/content/posts/ko/<slug>.md(x)` and `src/content/papers/ko/<slug>.md` for a
  match; if both exist, ask which. If the file doesn't exist, tell the user and stop rather than
  guessing.
- **Image source** — one of:
  - **PDF figure/page**: a PDF already fetched earlier in this conversation (e.g. an arXiv paper
    reviewed via `paper-review-draft`), an arXiv URL/ID, or a local PDF path, plus which figure or
    page number to pull. If the user names a paper but not a page/figure number, ask.
  - **Direct image URL**: a link ending in an image extension, or a webpage the user says
    contains the image they want.
  - **Local file**: already on disk (e.g. a screenshot the user saved to the scratchpad).
- If the source is ambiguous (e.g. "이 논문에 그림 하나 추가해줘" with no figure number), ask before
  fetching anything.

## Step 1 — Determine the slug and asset directory

The asset directory is **`public/img/<slug>/`**, where `<slug>` is the locale-agnostic filename
stem of the target file (same slug convention as `parseId`/`slugOf` in `src/utils/posts.ts` — the
part shared across all locale folders for that post/paper). Create the directory if it doesn't
exist yet (`public/img/` itself already exists, empty, in this repo).

Images are **not** locale-specific: the same `public/img/<slug>/` directory and file paths are
reused across every translated version of that post/paper. `translate-content` only needs to
translate the alt text and caption, never move or duplicate the image file (it already documents
"keep link/image URLs and slugs unchanged; translate link text and image alt text").

## Step 2 — Obtain the raw image

**Case A — PDF page/figure:**

1. If the PDF isn't already sitting in the scratchpad from earlier in this conversation, fetch it
   there first (never write a fetched PDF directly into the repo). For arXiv, use
   `https://arxiv.org/pdf/<id>`.
2. Try extracting the embedded raster image directly first — this avoids capturing surrounding
   page text/margins:
   ```
   pdfimages -png -f <page> -l <page> <pdf> <scratchpad-prefix>
   ```
   Use the Read tool to preview each extracted PNG and confirm which one is the intended figure.
3. If `pdfimages` yields nothing usable (common for vector-drawn figures — line charts, diagrams,
   architecture boxes), fall back to rendering the whole page at high resolution and cropping:
   ```
   pdftoppm -f <page> -l <page> -r 300 -png <pdf> <scratchpad-prefix>
   convert <page>.png -crop <WxH+X+Y> +repage <cropped>.png
   ```
   View the rendered page with Read, estimate the figure's bounding box, crop, then re-view the
   crop and adjust the geometry until it tightly bounds the figure and its caption (iterate —
   don't guess once and move on).
4. Note the paper title/authors and figure number for the attribution line in Step 4.

**Case B — direct image URL:** download to the scratchpad with
`curl -sL -o <scratchpad-path> <url>`, then verify it's actually image bytes (`file <path>`) and
not an HTML error page before proceeding.

**Case C — local file:** use as-is, no fetch needed.

## Step 3 — Normalize and place the file

- **Filename**: kebab-case, descriptive of the figure's content, not a bare `figure1` — e.g.
  `fig2-architecture.png`, `fig4-training-curves.png`. Prefix numbered paper figures with
  `fig<N>-` to keep the source figure number traceable.
- **Size**: `public/` assets bypass Astro's image pipeline entirely — nothing here gets
  automatically resized or compressed, so an oversized source directly inflates page weight and
  repo size. Cap the longest side at ~1600px if it exceeds that:
  ```
  convert <src> -resize '1600x1600>' <dest>
  ```
- Move the final file into `public/img/<slug>/<filename>` and delete scratchpad intermediates once
  confirmed correct. Don't leave half-cropped attempts lying around in `public/`.

## Step 4 — Insert into the markdown

- Reference the image with a **root-relative path**: `/img/<slug>/<filename>` (this repo has no
  `base` set in `astro.config.mjs`, and existing static assets like `/logo.png` are already
  referenced root-relative the same way — don't make the path relative to the md file).
- Insert at the position the user specified (e.g. "Method 섹션 아래"), or immediately after the
  paragraph/heading that discusses what the figure shows if unspecified — ask if genuinely
  unclear.
- Form (Korean alt text and caption, matching this blog's language):
  ```markdown
  ![<이미지 내용을 설명하는 한국어 alt 텍스트>](/img/<slug>/<filename>)
  *출처: <paper title 또는 사이트명>, Figure <N>*
  ```
  Omit the caption line only when the image is the user's own screenshot/asset with no external
  source to credit.
- Only edit the `ko` file. If translated versions of this post/paper already exist under other
  locale folders, they will not pick up this change automatically — flag that in Step 5.

## Step 5 — Report

Tell the user: the image path saved under `public/img/<slug>/`; which markdown file and location
was edited; the source/attribution used; and, if other-locale versions of this post/paper exist,
that `translate-content` should be re-run (or manually re-run for just the new alt text/caption
line) so they pick up the same image reference.
