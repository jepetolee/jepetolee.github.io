---
name: knowledge-editor
description: Save, update, or delete knowledge in the .claude/knowledge/ store on direct instruction — either something the user states outright ("이거 knowledge에 저장해줘"), or a synthesis of something already established earlier in this conversation. Writes origin:user notes, distinct from the origin:agent notes ml-systems-post-draft persists. Use whenever the user explicitly asks to save/record/remember/update/remove something in the knowledge store — not for agent-derived code/paper analysis, which goes through ml-systems-post-draft instead.
---

# knowledge-editor

Writes what the user tells you to remember into the durable knowledge store at
`.claude/knowledge/<topic-slug>/` (see `.claude/knowledge/README.md`), as an `origin: user` note —
content taken on the user's own authority, not derived by an agent reading code/papers. This is the
manual counterpart to `ml-systems-post-draft`'s automatic `origin: agent` persistence.

This skill only acts on explicit instruction — it does not run in the background skimming the
conversation for things to save. If the user hasn't asked you to save/update/remove something in
the knowledge store, don't use this skill.

## Step 0 — Figure out exactly what's being saved

The content to save is either:
- **Stated directly**, right now, in the user's request, or
- **A reference to something already established** earlier in this conversation ("아까 얘기한 vLLM
  블록 크기 관련 내용 저장해줘").

For the second case, pull the *actual* prior content from the conversation — don't paraphrase
loosely or add anything that wasn't actually said/concluded. If you're not sure exactly which part
of the conversation the user means, ask rather than guessing at scope.

## Step 1 — Resolve the topic and note

Pick (or ask for) a topic slug — reuse an existing `.claude/knowledge/<topic-slug>/` if this
clearly continues an existing topic (check `.claude/knowledge/` for a matching directory), don't
create a near-duplicate topic dir for the same subject.

Within that topic, decide whether this is:
- A **new note** (`notes/<note-slug>.md`) — a distinct scope not already covered.
- An **update to an existing note** — grep `notes/*.md` for overlapping scope first; if the new
  information extends or corrects an existing note, edit that note in place rather than creating a
  near-duplicate.
- A **correction or removal** — if the user says a previously saved fact is wrong or should be
  deleted, locate the matching note(s) via `index.md`/grep and edit or delete them; don't just add a
  new note that contradicts the old one and leave both standing.

## Step 2 — Write the note

Format per `.claude/knowledge/README.md`'s note schema:

```markdown
---
scope: <what this note covers, specific enough to disambiguate from other notes on the same topic>
origin: user
sources:
  - <any real link the user gave, if any — omit the field entirely if there is none>
status: pending
---

<the actual content, in the user's terms — don't invent detail, examples, or justification the
user didn't actually provide, and don't silently upgrade a casual claim into a confident-sounding
technical assertion>
```

Never mark a `user`-origin note's content as independently verified, and never fabricate a
`sources` entry to make it look more grounded than it is — if the user gave no source, there is no
`sources` field, and that's fine; `origin: user` already signals what kind of claim this is (see
the Citation rule in `.claude/knowledge/README.md`).

## Step 3 — Update the manifest

Add/update the corresponding row in `.claude/knowledge/<topic-slug>/index.md` (note slug, scope,
origin, status). Create `index.md` if this is the first note for a new topic.

## Step 4 — Report

Tell the user: which file was created/updated/deleted, the topic slug, and a one-line recap of
what was saved (so they can catch a misunderstanding immediately rather than finding out when a
later post gets drafted from it). Mention this note is not published anywhere — it's only ever read
by other Claude Code skills/agents (`ml-systems-post-draft`, `knowledge-toc-plan`, and the drafting
skills' "referenced file" step) unless and until its content ends up folded into an actual post.
