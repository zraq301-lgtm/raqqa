import { getFirebaseIdToken } from './authService';

const AI_GATEWAY_BASE = (import.meta.env.VITE_AI_GATEWAY_URL || 'https://ai-chat-gateway.raqqa-api.workers.dev').replace(/\/$/, '');
const COURSE_CONTEXT = 'دورة إدارة الوقت بوعي – رِقّة. محاورها: ترتيب الأولويات، بناء خطة يوم واقعية، تحقيق التوازن والراحة، وتجاوز التحديات. أجيبي بالعربية وبصيغة مخاطبة مؤنثة، وقدّمي توجيهًا عمليًا قصيرًا مرتبطًا بهذه المحاور. لا تدّعي معرفة إجابات أو درجات المتدربة من داخل منصة الدورة، ولا تقدمي تشخيصًا أو وعودًا قاطعة.';

export async function askMiniCourseAssistant(question) {
  const text = String(question || '').trim();
  if (!text) throw new Error('اكتبي سؤالك أولًا.');
  const token = await getFirebaseIdToken();
  if (!token) throw new Error('سجّلي الدخول أولًا لاستخدام شات التدريب.');
  const response = await fetch(`${AI_GATEWAY_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      provider: 'raqa',
      temperature: 0.4,
      messages: [
        { role: 'system', content: COURSE_CONTEXT },
        { role: 'user', content: text.slice(0, 6000) },
      ],
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error || `تعذر إرسال السؤال (${response.status}).`);
  const reply = String(result.reply || result.message || result.content || '').trim();
  if (!reply) throw new Error('لم يصل رد من شات التدريب.');
  return reply;
}
