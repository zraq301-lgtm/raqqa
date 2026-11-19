import { getFirebaseIdToken } from './authService';
import { isCacheFresh, readPageCache } from './contentCache';
import { fetchPageData } from './adminService';

const AI_GATEWAY_BASE = (import.meta.env.VITE_AI_GATEWAY_URL || 'https://ai-chat-gateway.raqqa-api.workers.dev').replace(/\/$/, '');
const CONSENT_KEY = 'raqqa_private_ai_consent_v1';
const MAX_EVIDENCE = 5;
const TOPIC_PAGES = {
  cycle: ['الحيض', 'صحتك', 'نصيحة طبيب'],
  breastfeeding: ['الرضاعة', 'الأمومة', 'نصيحة طبيب'],
  motherhood: ['الأمومة', 'صحتك'],
  pregnancy: ['الحمل', 'نصيحة طبيب', 'صحتك'],
  doctor: ['الطبيب', 'نصيحة طبيب', 'صحتك'],
  fitness: ['الرشاقة', 'صحتك', 'نصيحة اليوم'],
  advice: ['نصيحة طبيب', 'صحتك'],
  emotions: ['المشاعر', 'كوني ملكة'],
  fiqh: ['كوني ملكة', 'الإشراقة', 'نصيحة اليوم'],
  relationships: ['الحميمية', 'الأرجوحة'],
  community: ['الأرجوحة', 'bouh-display-1', 'bouh-display'],
};
const ARABIC_STOP_WORDS = new Set('من في على عن إلى الى هل ما ماذا كيف لماذا متى اين أي اي مع هذا هذه ذلك التي الذي هو هي كان تكون تم انا أنا انت انتِ انتي لي لك لنا به بها و أو ثم يا قد كل بعض عند بعد قبل كما لا ما'.split(' '));

const normalize = (value = '') => String(value)
  .toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const tokenize = (value) => [...new Set(normalize(value).split(/\s+/).filter((word) => word.length > 1 && !ARABIC_STOP_WORDS.has(word)))];
const safeUrl = (value) => {
  if (typeof value !== 'string') return '';
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
};

function contentRecord(item, pageName) {
  const article = item?.article || {};
  const title = String(article.title || item?.title || item?.name || '').trim();
  const text = String(article.body || item?.body || item?.content || '').trim();
  if (!title && !text) return null;
  const candidateUrl = article.sourceUrl || article.source_url || article.referenceUrl || item?.sourceUrl || item?.source_url || item?.referenceUrl || '';
  return {
    title: title || `محتوى ${pageName}`,
    pageName: String(item?.pageName || pageName),
    text: text.slice(0, 3_000),
    url: safeUrl(candidateUrl),
  };
}

async function readLocalDocuments(topic) {
  const pageNames = TOPIC_PAGES[topic] || [];
  const cachedPages = await Promise.all(pageNames.map(async (pageName) => {
    try {
      let entry = await readPageCache(pageName);
      if (!isCacheFresh(entry)) {
        try { await fetchPageData(pageName); entry = await readPageCache(pageName) || entry; } catch { /* use the offline copy when available */ }
      }
      return { pageName, entry };
    } catch { return { pageName, entry: null }; }
  }));
  const docs = cachedPages.flatMap(({ pageName, entry }) => (entry?.items || []).map((item) => contentRecord(item, pageName)).filter(Boolean));
  const seen = new Set();
  return docs.filter((item) => {
    const key = `${item.pageName}|${item.title}|${item.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(item.text);
  });
}

export async function searchLocalKnowledge(topic, question, limit = MAX_EVIDENCE) {
  const terms = tokenize(question);
  if (!terms.length) return [];
  const documents = await readLocalDocuments(topic);
  return documents.map((document) => {
    const titleText = normalize(document.title);
    const bodyText = normalize(document.text);
    let score = 0;
    for (const term of terms) {
      if (titleText.includes(term)) score += 4;
      const matches = bodyText.split(term).length - 1;
      score += Math.min(matches, 4);
    }
    return { document, score };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document }) => ({ title: document.title, pageName: document.pageName, text: document.text.slice(0, 3_000), ...(document.url ? { url: document.url } : {}) }));
}

function requestConsent() {
  try { if (sessionStorage.getItem(CONSENT_KEY) === 'yes') return true; } catch { /* sessionStorage may be unavailable in embedded browsers */ }
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') return false;
  const accepted = window.confirm('قد يحدّث التطبيق محتوى الأقسام المنشور باسم القسم فقط، ثم يفلتر سؤالك على هذا الجهاز؛ لا تُرسل كلمات البحث إلى خادم المحتوى ولا يُجرى بحث ويب. لإعداد الرد، سيُرسل السؤال والمقاطع المرتبطة فقط إلى Cloudflare وGroq، والصورة إلى Cloudflare AI عند إرفاقها. لا تنشئ نقطة المساعد سجل محادثة؛ لكن بعض وظائف التحليل والحفظ قد تحفظ تقارير في حسابك. هل تتابعين؟');
  if (accepted) { try { sessionStorage.setItem(CONSENT_KEY, 'yes'); } catch { /* consent applies to this view only */ } }
  return accepted;
}

async function postJson(path, token, payload) {
  const response = await fetch(`${AI_GATEWAY_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `تعذر إكمال الطلب (${response.status}).`);
  return data;
}

export async function askPrivateAssistant({ topic, question, image }) {
  const text = String(question || '').trim() || (image ? 'حللي الصورة المرفقة ضمن حدود المعلومات العامة.' : '');
  if (!text) throw new Error('اكتبي سؤالًا قبل الإرسال.');
  if (!Object.prototype.hasOwnProperty.call(TOPIC_PAGES, topic)) throw new Error('قسم المساعد غير معروف.');
  const token = await getFirebaseIdToken();
  if (!token) throw new Error('سجّلي الدخول أولًا لاستخدام المساعد الخاص وحماية بياناتك.');
  if (!requestConsent()) throw new Error('لم يتم إرسال السؤال؛ لم تُمنح الموافقة على المعالجة لدى Cloudflare وGroq.');

  const evidence = await searchLocalKnowledge(topic, text);
  let imageDescription = '';
  if (image) {
    const vision = await postJson('/api/private/vision', token, { image });
    imageDescription = String(vision.response || '').slice(0, 2_000);
  }
  const result = await postJson('/api/private/assistant', token, {
    topic,
    question: text.slice(0, 12_000),
    evidence,
    ...(imageDescription ? { imageDescription } : {}),
  });
  const citations = Array.isArray(result.citations) ? result.citations : [];
  const sourceText = citations.length
    ? `\n\nمراجع محلية من مكتبة رِقّة:\n${citations.map((source) => `• ${source.id}: ${source.title} — قسم ${source.pageName}${source.url ? ` — ${source.url}` : ''}`).join('\n')}`
    : '\n\nلم يعثر البحث المحلي على مادة منشورة مرتبطة مباشرة بالسؤال؛ لم يُجرَ بحث على الويب.';
  const reply = `${String(result.reply || 'تعذر إنشاء الرد الآن.').trim()}${sourceText}`;
  return { data: { reply, message: reply, citations, imageDescription } };
}
