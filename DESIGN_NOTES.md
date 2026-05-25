# Rob Dull Portfolio — Design Decisions and Project Context

## Site overview

A portfolio site for Rob Dull, Product Management Practitioner and Product Operations Transformation Consultant. The site serves two audiences: practitioners who use the tools, and hiring managers evaluating PM and Product Operations capability. Tools use the Anthropic Claude API either via direct browser call (with visitor-supplied API key modal) or a Cloudflare Worker proxy.

---

## File structure

```
index.html                                    ← homepage
tools/
  tools-index.html                            ← tools hub (6 tools)
  business-case/
    business-case-index.html                  ← Business Case Generator (AI, direct API + key modal)
  persona-generator/
    persona-index.html                        ← JTBD + Persona Generator (client-side)
  journey-map/
    journey-map-index.html                    ← Customer Journey Map Builder (client-side)
  hoshin-kanri/
    hoshin-v2mom-index.html                   ← Hoshin Kanri + V2MOM (client-side)
  prod-ops-radar/
    prod-ops-radar-index.html                 ← Product Ops Health Radar (in development)
  feature-intake/
    feature-intake-index.html                 ← Feature Intake Pipeline (AI, direct API + key modal)
    feature-intake-explainer.html             ← Plain-language explainer for the pipeline tool
  AI-native-prodops/
    AI-prodops-overview.html                  ← AI-native ProdOps overview article
    prodops-network.html                      ← 85-node SVG network diagram (interactive)
    enterprise-agentic-reference.html         ← Workato EARA reference (internal, noindex)
perspectives/
  perspectives-index.html                     ← Articles hub
  pm-roles-ai.html                            ← Article: PM Roles and AI Operations Gaps (Nov 2025)
  write-it-right.html                         ← Article: PI Planning / story writing (Apr 2025)
  marquet-ai-cert.html                        ← Article: Marquet AI safety framework (May 2026)
workshops/
  workshops-index.html                        ← Workshops and coaching offerings
about_me/
  resume.html                                 ← Resume (linked from main nav)
worker.js                                     ← Cloudflare Worker API proxy
WORKER_README.md                              ← Deploy instructions for the Worker
DESIGN_NOTES.md                              ← This file
worker-vs-direct.html                         ← Infrastructure decision reference (noindex)
sitemap.xml                                   ← XML sitemap for all public pages
robots.txt                                    ← Crawl rules; blocks internal/reference pages
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
| `--accent-dark` | `#0f2640` | Darker navy — hover states, deep emphasis |
| `--gold` | `#c8921a` | Gold — used sparingly in journey map |

### Journey map phase colors
| Phase | Color | Notes |
|---|---|---|
| Pre-Enrollment | `#1a3a5c` | Navy — matches accent |
| Account Management | `#2a6b6b` | Teal/blue-green |
| Claims and Services | `#c8662a` | Burnt orange — matches accent2 |
| Recommendations and Renewals | `#7c5cbf` | Purple/lavender |

### Network diagram (prodops-network.html) color system
- Data sources: `#2a6b6b` (teal)
- MCP connections: `#1a3a5c` (navy)
- Agents & HITL: `#5a3a8c` (purple)
- Outputs: `#c8662a` (burnt orange)
- Governance: `#b03030` (red)
- Observability: `#2a7a3a` (green)

---

## Typography

- Font: **Inter** (Google Fonts), weights 400–900
- All pages use the same font stack: `'Inter', sans-serif`
- `DM Mono` used in Feature Intake tool for monospace/code elements only

### Type scale
- Body: 15px / 1.6
- Lead: 17px / 1.75 weight 500
- H1: `clamp(28px, 4vw, 48px)` weight 900 tracking -.03em
- H2: 22px weight 800 tracking -.02em
- Eyebrow: 11px weight 700 tracking .18em uppercase
- Section chips: 10px weight 700

---

## Nav bar — all pages

Fixed top nav, white with blur backdrop. Left: wordmark "Rob Dull" linking to homepage. Right: text links with 2px border, 6px radius. Hover state: navy background + white text.

```css
nav { position: fixed; top: 0; padding: 16px 40px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--rule); }
.nl a { background: white; color: var(--ink); border: 2px solid var(--rule); border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; }
.nl a:hover { background: var(--accent); color: white; border-color: var(--accent); }
```

**Standard nav links:** Contact | About | Work  
**Wordmark:** "Rob Dull" — 22px weight 800, links to root `index.html`

On AI tool pages (Business Case, Feature Intake), a key-status pill also appears in the nav showing whether an API key is loaded for the session.

---

## Page patterns

### Tool page head
All tool pages use a left-aligned intro structure:

```html
<div class="bc">
  <div class="bc-inner">
    <a href="../../index.html">Rob Dull</a>
    <span class="bc-sep">›</span>
    <a href="../tools-index.html">Tools</a>
    <span class="bc-sep">›</span>
    <span>Tool Name</span>
  </div>
</div>

<div class="page-head">
  <div class="page-tag">Category Label</div>   <!-- orange uppercase eyebrow -->
  <h1>Headline with<br><em>navy emphasis</em>.</h1>
  <p>Description paragraph, max ~560px wide, left-aligned.</p>
</div>
```

### Article page (perspectives/)
Breadcrumb + orange eyebrow + H1 + date/source meta row + body with H2 sections + footnotes + art-nav (prev/next articles). Article pages also include a LinkedIn share button in the nav.

### Callout block
Navy left border (`border-left: 4px solid var(--accent)`) on `--off` background. Orange variant uses `var(--accent2)`. Red variant uses `#b03030`.

### About/CTA strip
Navy background (`#1a3a5c`), white H2 with orange `<em>`, white semi-transparent body text. Primary button: orange. Ghost button: transparent white border.

### Reading strip (tools-index.html)
`--off` background with `border-top: 2px solid var(--accent2)`. Used to surface the AI ProdOps reading at the bottom of the tools list.

---

## Path reference

| File location | To site root | To tools-index | To perspectives/ |
|---|---|---|---|
| `tools/tool-name/file.html` | `../../index.html` | `../tools-index.html` | `../../perspectives/` |
| `tools/AI-native-prodops/file.html` | `../../index.html` | `../tools-index.html` | `../../perspectives/` |
| `perspectives/file.html` | `../index.html` | `../tools/tools-index.html` | `./other-article.html` |
| `tools/tools-index.html` | `../index.html` | `./tools-index.html` | `../perspectives/` |

---

## API / AI setup — current state

Two tools call the Anthropic Claude API: **Business Case Generator** and **Feature Intake Pipeline**. Both currently use the direct browser API pattern with a visitor-supplied key modal.

| Setting | Value |
|---|---|
| Model | `claude-sonnet-4-6` |
| Key storage | Browser `sessionStorage` only — cleared on tab close |
| Key modal | Shown on first Run click if no key in session |
| Worker URL | `https://tools.rob-dull.workers.dev` (deployed, not currently used by tool pages) |
| Max tokens | 1000–2000 depending on tool step |

The Cloudflare Worker is deployed and operational. Switching from direct API to Worker requires ~10 minutes of file edits per tool (see `worker-vs-direct.html` for the exact steps).

---

## Journey map tool — key decisions

- **Company name:** PetHealth (sample company used throughout)
- **"Experience" row renamed to:** User Sentiment
- **Sentiment chart:** Pure line chart — no area fill, no shading. `fill="none"` set as SVG attribute
- **Line color:** `#1a3a5c` (navy), `stroke-width: 2.5`
- **Toolbar sticky position:** `top: 58px` (below fixed nav)

---

## Persona tool — key decisions

- **Persona 3:** Marcus Chen, PetHealth insurance member (policyholder). Golden retriever named Biscuit. Enrolled after a $2,400 vet bill; at renewal considering switching. Connects persona tool to journey map tool as a coherent example set.
- `--accent2` is `#c8662a` (orange) — not the old sage green

---

## Business case tool — key decisions

- Left-aligned breadcrumb + page-head intro (not centered hero)
- Three additional form fields: "Who owns this problem?", "Current workaround or old way", and "What specifically is better vs. the old way?"
- Section 3 renamed to "Internal People Impacted"; Section 4 to "External and Customer Impact"

---

## Feature intake tool — key decisions

- Four-step pipeline with human checkpoint between each step (deliberate design — HITL as reliability mechanism, not UX preference)
- Right-hand panel explains design decisions for a hiring-manager audience, not technical implementation
- JSON schema enforcement on every step prevents drift between agentic steps

---

## prodops-network.html — key decisions

- 85 SVG nodes organized in 5 columns: Data Sources | MCP Connections | Agents & HITL | Outputs | Governance/Observability
- Interactive detail cards triggered on node click (JS)
- Governance bar runs vertically across all columns
- Observability log strip at bottom
- Feedback loop arc removed (simplified visual)
- Arrow marker viewBox corrected to `"0 0 10 10"`
- CSS variable `--accent-dark: #0f2640` added

---

## Google Analytics

GA4 tag `G-0Y1JYXTE5J` is present in every HTML file as the first element after `<head>`. If copying these files, either remove the tag block or replace the measurement ID with your own.

---

## SEO — current state (May 2026)

All 16 public pages have:
- `<meta name="description">` (140–160 chars)
- `<link rel="canonical">` pointing to `https://robdull.com/[path]`
- `og:type`, `og:url`, `og:title`, `og:description`, `og:site_name`

5 internal/reference pages (`ai-native-prodops.html` — now removed, `enterprise-agentic-reference.html`, `worker-vs-direct.html`, `hoshin-kanri-matrix.html`, `SESSION_NOTES.html`) have `<meta name="robots" content="noindex">`.

`sitemap.xml` and `robots.txt` are in the repo root.

`og:image` not yet implemented — requires a 1200×630px social preview image file.
