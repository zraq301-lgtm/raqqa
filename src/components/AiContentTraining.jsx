import React, { useState } from 'react';
import { Brain, Check, Loader2, Sparkles } from 'lucide-react';
import { createContentTraining } from '../services/contentTraining';

export default function AiContentTraining({ pageName, title, contentHtml, questions, mediaUrls = [], videoUrl = '', accent = '#b08968' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cards, setCards] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const startTraining = async () => {
    setOpen(true);
    if (cards.length || loading) return;
    setLoading(true);
    setError('');
    try {
      const generated = await createContentTraining({ pageName, title, contentHtml, questions, mediaUrls, videoUrl });
      setCards(generated.cards);
      setTranscript(generated.transcript || '');
    } catch (issue) {
      setError(issue?.message || 'تعذر إنشاء التدريب الآن. حاولي مجددًا.');
    } finally {
      setLoading(false);
    }
  };

  return <section className="ai-content-training" style={{ '--ai-training-accent': accent }} dir="rtl">
    <button className="ai-training-trigger" type="button" onClick={open ? () => setOpen(false) : startTraining} aria-expanded={open}>
      <span className="ai-training-trigger-icon"><Brain size={19} aria-hidden="true" /></span>
      <span className="ai-training-trigger-copy"><strong>{open ? 'إخفاء التدريب' : 'تدرّب مع الذكاء'}</strong><small>خمسة تمارين تفاعلية من محتوى المنشور</small></span>
      <Sparkles className="ai-training-sparkle" size={17} aria-hidden="true" />
    </button>

    {open && <div className="ai-training-panel">
      <div className="ai-training-panel-heading"><div><span>مساحة تدريبك</span><h3>{title || 'تعلّمي بالتطبيق'}</h3></div><span className="ai-training-count">{cards.length ? '٥ بطاقات' : 'مخصص للمحتوى'}</span></div>
      <p className="ai-training-intro">تدريبات قصيرة تساعدك على فهم الفكرة وتجربة المهارة خطوة بخطوة.</p>
      {videoUrl && <p className="ai-training-privacy-note">عند بدء التدريب، سيُرسل عنوان المنشور ورابط الفيديو إلى Groq كمرجع للتحليل، من دون رفع ملف الفيديو أو محاولة تفريغه.</p>}
      {loading && <div className="ai-training-status" role="status"><Loader2 className="ai-training-spinner" size={20} /> {videoUrl ? 'نحلل عنوان ورابط الفيديو عبر Groq ثم نجهّز تمارينك…' : 'نجهّز لكِ التمارين من محتوى المنشور وأسئلته…'}</div>}
      {error && <div className="ai-training-error" role="alert"><p>{error}</p><button type="button" onClick={() => { setCards([]); startTraining(); }}>إعادة المحاولة</button></div>}
      {!!transcript && <details className="ai-training-transcript"><summary>عرض تفريغ الفيديو</summary><p>{transcript}</p></details>}
      {!!cards.length && <div className="ai-training-grid">{cards.map((card, index) => {
        const isRevealed = Boolean(revealed[card.id]);
        const isCorrect = answers[card.id] === card.answer;
        return <article className={`ai-training-card ${isRevealed ? 'is-answered' : ''}`} key={card.id}>
          <div className="ai-training-card-top"><span className="ai-training-number">{String(index + 1).padStart(2, '0')}</span><span className="ai-training-skill">{card.skill}</span></div>
          <h4>{card.question}</h4>
          <div className="ai-training-options">{card.choices.map((choice) => <button type="button" key={choice} disabled={isRevealed} aria-pressed={answers[card.id] === choice} className={`${answers[card.id] === choice ? 'is-selected' : ''} ${isRevealed && choice === card.answer ? 'is-answer' : ''}`} onClick={() => setAnswers((current) => ({ ...current, [card.id]: choice }))}>{choice}{isRevealed && choice === card.answer && <Check size={16} />}</button>)}</div>
          {!isRevealed ? <button type="button" className="ai-training-submit" disabled={!answers[card.id]} onClick={() => setRevealed((current) => ({ ...current, [card.id]: true }))}>تحقّقي من إجابتك</button> : <div className={`ai-training-feedback ${isCorrect ? 'is-correct' : 'is-review'}`}><strong>{isCorrect ? 'أحسنتِ، إجابة موفّقة!' : 'راجعي الفكرة ثم جرّبي من جديد'}</strong><span>{card.explanation}</span></div>}
        </article>;
      })}</div>}
      {!loading && !error && !cards.length && <div className="ai-training-empty">سيتم إعداد الأسئلة بناءً على نص المنشور والأسئلة الموجودة فيه وعنوان ورابط الفيديو عند توفرهما.</div>}
    </div>}

    <style>{`.ai-content-training{margin:16px 0 18px}.ai-training-trigger{width:100%;display:flex;align-items:center;gap:12px;text-align:right;padding:13px 15px;border:1px solid color-mix(in srgb,var(--ai-training-accent) 30%,#fff);border-radius:17px;background:linear-gradient(120deg,#fff,#fffaf5);color:#493a34;cursor:pointer;box-shadow:0 6px 18px rgba(80,54,40,.07);font:inherit;transition:transform .18s ease,box-shadow .18s ease}.ai-training-trigger:hover{transform:translateY(-1px);box-shadow:0 9px 22px rgba(80,54,40,.11)}.ai-training-trigger-icon{width:42px;height:42px;border-radius:14px;background:color-mix(in srgb,var(--ai-training-accent) 14%,white);color:var(--ai-training-accent);display:grid;place-items:center;flex:none}.ai-training-trigger-copy{display:flex;flex-direction:column;gap:3px;flex:1}.ai-training-trigger-copy strong{font-size:15px;color:var(--ai-training-accent)}.ai-training-trigger-copy small{font-size:11px;color:#897c75}.ai-training-sparkle{color:#d4a24e}.ai-training-panel{margin-top:12px;padding:16px;border-radius:20px;background:linear-gradient(145deg,#fffdfa,#fff8f1);border:1px solid #f0e4d8;box-shadow:0 8px 24px rgba(80,54,40,.06)}.ai-training-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.ai-training-panel-heading>div>span{font-size:11px;font-weight:800;color:var(--ai-training-accent)}.ai-training-panel-heading h3{font-size:17px;color:#493a34;margin:3px 0 0;line-height:1.5}.ai-training-count{font-size:11px;font-weight:700;color:#887a70;background:#fff;border:1px solid #f0e6dd;border-radius:99px;padding:6px 9px;white-space:nowrap}.ai-training-intro{font-size:12px;line-height:1.7;color:#82756d;margin:8px 0 14px}.ai-training-privacy-note,.ai-training-transcript{display:block;margin:10px 0;padding:10px 12px;border:1px solid #e9ddd1;border-radius:12px;background:#fff;color:#71635a;font-size:11px;line-height:1.8}.ai-training-privacy-note{background:#fff9ef;border-color:#f1e0c3}.ai-training-transcript summary{cursor:pointer;font-weight:800;color:var(--ai-training-accent)}.ai-training-transcript p{white-space:pre-wrap;max-height:260px;overflow:auto;margin:8px 0 0}.ai-training-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:11px}.ai-training-card{background:#fff;border:1px solid #efe6dd;border-radius:16px;padding:14px;box-shadow:0 4px 13px rgba(70,48,36,.04);display:flex;flex-direction:column}.ai-training-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.ai-training-number{width:31px;height:31px;display:grid;place-items:center;border-radius:11px;background:var(--ai-training-accent);color:#fff;font-size:12px;font-weight:800;direction:ltr}.ai-training-skill{font-size:10px;font-weight:800;color:var(--ai-training-accent);background:color-mix(in srgb,var(--ai-training-accent) 10%,white);padding:5px 8px;border-radius:99px}.ai-training-card h4{font-size:14px;line-height:1.8;color:#4c3d35;margin:12px 0 10px}.ai-training-options{display:grid;gap:7px}.ai-training-options button{display:flex;align-items:center;justify-content:space-between;gap:7px;border:1px solid #eee5dc;border-radius:11px;background:#fffdfa;padding:9px 10px;text-align:right;color:#65564d;font:inherit;font-size:12px;line-height:1.55;cursor:pointer}.ai-training-options button.is-selected{border-color:var(--ai-training-accent);background:color-mix(in srgb,var(--ai-training-accent) 8%,white)}.ai-training-options button.is-answer{border-color:#76b787;background:#eff9f0;color:#326e40}.ai-training-options button:disabled{cursor:default}.ai-training-submit,.ai-training-error button{margin-top:11px;width:100%;border:0;border-radius:11px;background:var(--ai-training-accent);color:#fff;padding:10px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.ai-training-submit:disabled{opacity:.45;cursor:not-allowed}.ai-training-feedback{display:flex;flex-direction:column;gap:4px;margin-top:10px;border-radius:11px;padding:10px;font-size:11px;line-height:1.65}.ai-training-feedback.is-correct{background:#eff9f0;color:#326e40}.ai-training-feedback.is-review{background:#fff6ed;color:#815e43}.ai-training-status{display:flex;align-items:center;justify-content:center;gap:9px;min-height:72px;color:#74665d;font-size:13px}.ai-training-spinner{animation:ai-training-spin 1s linear infinite;color:var(--ai-training-accent)}@keyframes ai-training-spin{to{transform:rotate(360deg)}}.ai-training-error{padding:12px;border-radius:12px;background:#fff1ef;color:#984b3e;font-size:12px;line-height:1.7}.ai-training-error p{margin:0}.ai-training-error button{width:auto;padding:8px 13px}.ai-training-empty{padding:11px;border-radius:12px;background:#fff;border:1px dashed #e9ddd1;color:#83766e;font-size:11px;line-height:1.8}@media(max-width:480px){.ai-training-panel{padding:12px}.ai-training-grid{grid-template-columns:1fr}.ai-training-card{padding:12px}}@media(prefers-reduced-motion:reduce){.ai-training-trigger{transition:none}.ai-training-spinner{animation-duration:2.5s}}`}</style>
  </section>;
}
