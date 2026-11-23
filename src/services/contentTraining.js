import { getFirebaseIdToken } from './authService';

const AI_GATEWAY_BASE = (import.meta.env.VITE_AI_GATEWAY_URL || 'https://ai-chat-gateway.raqqa-api.workers.dev').replace(/\/$/, '');

function stripHtml(value = '') {
  if (typeof document === 'undefined') return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const node = document.createElement('div');
  node.innerHTML = String(value);
  node.querySelectorAll('script,style').forEach((element) => element.remove());
  return (node.textContent || '').replace(/\s+/g, ' ').trim();
}

function collectLinks(html = '', mediaUrls = []) {
  const found = new Set((Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls]).filter(Boolean));
  if (typeof document !== 'undefined') {
    const node = document.createElement('div');
    node.innerHTML = String(html);
    node.querySelectorAll('a[href],iframe[src],video[src],audio[src],source[src]').forEach((element) => {
      const url = element.getAttribute('href') || element.getAttribute('src');
      if (url && /^https:\/\//i.test(url)) found.add(url);
    });
  }
  return [...found].slice(0, 8);
}

function parseCards(reply) {
  if (Array.isArray(reply)) return reply;
  if (reply && typeof reply === 'object') return reply.cards || reply.trainingCards || [];
  const text = String(reply || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const arrayStart = text.indexOf('[');
  const arrayEnd = text.lastIndexOf(']');
  const candidates = [];
  if (start >= 0 && end > start) candidates.push(text.slice(start, end + 1));
  if (arrayStart >= 0 && arrayEnd > arrayStart) candidates.push(text.slice(arrayStart, arrayEnd + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? parsed : parsed.cards || parsed.trainingCards || [];
    } catch { /* try the next JSON-shaped section */ }
  }
  throw new Error('لم يصل تنسيق بطاقات التدريب بشكل صحيح. حاولي مرة أخرى.');
}

export async function createContentTraining({ pageName, title, contentHtml, questions = [], mediaUrls = [], videoUrl = '' }) {
  const body = stripHtml(contentHtml).slice(0, 10_000);
  const links = collectLinks(contentHtml, mediaUrls);
  const existingQuestions = (Array.isArray(questions) ? questions : []).map((item) => ({
    question: item?.question || item?.prompt || item?.title || '',
    choices: Array.isArray(item?.choices) ? item.choices : [],
    answer: item?.answer || item?.correctAnswer || '',
  })).filter((item) => item.question).slice(0, 12);

  const token = await getFirebaseIdToken();
  if (!token) throw new Error('سجّلي الدخول أولًا لاستخدام التدريب الذكي.');
  const videoReference = videoUrl ? { title: String(title || '').trim(), url: videoUrl } : null;
  if (!body && !links.length && !existingQuestions.length && !videoReference) {
    throw new Error('لا يوجد نص أو أسئلة أو رابط يمكن بناء التدريب عليه في هذا المنشور.');
  }

  const response = await fetch(`${AI_GATEWAY_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      provider: 'groq',
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content: 'أنتِ مصممة تعلم عربية. أنشئي بالضبط خمسة أسئلة تدريبية متنوعة، قصيرة وواضحة، تستهدف المهارة التي يعلّمها المحتوى. استخدمي نص المنشور والأسئلة المرفقة ومرجع الفيديو (عنوانه ورابطه) فقط. لا تدّعي مشاهدة محتوى الرابط أو اختلاق تفاصيل غير موجودة؛ إذا لم يتوفر شرح كافٍ فاجعلي الأسئلة تطبيقية ومبنية على النص المتاح. أعيدي JSON صالحًا فقط بالشكل: {"cards":[{"skill":"اسم المهارة","question":"سؤال تطبيقي","choices":["خيار 1","خيار 2","خيار 3","خيار 4"],"answer":"نص الخيار الصحيح حرفيًا","explanation":"تغذية راجعة موجزة تشرح الإجابة"}]}. اجعلي لكل بطاقة أربعة خيارات مختلفة وإجابة صحيحة واحدة، ووزعي الإجابة الصحيحة بين الخيارات. لا تضيفي Markdown أو أي نص خارج JSON.'
        },
        {
          role: 'user',
          content: JSON.stringify({ page: pageName, title, articleText: body, videoReference, questions: existingQuestions, relatedLinks: links }, null, 2).slice(0, 24_000)
        }
      ]
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error || `تعذر إنشاء التدريب (${response.status}).`);
  const rawReply = result.reply || result.message || result.content || result.choices?.[0]?.message?.content || result;
  const cards = parseCards(rawReply).slice(0, 5).map((card, index) => {
    const choices = (Array.isArray(card.choices) ? card.choices : []).map((choice) => String(choice).trim()).filter(Boolean).slice(0, 4);
    const answer = String(card.answer || card.correctAnswer || '').trim();
    if (!card.question || choices.length < 2 || !choices.includes(answer)) return null;
    return {
      id: `ai-training-${index}`,
      skill: String(card.skill || 'تطبيق المهارة').trim(),
      question: String(card.question).trim(),
      choices,
      answer,
      explanation: String(card.explanation || '').trim(),
    };
  }).filter(Boolean);
  if (cards.length !== 5) throw new Error('لم يتم إنشاء خمس بطاقات مكتملة؛ حاولي مرة أخرى.');
  return { cards, transcript: '' };
}
