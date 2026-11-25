import React, { useState } from 'react';
import { ChevronDown, MessageCircle, Send, X } from 'lucide-react';
import { askMiniCourseAssistant } from '../services/miniCourseTraining';

const COURSE_URL = 'https://share.minicoursegenerator.com/--76000527';

export default function MiniCourseTraining() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setQuestion(''); setError(''); setMessages((items) => [...items, { role: 'user', text }]); setBusy(true);
    try {
      const reply = await askMiniCourseAssistant(text);
      setMessages((items) => [...items, { role: 'assistant', text: reply }]);
    } catch (requestError) { setError(requestError.message || 'تعذر إرسال السؤال الآن.'); }
    finally { setBusy(false); }
  };

  return <section className="mini-course-training" dir="rtl" aria-label="التدريب القادم">
    <style>{`.mini-course-training{margin:18px auto 24px;max-width:620px;padding:17px;border:1px solid #efd6e2;border-radius:24px;background:linear-gradient(145deg,#fff,#fff7fb);box-shadow:0 10px 26px rgba(123,49,87,.1);font-family:'Tajawal',sans-serif}.mini-course-kicker{color:#b12a68;font-size:11px;font-weight:900}.mini-course-title{margin:4px 0;color:#442235;font-size:20px;line-height:1.6}.mini-course-copy{margin:0 0 13px;color:#76616d;font-size:12px;line-height:1.8}.mini-course-open{display:inline-flex;align-items:center;gap:7px;border:0;border-radius:14px;padding:11px 15px;background:#b12a68;color:#fff;font:inherit;font-weight:900;cursor:pointer}.mini-course-body{margin-top:15px}.mini-course-frame{width:100%;height:min(72vh,720px);min-height:520px;border:1px solid #edd6e2;border-radius:17px;background:#fff}.mini-course-frame iframe{width:100%;height:100%;border:0;border-radius:17px}.mini-course-tools{display:flex;justify-content:space-between;align-items:center;gap:9px;margin-top:11px}.mini-course-chat-button,.mini-course-close-chat{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:12px;padding:10px 12px;background:#fceaf2;color:#9f245d;font:inherit;font-weight:800;cursor:pointer}.mini-course-close-chat{background:#fff;color:#8c6377}.mini-course-chat{margin-top:12px;border:1px solid #edd6e2;border-radius:17px;background:#fff;overflow:hidden}.mini-course-chat-head{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;background:#9b4167;color:#fff}.mini-course-chat-head button{border:0;background:none;color:inherit;cursor:pointer}.mini-course-messages{max-height:260px;overflow:auto;padding:11px;display:flex;flex-direction:column;gap:8px}.mini-course-message{max-width:92%;padding:9px 11px;border-radius:13px;white-space:pre-wrap;line-height:1.7;font-size:13px}.mini-course-message.user{align-self:flex-end;background:#f9e9ef}.mini-course-message.assistant{align-self:flex-start;background:#f4f1f3}.mini-course-chat-form{display:flex;gap:7px;padding:10px;border-top:1px solid #f0e6eb}.mini-course-chat-form textarea{flex:1;min-height:44px;resize:vertical;border:1px solid #ead9e1;border-radius:11px;padding:8px;font:inherit}.mini-course-send{display:grid;place-items:center;width:42px;border:0;border-radius:11px;background:#9b4167;color:#fff;cursor:pointer}.mini-course-send:disabled{opacity:.5}.mini-course-error{margin:0;padding:0 11px 9px;color:#a22d43;font-size:12px}`}</style>
    <span className="mini-course-kicker">التدريب القادم داخل رِقّة</span>
    <h2 className="mini-course-title">إدارة الوقت بوعي</h2>
    <p className="mini-course-copy">تدريب ملون يساعدكِ على ترتيب الأولويات، بناء يوم واقعي، وتحقيق توازن أفضل بين الإنجاز والراحة.</p>
    {!open && <button type="button" className="mini-course-open" onClick={() => setOpen(true)}>ابدئي التدريب داخل التطبيق <ChevronDown size={17} /></button>}
    {open && <div className="mini-course-body">
      <iframe className="mini-course-frame" src={COURSE_URL} title="تدريب إدارة الوقت بوعي من رِقّة" allow="fullscreen; autoplay" />
      <div className="mini-course-tools"><button type="button" className="mini-course-chat-button" onClick={() => setChatOpen((value) => !value)}><MessageCircle size={17} /> {chatOpen ? 'إخفاء شات التدريب' : 'اسألي شات التدريب'}</button><button type="button" className="mini-course-close-chat" onClick={() => setOpen(false)}>إغلاق التدريب</button></div>
      {chatOpen && <div className="mini-course-chat"><header className="mini-course-chat-head"><strong>مدربة إدارة الوقت</strong><button type="button" onClick={() => setChatOpen(false)} aria-label="إغلاق الشات"><X size={18} /></button></header><div className="mini-course-messages" aria-live="polite">{!messages.length && <div className="mini-course-message assistant">أنا معكِ أثناء التدريب. اسأليني عن ترتيب الأولويات أو بناء خطة يوم واقعية أو تجاوز أي تحدٍّ في التطبيق.</div>}{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`mini-course-message ${message.role}`}>{message.text}</div>)}{busy && <div className="mini-course-message assistant">أفكر في إجابة مرتبطة بالتدريب…</div>}</div>{error && <p className="mini-course-error" role="alert">{error}</p>}<form className="mini-course-chat-form" onSubmit={send}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="اكتبي سؤالك أثناء التدريب…" maxLength={6000} /><button className="mini-course-send" type="submit" disabled={busy || !question.trim()} aria-label="إرسال السؤال"><Send size={17} /></button></form></div>}
    </div>}
  </section>;
}
