import { Hono } from 'hono';
import type { Context } from 'hono';
import { chatTestPage } from './chat-test-page';
type Role = 'system' | 'user' | 'assistant';
type ChatMessage = { role: Role; content: string };
type Provider = 'openai' | 'groq' | 'raqa';
type AiBinding = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
type Env = {
  GATEWAY_API_KEY?: string; OPENAI_API_KEY?: string; GROQ_API_KEY?: string; RAQA_API_KEY?: string;
  RAQA_API_URL?: string; ALLOWED_ORIGIN?: string; AI?: AiBinding;
};
type ChatRequest = { provider: Provider; messages: ChatMessage[]; model?: string; temperature?: number };
type MedicalResult = { source: string; title: string; snippet: string; url: string };
const app = new Hono<{ Bindings: Env }>();
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const VISION_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';
const IMAGE_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const requestWindows = new Map<string, { start: number; count: number }>();
function jsonError(c: Context, status: number, error: string, detail?: string) {
  return c.json({ error, ...(detail ? { detail } : {}) }, status as 400);
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isRateLimited(c: Context) {
  const ip = c.req.header('CF-Connecting-IP');
  if (!ip) return false;
  const now = Date.now();
  const current = requestWindows.get(ip);
  if (!current || now - current.start >= 60_000) {
    requestWindows.set(ip, { start: now, count: 1 });
    if (requestWindows.size > 10_000) {
      for (const [key, value] of requestWindows) if (now - value.start >= 60_000) requestWindows.delete(key);
    }
    return false;
  }
  current.count += 1;
  return current.count > 20;
}
function validate(body: unknown): { data?: ChatRequest; error?: string } {
  if (!isRecord(body)) return { error: 'Request body must be a JSON object.' };
  if (!['openai', 'groq', 'raqa'].includes(String(body.provider))) return { error: "'provider' must be one of: openai, groq, raqa." };
  if (!Array.isArray(body.messages) || body.messages.length === 0) return { error: "'messages' must be a non-empty array." };
  const messages: ChatMessage[] = [];
  for (let i = 0; i < body.messages.length; i++) {
    const item = body.messages[i];
    if (!isRecord(item) || !['system', 'user', 'assistant'].includes(String(item.role)) || typeof item.content !== 'string' || item.content.trim() === '') {
      return { error: `messages[${i}] must have role system, user, or assistant and a non-empty string content.` };
    }
    messages.push({ role: item.role as Role, content: item.content });
  }
  if (body.model !== undefined && (typeof body.model !== 'string' || body.model.trim() === '')) return { error: "'model' must be a non-empty string when provided." };
  if (body.temperature !== undefined && (typeof body.temperature !== 'number' || !Number.isFinite(body.temperature) || body.temperature < 0 || body.temperature > 2)) {
    return { error: "'temperature' must be a finite number between 0 and 2." };
  }
  return { data: { provider: body.provider as Provider, messages,
    ...(body.model !== undefined ? { model: body.model as string } : {}),
    ...(body.temperature !== undefined ? { temperature: body.temperature as number } : {}) } };
}
function decodeImage(dataUrl: unknown): { bytes?: number[]; error?: string } {
  if (typeof dataUrl !== 'string') return { error: "'image' must be a base64 data URL." };
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) return { error: 'Image must be a base64 PNG, JPEG, or WebP data URL.' };
  const encoded = match[2];
  if (Math.floor(encoded.length * 3 / 4) > MAX_IMAGE_BYTES) return { error: 'Image is too large; maximum size is 4 MB.' };
  try { return { bytes: Array.from(atob(encoded), (character) => character.charCodeAt(0)) }; }
  catch { return { error: 'Image data is not valid base64.' }; }
}
function validateTranscriptionUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 4096) return null;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
    if (!hostname.includes('.') || hostname.endsWith('.') || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) return null;
    if (hostname.startsWith('[') || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;
    return url.href;
  } catch { return null; }
}
async function resolveTranscriptionUrl(value: string): Promise<string> {
  let current = value;
  const visited = new Set<string>();
  for (let hop = 0; hop < 6; hop += 1) {
    if (visited.has(current)) throw new Error('The media link contains a redirect loop.');
    visited.add(current);
    const response = await fetch(current, {
      headers: { Range: 'bytes=0-0' },
      redirect: 'manual',
    });
    const followedByFetch = Boolean(response.url && response.url !== current && !(response.status >= 300 && response.status < 400));
    let next = response.url || current;
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('The media link redirected without a destination.');
      next = new URL(location, next).href;
    }
    try { await response.body?.cancel(); } catch { /* the redirect probe body is intentionally discarded */ }
    const validated = validateTranscriptionUrl(next);
    if (!validated) throw new Error('The media link redirects to a non-public HTTPS address.');
    if (validated === current || followedByFetch) return validated;
    current = validated;
  }
  throw new Error('The media link redirected too many times.');
}
const MEDICAL_SOURCES = [
  { id: 'who', name: 'منظمة الصحة العالمية', domain: 'who.int' },
  { id: 'moh', name: 'وزارة الصحة السعودية', domain: 'moh.gov.sa' },
  { id: 'nhs', name: 'NHS', domain: 'nhs.uk' },
  { id: 'medlineplus', name: 'MedlinePlus / NLM', domain: 'medlineplus.gov' },
  { id: 'mayo', name: 'Mayo Clinic', domain: 'mayoclinic.org' },
] as const;
function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function xmlTag(item: string, tag: string) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(item);
  return match ? decodeXml(match[1]) : '';
}
function allowedSourceUrl(value: string, domain: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === domain || url.hostname.endsWith(`.${domain}`)) ? url.href : '';
  } catch { return ''; }
}
async function searchMedicalSource(source: typeof MEDICAL_SOURCES[number], query: string): Promise<MedicalResult[]> {
  const rssUrl = `https://www.bing.com/search?format=rss&count=5&q=${encodeURIComponent(`site:${source.domain} ${query}`)}`;
  try {
    const response = await fetch(rssUrl, { headers: { Accept: 'application/rss+xml, application/xml', 'User-Agent': 'RaqqaMedicalSearch/1.0' } });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
      const item = match[1];
      const url = allowedSourceUrl(xmlTag(item, 'link'), source.domain);
      return { source: source.name, title: xmlTag(item, 'title'), snippet: xmlTag(item, 'description'), url };
    }).filter((item) => item.url && item.title).slice(0, 3);
  } catch { return []; }
}
async function searchMedical(query: string, limit: number): Promise<MedicalResult[]> {
  const results = (await Promise.all(MEDICAL_SOURCES.map((source) => searchMedicalSource(source, query)))).flat();
  const seen = new Set<string>();
  return results.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, limit);
}
app.use('*', async (c, next) => {
  const allowed = c.env?.ALLOWED_ORIGIN?.trim(); const origin = c.req.header('Origin');
  if (allowed && origin && (allowed === '*' || allowed.split(',').map((v) => v.trim()).includes(origin))) {
    c.header('Access-Control-Allow-Origin', allowed === '*' ? '*' : origin); c.header('Vary', 'Origin');
  }
  c.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS'); c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400'); await next();
});
app.use('/api/*', async (c, next) => {
  if (c.req.method === 'POST' && isRateLimited(c)) return jsonError(c, 429, 'Rate limit exceeded.', 'Try again in one minute.');
  await next();
});
app.options('/api/chat', (c) => c.body(null, 204));
app.options('/api/ai/*', (c) => c.body(null, 204));
app.options('/api/medical/search', (c) => c.body(null, 204));
app.get('/health', (c) => c.json({ status: 'ok' }));
app.get('/chat-test', (c) => c.html(chatTestPage));
app.post('/api/ai/transcribe', async (c) => {
  if (!c.env?.GROQ_API_KEY) return jsonError(c, 503, 'Groq transcription is not configured.', 'Set GROQ_API_KEY as a Worker secret.');
  let body: unknown; try { body = await c.req.json(); } catch { return jsonError(c, 400, 'Invalid JSON body.'); }
  if (!isRecord(body)) return jsonError(c, 400, 'Request body must be a JSON object.');
  const mediaUrl = validateTranscriptionUrl(body.url);
  if (!mediaUrl) return jsonError(c, 400, "'url' must be a public HTTPS media link.");

  const form = new FormData();
  form.set('model', 'whisper-large-v3-turbo');
  form.set('language', 'ar');
  form.set('response_format', 'verbose_json');
  form.set('temperature', '0');
  form.set('prompt', 'فرّغ الكلام المنطوق باللغة العربية. حافظ على الأسماء والمصطلحات العربية كما وردت.');
  try {
    const resolvedMediaUrl = await resolveTranscriptionUrl(mediaUrl);
    form.set('url', resolvedMediaUrl);
    const upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${c.env.GROQ_API_KEY}` },
      body: form,
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      let detail = text.slice(0, 1000);
      try {
        const errorBody: unknown = JSON.parse(text);
        if (isRecord(errorBody) && isRecord(errorBody.error) && typeof errorBody.error.message === 'string') detail = errorBody.error.message;
      } catch { /* retain the provider response text when it is not JSON */ }
      return c.json({ error: 'Groq transcription request failed.', status: upstream.status, detail }, upstream.status === 429 ? 429 : 502);
    }
    let result: unknown;
    try { result = JSON.parse(text); } catch { return c.json({ error: 'Groq returned invalid transcription JSON.' }, 502); }
    if (!isRecord(result) || typeof result.text !== 'string' || !result.text.trim()) return c.json({ error: 'Groq returned an empty transcript.' }, 502);
    return c.json({ text: result.text.trim(), language: result.language ?? 'ar', duration: result.duration ?? null, segments: Array.isArray(result.segments) ? result.segments : [], model: 'whisper-large-v3-turbo' });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown network error.';
    return c.json({ error: 'Unable to reach Groq transcription service.', detail }, 502);
  }
});
app.post('/api/medical/search', async (c) => {
  let body: unknown; try { body = await c.req.json(); } catch { return jsonError(c, 400, 'Invalid JSON body.'); }
  if (!isRecord(body) || typeof body.query !== 'string' || body.query.trim().length < 2) return jsonError(c, 400, "'query' must be at least 2 characters.");
  const query = body.query.trim().slice(0, 240);
  const rawLimit = typeof body.limit === 'number' && Number.isFinite(body.limit) ? body.limit : 8;
  const limit = Math.max(1, Math.min(12, Math.floor(rawLimit)));
  const results = await searchMedical(query, limit);
  return c.json({ query, results, sources: MEDICAL_SOURCES.map(({ id, name, domain }) => ({ id, name, domain })) });
});
app.post('/api/chat', async (c) => {
  let raw: unknown; try { raw = await c.req.json(); } catch { return jsonError(c, 400, 'Invalid JSON body.'); }
  const result = validate(raw); if (!result.data) return jsonError(c, 400, 'Validation error.', result.error);
  const request = result.data; let url: string; let payload: Record<string, unknown>;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (request.provider === 'openai' || request.provider === 'groq') {
    const apiKey = request.provider === 'openai' ? c.env?.OPENAI_API_KEY : c.env?.GROQ_API_KEY;
    if (!apiKey) return jsonError(c, 500, 'Provider is not configured.', `Set ${request.provider === 'openai' ? 'OPENAI_API_KEY' : 'GROQ_API_KEY'} as a Worker secret.`);
    url = request.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions';
    headers.Authorization = `Bearer ${apiKey}`;
    payload = { model: request.model ?? (request.provider === 'openai' ? 'gpt-4o-mini' : 'openai/gpt-oss-20b'), messages: request.messages,
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}) };
  } else {
    url = c.env?.RAQA_API_URL?.trim() || 'https://raqa-1zhm.vercel.app/api/chatController';
    if (c.env?.RAQA_API_KEY) headers.Authorization = `Bearer ${c.env.RAQA_API_KEY}`;
    payload = { message: request.messages.map((message) => `${message.role}: ${message.content}`).join('\n') };
    if (request.model !== undefined) payload.model = request.model;
    if (request.temperature !== undefined) payload.temperature = request.temperature;
  }
  try {
    const upstream = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) }); const text = await upstream.text();
    if (!upstream.ok) return c.json({ error: 'Upstream provider request failed.', provider: request.provider, status: upstream.status, detail: text.slice(0, 2000) }, 502);
    let data: unknown; try { data = JSON.parse(text); } catch { return c.json({ error: 'Upstream provider returned invalid JSON.', provider: request.provider }, 502); }
    if (request.provider === 'raqa' && isRecord(data)) {
      const reply = data.reply ?? data.message ?? data.content ?? (isRecord(data.data) ? data.data.reply ?? data.data.message : undefined);
      if (typeof reply === 'string' && reply.trim()) return c.json({ ...data, reply: reply.trim() });
      return c.json({ error: 'Upstream provider returned an empty reply.', provider: request.provider }, 502);
    }
    return c.json(data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown network error.';
    return c.json({ error: 'Unable to reach upstream provider.', provider: request.provider, detail }, 502);
  }
});
app.post('/api/ai/vision', async (c) => {
  if (!c.env?.AI) return jsonError(c, 503, 'Cloudflare Workers AI is not configured.', 'Add the AI binding to the Worker.');
  let body: unknown; try { body = await c.req.json(); } catch { return jsonError(c, 400, 'Invalid JSON body.'); }
  if (!isRecord(body)) return jsonError(c, 400, 'Request body must be a JSON object.');
  const prompt = typeof body.prompt === 'string' && body.prompt.trim() ? body.prompt.trim() : 'Describe this image in detail.';
  if (prompt.length > 4000) return jsonError(c, 400, "'prompt' must be at most 4000 characters.");
  const image = decodeImage(body.image); if (!image.bytes) return jsonError(c, 400, 'Invalid image.', image.error);
  try {
    const result = await c.env.AI.run(VISION_MODEL, { prompt, image: image.bytes, max_tokens: 512 });
    const response = isRecord(result) && typeof result.response === 'string' ? result.response : JSON.stringify(result);
    return c.json({ response, model: VISION_MODEL });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown inference error.';
    return c.json({ error: 'Image analysis failed.', detail }, 502);
  }
});
app.post('/api/ai/image', async (c) => {
  if (!c.env?.AI) return jsonError(c, 503, 'Cloudflare Workers AI is not configured.', 'Add the AI binding to the Worker.');
  let body: unknown; try { body = await c.req.json(); } catch { return jsonError(c, 400, 'Invalid JSON body.'); }
  if (!isRecord(body) || typeof body.prompt !== 'string' || body.prompt.trim() === '') return jsonError(c, 400, "'prompt' must be a non-empty string.");
  const prompt = body.prompt.trim(); if (prompt.length > 2048) return jsonError(c, 400, "'prompt' must be at most 2048 characters.");
  try {
    const result = await c.env.AI.run(IMAGE_MODEL, { prompt, steps: 4 });
    if (!isRecord(result) || typeof result.image !== 'string') return c.json({ error: 'Image model returned an unexpected response.' }, 502);
    return c.json({ image: `data:image/jpeg;base64,${result.image}`, model: IMAGE_MODEL });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown inference error.';
    return c.json({ error: 'Image generation failed.', detail }, 502);
  }
});
export default app;
export { app, validate, decodeImage };
