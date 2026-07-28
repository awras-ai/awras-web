# Awras frontend — agent guide

Paths in this file are repo-root-relative (`frontend/…`), so they can be pasted straight
into a terminal from the repo root. Commands assume you are in `frontend/`.

Design tokens, type scale and component patterns: `frontend/DESIGN_SYSTEM.md`.

**Writing or editing a blog post?** Jump to [Blog articles](#blog-articles). Everything
under that heading applies only to `frontend/content/blog/*.mdx` — don't apply its prose
and voice rules to React components.

---

# Blog articles

Every `.mdx` file in `frontend/content/blog/` is a published article. This section is the
contract for writing one. Read it before creating or editing a post.

**A new article means two files, not one.** When a user asks you to create a post, write
both `frontend/content/blog/{slug}.mdx` (English) and
`frontend/content/blog/ar/{slug}.mdx` (Arabic) in the same pass — see
[Translating a post (Arabic)](#translating-a-post-arabic) for what to translate vs. copy.
Don't ship the English file alone and treat Arabic as a follow-up unless the user
explicitly asks for one locale only.

The article body's design system lives in `frontend/components/blog/mdx/`.

---

## The two hard rules

**1. Never put a `style` attribute in an `.mdx` file.** The MDX compiler silently drops
it. `<div style={{ background: "var(--accent-brand)" }} />` compiles to
`<div></div>` — no error, no warning, just an invisible element. This has already
shipped a broken article once.

**2. Never put Tailwind classes or layout `<div>`s in an `.mdx` file.** Wrapping markdown
in JSX produces invalid nested `<p>` tags — `<p class="…"><p>text</p></p>` — which the
browser auto-closes, detaching your styling entirely.

Everything visual is already handled. Write semantic content; if you need a look that
doesn't exist yet, **add a component to `frontend/components/blog/mdx/`** and register it
in that directory's `index.tsx`. Do not inline it in the post.

---

## Frontmatter

Required on every post. Fields map to `Post` in `frontend/lib/types/blog.ts`.

```yaml
---
category: "research" # research | product | community — nothing else
title: "Sentence-case title, ending with a period."
excerpt: "One or two sentences. Shown on the card and as the article subhead."
author: "Full Name"
date: "2026-07-14" # YYYY-MM-DD
readTime: 12 # integer, minutes
featured: false # exactly ONE post across all posts may be true
image: "/blog/some-image.jpg" # optional; omit and a placeholder slot renders
imageCaption: "Photo credit or context." # optional; only shows when image is set
---
```

Notes:

- The **filename is the slug**. `introducing-awras-chat-v0.mdx` → `/blog/introducing-awras-chat-v0`.
  Use lowercase kebab-case.
- Setting `featured: true` on a second post is a silent bug — `getFeaturedPosts()` returns
  the first match and the other quietly vanishes from the list.
- `category` must be one of the three values above; it's used as a translation key
  (`Blog.categories.*` in `frontend/messages/*.json`) and an unknown value throws.
- Routes are statically generated with `dynamicParams = false`, so a new post only appears
  after a rebuild.
- `getAllPosts()` only reads `.mdx` files, so non-post files in `frontend/content/blog/`
  are ignored.

---

## Translating a post (Arabic)

`frontend/content/blog/{slug}.mdx` is the **canonical** post (English). Its Arabic
counterpart is `frontend/content/blog/ar/{slug}.mdx` — same filename, same frontmatter
*shape*. **Write both files whenever you create a new post** — see the note at the top of
[Blog articles](#blog-articles). The fallback below exists for posts that predate this
rule or get edited one locale at a time, not as the normal way to ship a new article.

- **Translate**: `title`, `excerpt`, `imageCaption`, and the entire MDX body (headings,
  prose, table cells that are prose, `<Stat>` labels, `<Pullquote>` text/`cite`).
- **Copy unchanged**: `category` (it's a translation key, not prose —
  `Blog.categories.*` in `frontend/messages/*.json` already handles display), `author`,
  `date`, `readTime`, `featured`, `image`.
- If `frontend/content/blog/ar/{slug}.mdx` doesn't exist, `/ar/blog/{slug}` falls back to
  the English file automatically, so a missing translation degrades gracefully instead of
  breaking the Arabic build — but for a **new** post this should never be the end state;
  write the Arabic file in the same pass. Don't create it half-done (i.e. don't add the
  file until you're translating the whole post).
- Keep terminology consistent with `frontend/messages/ar.json` rather than inventing new
  phrasing — e.g. "الدارجة الجزائرية", "مساهم" (contributor), "توثيق" (annotation),
  "لوحة الصدارة" (leaderboard).
- `lib/blog.ts`'s `getAllPosts`/`getPostBySlug` take a `locale` and resolve per-file, not
  per-directory — you never need to touch that resolution logic to add a translation.

---

## Markdown conventions

- **Never use `#`.** The page renders `title` as the `h1`. Section headings start at `##`.
- Use `###` only for genuine sub-sections. `####` exists but is rarely right.
- Headings are sentence case, no trailing period: `## Where it still breaks`.
- Bold with `**` for the first mention of the thing the post is about, sparingly after.
- Links get the accent color automatically — don't announce them ("click here").
- Body paragraphs are 2–5 sentences. Hard-wrap source lines around 80 characters; it has
  no effect on output and keeps diffs readable.

### Tables

Standard GFM. The **last body row is styled as the highlighted subject row** (tinted
background, rounded bottom corners) — order your table so the thing the article is about
comes last, and bold it:

```md
| Model                        | Darija fluency | Task accuracy |
| ---------------------------- | -------------- | ------------- |
| Baseline A (multilingual 8B) | 31%            | 54%           |
| Baseline B (MSA-tuned 7B)    | 44%            | 58%           |
| **awras-chat-v0**            | **78%**        | **71%**       |
```

If no row deserves emphasis, that's fine — the tint is subtle. Tables scroll horizontally
on narrow screens.

---

## Components

Three are available. They need no import — they're injected by `MDXContent`.

### `<Stats>` — the number row

Three figures with accent rules above them. Use once per article, after the section that
establishes what was built. Two or three `<Stat>` children; it reflows to two columns on
mobile.

```mdx
<Stats>
  <Stat value="1.2M" label="Annotated pairs" />
  <Stat value="214" label="Contributors" />
  <Stat value="05" label="Regional accents" />
</Stats>
```

`value` stays short — four characters or fewer reads best (`1.2M`, `214`, `05`). Pad small
numbers to two digits. `label` is two or three words, sentence case; it renders uppercase.

### `<Pullquote>` — the display quote

One per article, maximum. Use it for a line that reframes the piece, not to repeat
something already in the body.

```mdx
<Pullquote cite="— internal review, week 12">
  “The dataset is the product. The model is just the receipt.”
</Pullquote>
```

Include the typographic quotes (`“ ”`) yourself. `cite` is optional, starts with an em
dash, and renders in the accent color, uppercase. Keep the quote under ~15 words.

### `<Figure>` — a captioned image

```mdx
<Figure
  src="/blog/evaluation-session.jpg"
  alt="Annotators reviewing transcripts around a table"
  caption="Evaluation session in Algiers, June 2026. Photo: Awras community."
/>
```

`alt` is required and describes the image. `caption` is optional and renders centred
below. For the article's *lead* image use the `image` frontmatter field instead — that
renders in the header, above the body.

---

## Article shape

The featured post, `frontend/content/blog/introducing-awras-chat-v0.mdx`, is the
reference. What makes it work:

1. **Two opening paragraphs, no heading.** The first states what changed and grounds it in
   something concrete. The second says what the post will cover.
2. **`## What we shipped`** — the substance, in one tight paragraph.
3. **`<Stats>`** — the numbers, immediately after.
4. **`<Pullquote>`** — the reframing line.
5. **`## Results`** — a sentence of methodology, then the table.
6. **`## Where it still breaks`** — honest limitations. This section is not optional; it's
   the house voice.
7. **A closing paragraph** on what's next and how to help.

Aim for 400–700 words — roughly 4–8 minutes, and set `readTime` accordingly. Not every
post needs `<Stats>` or a table; most posts in that directory are plain prose with `##`
headings and read fine. Reach for a component when the content genuinely calls for it, not
to fill the template.

### Voice

- British spelling (`normaliser`, `modelling`, `recognised`).
- Concrete over promotional. "18.4% word error rate" beats "dramatically improved".
- Name the limitation before the reader finds it.
- Em dashes for asides, not semicolons.

---

## Before you finish

```bash
pnpm build
```

The build must stay green and the route table must show `● /[locale]/blog/[slug]` with the
new path included. If the post renders but looks wrong, check the compiled HTML at
`frontend/.next/server/app/en/blog/<slug>.html` — a `<p>` nested inside a `<p>`, or an
element with classes but no styling, means rule 1 or 2 above was broken.

If you added or edited an Arabic translation, also check
`frontend/.next/server/app/ar/blog/<slug>.html`: the title/excerpt/body should be in
Arabic, `<html dir="rtl">`, and if you left the Arabic file out entirely, that same check
should still show the English fallback rather than a 404.
