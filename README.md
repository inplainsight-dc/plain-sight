# In Plain Sight

Civic tools that make a jurisdiction's rules easier to read, search, and trust.
This repo is the **hub**: the landing site that showcases the tools as a grid of
cards. The DC instance lives at **inplainsight-dc.org**.

Tagline: *Bringing the fine print into plain sight.*

---

## Run it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install      # once
npm run dev      # live preview at http://localhost:4321
npm run build    # produces the static site in dist/
npm run preview  # preview the built site
```

`npm run build` outputs a plain static site to `dist/` — that's what gets
deployed (see DEPLOY.md).

---

## Add a new project card (the 2-minute edit)

Every card on the home page is one Markdown file in `src/data/projects/`.
To add a project, create a new file there, e.g. `src/data/projects/citator.md`:

```markdown
---
title: "DC Citator"
description: "One sentence on what it does and why it helps."
tags: ["Case law", "Citations"]
url: "https://inplainsight-dc.org/citator"   # only needed when status is "live"
status: "live"        # live | building | planned
order: 4              # lower numbers sort first
---
```

That's it. Save, rebuild, deploy. The grid updates automatically.

**Status meanings**
- `live` — shipped and clickable (needs a `url`)
- `building` — in progress, shows an "In the works" badge, not clickable
- `planned` — placeholder "Coming soon" card (dashed outline)

---

## Change the brand, domain, links, or About text

Everything brand-level lives in **one file**: `src/config/site.ts`.
Name, tagline, domain, GitHub/LinkedIn/email, and the About paragraphs are all
there. Edit that file and the whole site updates. (This is also what makes the
project easy to **fork** — see FORKING.md.)

If you change the domain, also update `site:` in `astro.config.mjs`.

---

## The house style

The shared design system is `src/styles/global.css` — the "In Plain Sight"
look: warm cream + ink, a signature highlighter-amber accent, Fraunces (display)
+ Public Sans (body). Reuse this same stylesheet inside each tool so the hub and
every project feel like one brand.

---

## Project structure

```
src/
  config/site.ts          ← brand, domain, links, About (edit me)
  content.config.ts       ← schema for project cards
  data/projects/*.md      ← one file per card (add a card here)
  styles/global.css       ← the In Plain Sight house style
  components/             ← Header, Footer, ProjectCard, Icon
  layouts/Base.astro      ← page shell (head, fonts, dark mode)
  pages/index.astro       ← the home page
public/favicon.svg
```

See **DEPLOY.md** for hosting (S3 + CloudFront) and **FORKING.md** for the
fork-it-for-your-city convention.
