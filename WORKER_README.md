# WORKER_README — Cloudflare Worker Setup

## What this is

All AI tools on this site call the Anthropic Claude API through a Cloudflare Worker proxy. The Worker acts as a secure middleman: the API key never touches the browser, and you control who can call the Worker. This file explains how to deploy the Worker, lock it to your own domain, and — if you want to share these tools — how visitors can wire in their own Anthropic API key.

---

## How the protection works

The `worker.js` file includes an **allowed-origins check**. When a browser calls the Worker, it sends an `Origin` header. The Worker checks that origin against an allowlist. If the origin isn't on the list, the Worker returns a `403 Forbidden` response and never touches the API key.

This means:
- Requests from your own site (e.g. `https://robdull.com`) are allowed through.
- Requests from anyone else's site, Postman, curl, etc. are blocked.
- Your API key is stored as an encrypted secret in Cloudflare — never visible in the browser or in any HTML file.

---

## Deploying the Worker (your setup)

### 1. Create a Cloudflare account
Sign up at [cloudflare.com](https://cloudflare.com) if you don't have one. The Workers free tier is sufficient.

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
Paste your Anthropic API key when prompted. It is stored encrypted — never in source code.

### 5. Set your allowed origin
In `worker.js`, find the `ALLOWED_ORIGINS` array and replace with your own domain:

```js
const ALLOWED_ORIGINS = [
  'https://robdull.com',
  'https://www.robdull.com',
  // Add 'http://localhost:8080' etc. for local dev
];
```

### 6. Deploy
```bash
wrangler deploy
```
Copy the Worker URL from the output (e.g. `https://my-claude-proxy.your-account.workers.dev`).

### 7. Set the WORKER_URL in each tool
Each HTML tool file has a constant near the top of the `<script>` block:

```js
const WORKER_URL = 'YOUR_WORKER_URL_HERE';
```

Replace `YOUR_WORKER_URL_HERE` with your deployed Worker URL. Repeat for each tool file:
- `business-case/business-case-index.html`
- `persona-generator/persona-index.html`
- `journey-map/journey-map-index.html`
- `hoshin-v2mom/hoshin-v2mom-index.html`

---

## For visitors who want to use these tools with their own tokens

These tools are open to copy and self-host. Here is how to run them independently:

### Option A — Cloudflare Worker (recommended, same as above)

1. Follow the deployment steps above.
2. Set your own Anthropic API key as the `ANTHROPIC_API_KEY` secret.
3. Set `ALLOWED_ORIGINS` to your own domain.
4. Replace `WORKER_URL` in the HTML files with your Worker URL.
5. Host the HTML files anywhere (GitHub Pages, Netlify, Cloudflare Pages, etc.).

Your API key stays on your Worker. Nobody else's requests can reach it.

### Option B — Call the Anthropic API directly from the browser (simpler, less secure)

If you just want to run the tools locally and aren't worried about exposing your key in the browser:

1. In each HTML file, find the `buildWithAI()` or equivalent function.
2. Replace the `fetch(WORKER_URL, ...)` call with a direct call to the Anthropic API:

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
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })
});
```

**Warning:** This puts your API key in the browser where it is visible in DevTools. Only do this for local testing. Never deploy this to a public URL.

### Option C — Paste your key into the tool at runtime (planned feature)

A future version of these tools may include an optional API key input field, so visitors can enter their own key in the browser session. The key would only be held in memory for that session and never stored or sent to any server other than Anthropic directly.

---

## Worker configuration reference

| Setting | Location | Notes |
|---|---|---|
| API key | Cloudflare secret `ANTHROPIC_API_KEY` | Never in source code |
| Model | Hardcoded in `worker.js` | `claude-sonnet-4-20250514` |
| Max tokens | Hardcoded in `worker.js` | Capped at 2000 regardless of browser request |
| System prompts | Dropped by worker | Move into worker's `safe` object if needed |
| Allowed origins | `ALLOWED_ORIGINS` array in `worker.js` | Must include your exact domain(s) |

---

## worker.js reference

```js
const ALLOWED_ORIGINS = [
  'https://robdull.com',
  'https://www.robdull.com',
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      if (!ALLOWED_ORIGINS.includes(origin)) {
        return new Response('Forbidden', { status: 403 });
      }
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Block non-allowed origins
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.json();

    // Force model and cap tokens — browser cannot override
    const safe = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: Math.min(body.max_tokens || 1000, 2000),
      messages: body.messages,
    };

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(safe),
    });

    const data = await anthropicResponse.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      }
    });
  }
};
```

---

## Questions

For questions about deploying or adapting these tools, reach out via [rob.dull@gmail.com](mailto:rob.dull@gmail.com) or connect on [LinkedIn](https://linkedin.com/in/robdull).

---

## Google Analytics

All pages on robdull.com include a Google Analytics 4 tag (measurement ID `G-0Y1JYXTE5J`) immediately after the `<head>` opening tag in every HTML file:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-0Y1JYXTE5J"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-0Y1JYXTE5J');
</script>
```

### If you copy these tools for your own use

This tag sends page view data to Rob Dull's Google Analytics account. If you self-host these tools, you should either:

**Option A — Remove analytics entirely.** Delete the `<!-- Google tag (gtag.js) -->` block (the comment and the two `<script>` tags that follow it) from every HTML file. This is the simplest option if you don't need analytics.

**Option B — Replace with your own GA4 tag.** Create a free Google Analytics 4 property at [analytics.google.com](https://analytics.google.com), then replace `G-0Y1JYXTE5J` with your own measurement ID in each file:

```html
gtag('config', 'G-YOUR-MEASUREMENT-ID');
```

And update the script src:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-MEASUREMENT-ID"></script>
```

The tag appears once per file, always immediately after `<head>`. A find-and-replace for `G-0Y1JYXTE5J` across all HTML files will catch every instance.

**Option C — Use a different analytics provider.** Remove the Google tag block entirely and add your preferred provider's snippet in the same location.
