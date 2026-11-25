import { getFirebaseIdToken } from './authService';

const AI_GATEWAY_BASE = (import.meta.env.VITE_AI_GATEWAY_URL || 'https://ai-chat-gateway.raqqa-api.workers.dev').replace(/\/$/, '');

function parseAdvice(reply) {
  if (reply && typeof reply === 'object') return reply.insights || reply.cards || reply.advice || [];
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
      return Array.isArray(parsed) ? parsed : parsed.insights || parsed.cards || parsed.advice || [];
    } catch { /* try the next JSON-shaped section */ }
  }
  throw new Error('لم يصل تحليل واضح لأداء التدريب. حاولي مرة أخرى.');
}

export async function analyzeTrainingAttempt({ pageName, title, cards = [], attempts = {}, score = 0, total = 0 }) {
  const token = await getFirebaseIdToken();
  if (!token) throw new Error('سجّلي الدخول أولًا لتحليل نتيجة التدريب.');
  const response = await fetch(`${AI_GATEWAY_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      provider: 'groq',
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content: 'أنتِ مدربة تعلم عربية لطيفة ودقيقة. حلّلي أداء المتدربة بعد انتهاء التدريب فقط. أعيدي من 3 إلى 5 كروت نصائح عملية وملونة منطقيًا، تركز على ما أتقنته وما تحتاج إلى مراجعته وخطوة تطبيقية صغيرة. لا تعيدي أسئلة الاختبار ولا تلومي المتدربة. أعيدي JSON صالحًا فقط بالشكل: {"insights":[{"title":"عنوان قصير","type":"strength|focus|action|encouragement","message":"نصيحة واضحة ومشجعة","action":"خطوة عملية قابلة للتنفيذ"}]}. اجعلي النصائح مبنية فقط على بيانات التدريب والإجابات المرسلة.'
        },
        {
          role: 'user',
          content: JSON.stringify({ pageName, title, score, total, cards, attempts }, null, 2).slice(0, 24_000)
        }
      ]
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error || `تعذر تحليل نتيجة التدريب (${response.status}).`);
  const rawReply = result.reply || result.message || result.content || result.choices?.[0]?.message?.content || result;
  const insights = parseAdvice(rawReply).slice(0, 5).map((item, index) => ({
    id: `training-insight-${index}`,
    title: String(item.title || 'ملاحظة تدريبية').trim(),
    type: ['strength', 'focus', 'action', 'encouragement'].includes(item.type) ? item.type : 'action',
    message: String(item.message || item.advice || '').trim(),
    action: String(item.action || '').trim(),
  })).filter((item) => item.message);
  if (!insights.length) throw new Error('لم يتم إنشاء نصائح تدريبية مكتملة. حاولي مرة أخرى.');
  return insights;
}
