import React, { useState } from 'react';
import { MessageCircle, Send, X, Trash2 } from 'lucide-react';
import ChatMediaControls from './ChatMediaControls';
import { askPrivateAssistant } from '../services/privateAssistant';

export default function PrivateAssistantWidget({ topic = 'community', title = 'مساعد رِقّة' }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async (event) => {
    event?.preventDefault?.();
    const text = question.trim() || (image ? 'حللي الصورة المرفقة ضمن حدود المعلومات العامة.' : '');
    if (!text || busy) return;
    const attachedImage = image;
    setQuestion('');
    setImage(null);
    setError('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setBusy(true);
    try {
      const response = await askPrivateAssistant({ topic, question: text, image: attachedImage });
      setMessages((current) => [...current, { role: 'assistant', text: response.data.reply }]);
    } catch (requestError) {
      setError(requestError?.message || 'تعذر إرسال السؤال الآن.');
    } finally { setBusy(false); }
  };

  return <section className="raqqa-private-assistant" dir="rtl">
    <style>{`
      .raqqa-private-assistant{margin:14px 0;color:#493640;font-family:'Tajawal',sans-serif}
      .rpa-open{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:14px;padding:11px 15px;background:#9b4167;color:#fff;font:inherit;font-weight:800;cursor:pointer}
      .rpa-panel{position:fixed;z-index:1200;inset:0;background:#28192388;display:grid;place-items:center;padding:14px}
      .rpa-card{width:min(100%,560px);height:min(82vh,720px);display:flex;flex-direction:column;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 18px 60px #27172244}
      .rpa-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:#9b4167;color:#fff}
      .rpa-head button{border:0;background:transparent;color:inherit;cursor:pointer}
      .rpa-note{margin:10px 13px 0;padding:9px 11px;border-radius:12px;background:#fff7e8;color:#735720;font-size:12px;line-height:1.7}
      .rpa-messages{flex:1;overflow:auto;padding:13px;display:flex;flex-direction:column;gap:9px}
      .rpa-msg{max-width:92%;white-space:pre-wrap;overflow-wrap:anywhere;padding:10px 12px;border-radius:14px;line-height:1.75;font-size:14px}
      .rpa-user{align-self:flex-end;background:#f9e9ef}.rpa-assistant{align-self:flex-start;background:#f4f1f3}
      .rpa-error{margin:0 13px;color:#a22d43;font-size:13px}
      .rpa-form{padding:12px;border-top:1px solid #f0e6eb;background:#fff}
      .rpa-input{box-sizing:border-box;width:100%;min-height:58px;resize:vertical;border:1px solid #ead9e1;border-radius:13px;padding:10px;font:inherit;outline-color:#bd6485}
      .rpa-controls{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}
      .rpa-send,.rpa-clear{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:12px;padding:9px 12px;font:inherit;font-weight:800;cursor:pointer}
      .rpa-send{background:#9b4167;color:#fff}.rpa-clear{background:#f5eef1;color:#6f5661}.rpa-send:disabled{opacity:.6;cursor:wait}
    `}</style>
    <button type="button" className="rpa-open" onClick={() => setOpen(true)}><MessageCircle size={18} /> {title}</button>
    {open && <div className="rpa-panel" role="dialog" aria-modal="true" aria-label={title}>
      <div className="rpa-card">
        <header className="rpa-head"><strong>{title} — بحث محلي ورد متخصص</strong><button type="button" onClick={() => setOpen(false)} aria-label="إغلاق"><X size={21} /></button></header>
        <p className="rpa-note">قد يحدّث التطبيق محتوى القسم المنشور باسم القسم فقط، ثم يفلتر سؤالك على هذا الجهاز؛ لا يُرسل نص البحث إلى خادم المحتوى ولا يُستخدم محرك ويب. عند الإرسال، يُعالج السؤال والمقاطع المختارة عبر Cloudflare وGroq، والصورة عبر Cloudflare AI. لا يسجل هذا المساعد المحادثة، لكن بعض ميزات التحليل قد تحفظ تقارير في حسابك. يلزم تسجيل الدخول.</p>
        <div className="rpa-messages" aria-live="polite">
          {!messages.length && <div className="rpa-msg rpa-assistant">أستطيع مساعدتكِ في أسئلة عامة مرتبطة بمحتوى هذه الصفحة. لن أبحث في منشورات العضوات أو بياناتهن الخاصة.</div>}
          {messages.map((message, index) => <div className={`rpa-msg ${message.role === 'user' ? 'rpa-user' : 'rpa-assistant'}`} key={`${index}-${message.role}`}>{message.text}</div>)}
          {busy && <div className="rpa-msg rpa-assistant">جارٍ البحث محليًا وإعداد الإجابة…</div>}
        </div>
        {error && <p className="rpa-error" role="alert">{error}</p>}
        <form className="rpa-form" onSubmit={send}>
          <textarea className="rpa-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="اكتبي سؤالك…" maxLength={12000} />
          <div className="rpa-controls">
            <ChatMediaControls imageData={image} onImageSelected={setImage} onImageRemoved={() => setImage(null)} disabled={busy} accent="#9b4167" />
            <button type="button" className="rpa-clear" onClick={() => setMessages([])} title="مسح المحادثة من الذاكرة"><Trash2 size={16} /> مسح</button>
            <button type="submit" className="rpa-send" disabled={busy || (!question.trim() && !image)}><Send size={16} /> إرسال</button>
          </div>
        </form>
      </div>
    </div>}
  </section>;
}
