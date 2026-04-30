# Anthropic API Proxy — Cloudflare Worker

This Worker sits between your portfolio site and the Anthropic API. It keeps your API key off the client and out of the browser.

---

## How it works

Every tool on the site that uses AI (persona generator, business case generator, etc.) sends a POST request to this Worker instead of calling Anthropic directly. The Worker adds your API key server-side and forwards the request. The browser never sees the key.

---

## Deploy steps

### 1. Create the Worker
- Go to [workers.cloudflare.com](https://workers.cloudflare.com)
- Create a new Worker
- Paste the contents of `worker.js` and save

### 2. Add your API key as a secret
- In the Worker dashboard: **Settings → Variables → Secrets**
- Add a secret named exactly: `ANTHROPIC_API_KEY`
- Paste your Anthropic API key as the value
- Check **Encrypt** — this keeps it out of logs and the dashboard UI

### 3. Deploy and copy your Worker URL
- Click **Deploy**
- Your Worker URL will look like: `https://your-worker-name.your-subdomain.workers.dev`

### 4. Wire the URL into each tool
Each AI-powered tool has a `WORKER_URL` constant near the top of its HTML file. Replace the placeholder with your deployed Worker URL in all of them:

| Tool | File | Constant to update |
|---|---|---|
| Business Case Generator | `tools/business-case/index.html` | `WORKER_URL` |
| Persona Generator | `tools/persona/persona-index.html` | `WORKER_URL` |
| Journey Map | `tools/journey-map/journey-map-index.html` | `WORKER_URL` |

Search each file for `WORKER_URL_HERE` to find the right line.

---

## What the Worker accepts and strips

To prevent prompt injection and cost overruns, the Worker only forwards a safe subset of what it receives. It **ignores** anything else sent from the browser.

| Field | Behavior |
|---|---|
| `messages` | Forwarded as-is |
| `max_tokens` | Forwarded, capped at 2000 regardless of what the browser sends |
| `model` | **Hardcoded** to `claude-sonnet-4-20250514` — cannot be overridden from the browser |
| `system`, `tools`, `temperature`, etc. | **Silently dropped** — if you need these, add them inside the Worker |

> **Note:** If you add a system prompt to a tool's API call in the browser and it seems to have no effect, this is why. Move system prompts into the Worker's `safe` object, or pass them through `messages` as a user turn.

---

## Allowed origins

The Worker only accepts requests from these origins:

```
https://robdull.com
https://www.robdull.com
http://localhost
http://127.0.0.1
```

Opening an HTML file directly in your browser (`file://`) also works because browsers send an empty `Origin` header for local files, which the Worker permits for development.

To add another domain (e.g. a staging environment), add it to the `ALLOWED` array in `worker.js` and redeploy.

---

## Testing before wiring to the site

You can verify the Worker is live and accepting requests with a curl command:

```bash
curl -X POST https://your-worker-name.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello in one word."}],"max_tokens":20}'
```

A successful response looks like:
```json
{"id":"msg_...","type":"message","role":"assistant","content":[{"type":"text","text":"Hello!"}],...}
```

If you see `ANTHROPIC_API_KEY not set as Worker secret`, the secret was not saved correctly — go back to Settings → Secrets.

---

## Local development with Wrangler

If you want to run and test the Worker locally before deploying:

```bash
npm install -g wrangler
wrangler dev worker.js
```

Set your API key for local testing:
```bash
wrangler secret put ANTHROPIC_API_KEY
```

Your local Worker will run at `http://localhost:8787`. You can point any tool at that URL while developing.

---

## Cost notes

- The Worker caps `max_tokens` at 2000 per request. Each tool is configured well below this.
- The model is hardcoded to Claude Sonnet, which is cost-efficient for these use cases.
- Cloudflare's free Workers plan includes 100,000 requests/day, which is more than sufficient for a portfolio site.
