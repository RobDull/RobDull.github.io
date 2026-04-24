/**
 * Cloudflare Worker: Anthropic API Proxy
 * robdull.com portfolio -- keeps API key server-side
 *
 * DEPLOY STEPS:
 * 1. Go to workers.cloudflare.com, create a Worker, paste this file
 * 2. Settings > Variables > Add: ANTHROPIC_API_KEY (check Encrypt)
 * 3. Save and deploy -- copy your worker URL
 * 4. In business-case/index.html, replace WORKER_URL_HERE with your worker URL
 */

export default {
  async fetch(request, env) {
    const ALLOWED = ['https://robdull.com','https://www.robdull.com','http://localhost','http://127.0.0.1','null'];
    const origin = request.headers.get('Origin') || '';
    const ok = ALLOWED.includes(origin) || origin === '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin, ok) });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!ok) return new Response('Forbidden', { status: 403 });
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY not set as Worker secret.' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: { message: 'Invalid JSON.' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }); }

    const safe = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: Math.min(body.max_tokens || 1000, 2000),
      messages: body.messages || []
    };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(safe)
    });

    const text = await resp.text();
    return new Response(text, { status: resp.status, headers: { 'Content-Type': 'application/json', ...cors(origin, ok) } });
  }
};

function cors(origin, ok) {
  return {
    'Access-Control-Allow-Origin': ok ? (origin || '*') : 'https://robdull.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}
