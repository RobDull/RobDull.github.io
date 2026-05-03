# Rob Dull Portfolio — Design Decisions and Project Context

## Site overview

A portfolio site for Rob Dull, Product Management Practitioner and Product Operations Transformation Consultant. The site has a home page, a tools index, and individual tool pages. Tools use the Anthropic Claude API via a Cloudflare Worker proxy.

## File structure

```
index.html                          ← homepage
tools/
  tools-index.html                  ← tools listing page
  business-case/
    business-case-index.html        ← Business Case Generator tool
  persona-generator/
    persona-index.html              ← Persona Generator tool
  journey-map/
    journey-map-index.html          ← Journey Map Builder tool
worker.js                           ← Cloudflare Worker API proxy
WORKER_README.md                    ← deploy instructions for the worker
```

---

## Color palette

| Variable | Hex | Usage |
|---|---|---|
| `--accent` | `#1a3a5c` | Navy — primary brand color, nav fill on hover, section headers |
| `--accent2` | `#c8662a` | Burnt orange — eyebrow tags, category labels, bullet dots |
| `--ink` | `#0a0a0a` | Near-black — body text |
| `--muted` | `#6b6b6b` | Grey — secondary text, descriptions |
| `--off` | `#f7f7f7` | Light grey — page backgrounds, card backgrounds |
| `--rule` | `#e8e8e8` | Border/divider color |
| `--gold` | `#c8921a` | Gold — used sparingly in journey map |

### Journey map phase colors
| Phase | Color | Notes |
|---|---|---|
| Pre-Enrollment | `#1a3a5c` | Navy — matches accent |
| Account Management | `#2a6b6b` | Teal/blue-green |
| Claims and Services | `#c8662a` | Burnt orange — matches accent2 |
| Recommendations and Renewals | `#7c5cbf` | Purple/lavender |

### Journey map row label column
- Background: `#c8662a` (burnt orange / accent2) — changed from original sage green

### Journey map toolbar buttons (Add Stage, Toggle Rows, Export JSON, Copy for AI)
- Background: `#7c5cbf` (lavender/purple)
- Hover: `#6a4aaa`

---

## Typography

- Font: **Inter** (Google Fonts), weights 400–900
- All pages use the same font stack: `'Inter', sans-serif`

---

## Nav bar — all pages

The nav is consistent across all pages:

```css
nav { position: fixed; top: 0; padding: 16px 40px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--rule); }
.nl a { background: white; color: var(--ink); border: 2px solid var(--rule); border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; }
.nl a:hover { background: var(--accent); color: white; border-color: var(--accent); }
```

**Nav links on all pages:** Contact | About | Work  
("About" not "About Me" — confirmed decision)

**Wordmark:** "Rob Dull" — 22px, weight 900, links to `../../index.html` (or `/index.html` from homepage)

---

## Page intro section — tool pages

All tool pages use the same left-aligned intro structure (matching persona and journey map):

```html
<div class="bc">                          <!-- breadcrumb -->
  <div class="bc-inner">
    <a href="../../index.html">robdull</a>
    <span class="bc-sep">/</span>
    <a href="../tools-index.html">tools</a>
    <span class="bc-sep">/</span>
    <span>tool-name</span>
  </div>
</div>

<div class="page-head">
  <div class="page-tag">Category Label</div>   <!-- orange uppercase eyebrow -->
  <h1>Headline with<br><em>navy emphasis</em>.</h1>
  <p>Description paragraph, max ~560px wide, left-aligned.</p>
</div>
```

**Not centered** — the business case page was updated from a centered hero to this left-aligned format to match the other tool pages.

---

## Footer — all pages

```html
<footer>
  <p>Rob Dull · Product Management Practitioner and Product Operations Transformation Consultant</p>
</footer>
```

Journey map has two footers:
- `.map-footer` — sits at the bottom of the map table, navy background (`var(--accent)`), white text at 70% opacity, middle dots (`&middot;`) as separators: "PetHealth · Customer Journey Map · Editable template"
- `.site-footer` — standard site footer below the map

---

## Tools index page

Four tools listed in order:
1. **Technical Business Case Generator** — Live
2. **JTBD + Enterprise Persona Generator** — Live
3. **Customer Journey Map Builder** — Live
4. **Product Operations Health Radar** — In development

Stats: 3 live, 1 in development.

Includes an API note between the hero strip and tool list explaining the Cloudflare Worker setup.

Live/dev status shown with colored dot badges (green for live, grey for in development).

---

## Cloudflare Worker / API setup

- Worker file: `worker.js`
- API key stored as encrypted secret named `ANTHROPIC_API_KEY` in Cloudflare Worker settings
- Model hardcoded to `claude-sonnet-4-20250514` in the worker — cannot be overridden from the browser
- `max_tokens` capped at 2000 in the worker regardless of what the browser sends
- System prompts passed from the browser are silently dropped — move them into the worker's `safe` object if needed
- Each tool HTML file has a `WORKER_URL` constant near the top that must be set to the deployed worker URL
- See `WORKER_README.md` for full deploy instructions

---

## Journey map tool — key decisions

- **Company name:** PetHealth (sample company used throughout)
- **"Experience" row renamed to:** User Sentiment
- **Sentiment chart:** Pure line chart — no area fill, no shading. SVG `fill="none"` set as attribute directly on both the line and area path elements. Area path `d` attribute is never set.
- **Line color:** `#1a3a5c` (navy), `stroke-width: 2.5`, set as SVG attributes not CSS
- **Toolbar sticky position:** `top: 58px` (below fixed nav)
- **Phase banner sticky:** `top: 0` relative to `map-outer`
- **Stage header sticky:** `top: 28px` relative to `map-outer`
- **rows-container padding:** set to `0px` (headers are in normal flow, not floating over content at rest)
- **map-outer margin-top:** `12px` (small gap between toolbar and map)

---

## Persona tool — key decisions

- **Persona 3** replaced from "Jennifer Malhotra, Account Manager" to **Marcus Chen**, a PetHealth insurance member (policyholder) whose journey mirrors the Journey Map tool's example
- Marcus has a golden retriever named Biscuit; enrolled after a $2,400 out-of-pocket vet bill; at renewal considering switching
- This persona connects the persona tool and journey map tool as a coherent example set
- `--accent2` in persona tool is `#c8662a` (orange), not the old sage green `#6b8f71`

---

## Business case tool — key decisions

- Intro updated from centered hero to left-aligned breadcrumb + page-head (matching other tool pages)
- Three new form fields added:
  - **"Who owns this problem?"** — stakeholders who feel the pain (Section 1, all modes)
  - **"Current workaround or old way"** — what people do today instead (Section 1, all modes)
  - **"What specifically is better for these employees vs. the old way?"** — added to Section 3 Internal People Impacted (Standard+)
  - **"What is specifically better vs. the old way or current workaround?"** — added to Section 4 External and Customer Impact (Full Analysis)
- Section 3 renamed from "People Impacted" to "Internal People Impacted"
- Section 4 renamed from "End-User Impact" to "External and Customer Impact"
- All new fields feed into the AI prompt with labeled keys

---

## Google Analytics

All HTML pages include a Google Analytics 4 tag (measurement ID `G-0Y1JYXTE5J`) as the first element after `<head>`. This tag is present in every `.html` file in the site.

If you copy or fork any of these pages, either remove the tag block entirely or replace the measurement ID with your own. See `WORKER_README.md` for full instructions.
