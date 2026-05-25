# WORKER_README — Cloudflare Worker Setup

## What this is

Two AI tools on this site — the Business Case Generator and the Feature Intake Pipeline — call the Anthropic Claude API. They currently do so via a direct browser call using a visitor-supplied API key. A Cloudflare Worker proxy is deployed and available as an alternative that removes that friction entirely. This file explains both setups and how to switch between them.

---

## Current setup: Direct API with visitor key modal

The tools call `api.anthropic.com` directly from the browser. When a visitor clicks Run for the first time, a modal prompts them to enter their own Anthropic API key. The key is held in `sessionStorage` only and cleared when the tab is closed. Nothing is sent to any server other than Anthropic.

**Affected files:**
- `tools/business-case/business-case-index.html`
- `tools/feature-intake/feature-intake-index.html`

---

## Alternative setup: Cloudflare Worker proxy

The Worker at `https://tools.rob-dull.workers.dev` is already deployed with the API key set. Switching to it removes the key modal entirely — visitors just use the tools.

### How the protection works

The `worker.js` file includes an **allowed-origins check**. Requests from `robdull.com` are allowed through. Requests from any other origin, curl, Postman, etc. are blocked with a `403 Forbidden`. Your API key is stored as an encrypted Cloudflare secret — never in source code or visible in the browser.

---

## Deploying the Worker (first-time setup)

The Worker is already deployed for robdull.com. These steps are for anyone forking these tools for their own use.

### 1. Create a Cloudflare account
Sign up at [cloudflare.com](https://cloudflare.com). The Workers free tier is sufficient.

### 2. Install Wrangler (Cloudflare CLI)
```bash
npm install -g wrangler
wrangler login
```

### 3. Create the Worker
```bash
wrangler init my-claude-proxy
```
Replace the generated `src/index.js` with the contents of `worker.js` from this repo.

### 4. Add your API key as an encrypted secret
```bash
wrangler secret put ANTHROPIC_API_KEY
```
Paste your Anthropic API key when prompted. Stored encrypted — never in source code.

### 5. Set your allowed origin
In `worker.js`, update the `ALLOWED` array:
```js
const ALLOWED = ['https://yourdomain.com', 'https://www.yourdomain.com', 'http://localhost', 'http://127.0.0.1', 'null'];
```

### 6. Deploy
```bash
wrangler deploy
```
Copy the Worker URL from the output (e.g. `https://my-claude-proxy.your-account.workers.dev`).

### 7. Set the WORKER_URL in each tool
Each AI tool file has a constant near the top of the `<script>` block:
```js
const WORKER_URL = 'YOUR_WORKER_URL_HERE';
```
Replace with your deployed Worker URL in:
- `tools/business-case/business-case-index.html`
- `tools/feature-intake/feature-intake-index.html`

---

## Switching robdull.com tools from direct API to Worker

The Worker is already deployed and the API key is already set. Four changes per tool file:

**1. Set the Worker URL.**  
Find the `fetch('https://api.anthropic.com/...')` call and replace the URL with `https://tools.rob-dull.workers.dev`.

**2. Revert the fetch headers.**  
Remove `x-api-key` and `anthropic-dangerous-direct-browser-access` from the fetch headers. The Worker adds the key server-side.

**3. Remove the API key modal.**  
Delete the modal HTML, modal CSS, and the `showApiKeyModal()`, `submitApiKey()`, and `clearApiKey()` functions. Remove the key-status pill from the nav.

**4. Remove the key check before each run.**  
Delete the `if (!getApiKey())` block at the start of `generate()` and `runStep1()` functions.

See `worker-vs-direct.html` for the full tradeoff comparison.

---

## Worker configuration reference

| Setting | Location | Value |
|---|---|---|
| API key | Cloudflare secret `ANTHROPIC_API_KEY` | Never in source code |
| Model | Hardcoded in `worker.js` | `claude-sonnet-4-6` |
| Max tokens | Hardcoded in `worker.js` | Capped at 2000 regardless of browser request |
| System prompts | Dropped by Worker | Move into Worker's `safe` object if needed |
| Allowed origins | `ALLOWED` array in `worker.js` | `robdull.com`, `www.robdull.com`, localhost |

---

## For visitors who want to self-host these tools

### Option A — Cloudflare Worker (recommended)
Follow the first-time setup steps above. Your API key stays server-side. Nobody else's requests can reach it.

### Option B — Direct API with key modal (current robdull.com approach)
The tools already support this. Visitors enter their own Anthropic API key in the modal when they first click Run. The key lives in `sessionStorage` only — cleared on tab close, never sent anywhere except Anthropic directly. This is the live setup on robdull.com as of May 2026.

### Option C — Hardcoded key in source (local dev only)
For local testing only — never deploy this to a public URL:

```js
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_ANTHROPIC_API_KEY_HERE',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })
});
```

**Warning:** This exposes your API key in browser DevTools. Local testing only.

---

## Google Analytics

All pages include a GA4 tag (`G-0Y1JYXTE5J`) immediately after the `<head>` opening tag. If you self-host these tools, either remove the tag block entirely or replace the measurement ID with your own. A find-and-replace for `G-0Y1JYXTE5J` across all HTML files catches every instance.

---

## Questions

For questions about deploying or adapting these tools: [rob.dull@gmail.com](mailto:rob.dull@gmail.com) or [LinkedIn](https://linkedin.com/in/robdull).
