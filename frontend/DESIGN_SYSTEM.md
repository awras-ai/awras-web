# Awras Design System

A living reference for building consistent UI components across the Awras frontend.

---

## Philosophy

Clean, minimal, and content-first. The design favors generous whitespace, tight typographic hierarchy, and a single accent color to guide attention. Components should feel like they belong to the same system — never one-off.

---

## Colors

### Primary Palette

| Token                     | Value           | Usage                                                                     |
| ------------------------- | --------------- | ------------------------------------------------------------------------- |
| **Accent**                | `#14b8a6`       | Highlights, emphasis words in headings, hover states, decorative dividers |
| **Background (Light)**    | `bg-white`      | Default page and section backgrounds                                      |
| **Background (Dark)**     | `bg-black`      | Footer, Marquee band, dark sections                                       |
| **Text Primary**          | `text-black`    | Headings, nav logo, primary content                                       |
| **Text Secondary**        | `text-black/60` | Body text, descriptions on light backgrounds                              |
| **Text Secondary (Dark)** | `text-white/60` | Body text on dark backgrounds                                             |
| **Text Muted**            | `text-black/40` | Section labels, captions on light backgrounds                             |
| **Text Muted (Dark)**     | `text-white/40` | Section labels, captions on dark backgrounds                              |

### Neutral Scale

| Token           | Value                   | Usage                                      |
| --------------- | ----------------------- | ------------------------------------------ |
| **Neutral 50**  | `bg-neutral-50`         | Subtle hover states (Process cards)        |
| **Neutral 100** | `bg-neutral-100`        | Interactive hover backgrounds (mobile nav) |
| **Neutral 200** | `border-neutral-200/50` | Navbar borders                             |
| **Neutral 300** | `bg-neutral-300`        | Vertical dividers                          |
| **Neutral 800** | `text-neutral-800`      | Nav links                                  |

### Borders

| Context              | Class                   |
| -------------------- | ----------------------- |
| Light cards/sections | `border-black/10`       |
| Dark sections        | `border-white/10`       |
| Icon circles (dark)  | `border-white/20`       |
| Navbar               | `border-neutral-200/50` |

---

## Typography

### Scale

| Element                  | Classes                                                                                                    | Notes                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Hero Heading**         | `text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl font-[family-name:var(--font-inter-display)]` | Single use per page                        |
| **Section Heading**      | `text-4xl md:text-5xl font-bold tracking-tight`                                                            | Standard for Mission, Process, FAQ, Footer |
| **Section Label**        | `text-xs font-semibold text-black/40 tracking-widest uppercase`                                            | Numbered: `01 — Name`                      |
| **Section Label (Dark)** | `text-xs font-semibold text-white/40 tracking-widest uppercase`                                            | For dark backgrounds                       |
| **Body**                 | `text-lg text-black/60 font-light leading-relaxed`                                                         | Default paragraph style                    |
| **Body (Dark)**          | `text-lg text-white/60 font-light leading-relaxed`                                                         | For dark backgrounds                       |
| **Nav Link**             | `text-[14px] font-medium tracking-tight text-neutral-800`                                                  | Desktop navigation                         |
| **Small / Caption**      | `text-sm`                                                                                                  | Copyright, meta text                       |
| **Logo**                 | `text-2xl font-bold tracking-tighter`                                                                      | Navbar and footer mark                     |

### Accent in Headings

Emphasize one word or phrase per heading with the accent color:

```tsx
<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
  Preserving Darija, <br />
  <span style={{ color: "#14b8a6" }}>Empowering Algeria.</span>
</h2>
```

---

## Spacing

### Section Spacing

```
py-16 md:py-24 px-4 sm:px-6 lg:px-8
```

### Container

```
max-w-6xl mx-auto w-full
```

### Card Padding

- **Content cards:** `p-6 md:p-10`
- **List items inside cards:** `px-6 md:px-10` with vertical padding per item

---

## Components

### Buttons

Use shadcn/ui `Button`. Primary CTA style:

```tsx
<Button className="group rounded-full px-6 py-5 text-[14px] font-medium shadow-sm">
  <span>Explore More</span>
  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
</Button>
```

### Cards

Use shadcn/ui `Card` and `CardContent`:

```tsx
<Card className="border-black/10 shadow-sm">
  <CardContent className="p-6 md:p-10">{/* Content */}</CardContent>
</Card>
```

### Icon Circles

For social links and step indicators:

```tsx
<div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors">
  <Icon className="h-4 w-4" />
</div>
```

For light backgrounds:

```tsx
<div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center bg-black/5">
  <Icon className="w-5 h-5 text-black/70" />
</div>
```

### Accordions

Use shadcn/ui `Accordion` with custom item styling:

```tsx
<AccordionItem value="item-1" className="border-b border-black/10">
  <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-6 text-black hover:text-black/80 transition-colors">
    Question
  </AccordionTrigger>
  <AccordionContent className="text-black/60 leading-relaxed pb-6">
    Answer
  </AccordionContent>
</AccordionItem>
```

---

## Patterns

### Section Label Convention

Every major section gets a numbered label:

```
01 — Our Mission
02 — The Process
03 — FAQ
04 — Connect
```

Use `mb-3` below the label and `mb-12` below the heading block.

### Dark Section Rules

When using `bg-black`:

- Swap all `text-black/*` → `text-white/*`
- Swap all `border-black/*` → `border-white/*`
- Keep accent color `#14b8a6` unchanged
- Icon circles use `border-white/20`

### Hover States

| Context            | Pattern                                                            |
| ------------------ | ------------------------------------------------------------------ |
| Text links (light) | `hover:text-black transition-colors`                               |
| Text links (dark)  | `hover:text-white transition-colors`                               |
| Icon circles       | `hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors`    |
| Card rows          | `hover:bg-neutral-50 transition-colors duration-200`               |
| Buttons            | `group-hover:translate-x-0.5 group-hover:-translate-y-0.5` on icon |

---

## Icons

- **Library:** `lucide-react`
- **Social SVGs:** Place in `/public/` (e.g., `/hf-logo.svg` for HuggingFace)
- **Size:** `h-4 w-4` for inline/social, `w-5 h-5` for feature icons

---

## Do's and Don'ts

**Do:**

- Use `max-w-6xl mx-auto` for every section
- Add a numbered label to every major section
- Use the accent color sparingly — one phrase per heading
- Use `leading-relaxed` on all body text
- Keep borders subtle (`/10` opacity)

**Don't:**

- Introduce new colors without discussion
- Use `bg-gray-*` — stick to `neutral` or explicit `black/white` with opacity
- Skip section labels on major blocks
- Mix light and dark text utilities within the same section background
