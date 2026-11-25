import React, { useEffect, useState } from 'react';
import { ExternalLink, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { fetchTrainings } from '../services/adminService';
import { analyzeTrainingAttempt } from '../services/trainingCoach';

const TONES = {
  strength: { label: 'نقطة قوة', color: '#23845b', background: '#effaf4', icon: '✦' },
  focus: { label: 'تحتاج مراجعة', color: '#b66a27', background: '#fff6e9', icon: '◎' },
  action: { label: 'خطوة عملية', color: '#5665bb', background: '#f1f3ff', icon: '↗' },
  encouragement: { label: 'تشجيع', color: '#b04d78', background: '#fff0f6', icon: '♡' },
};

export default function TrainingLinksSection({ section }) {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [reflection, setReflection] = useState({});
  const [insights, setInsights] = useState({});
  const [loadingId, setLoadingId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    fetchTrainings(section).then((result) => mounted && setItems(result)).catch((error) => console.warn('[TrainingLinks] تعذر تحميل التدريبات:', error?.message || error));
    return () => { mounted = false; };
  }, [section]);

  const finishTraining = async (training) => {
    if (loadingId) return;
    setLoadingId(training.id);
    setErrors((current) => ({ ...current, [training.id]: '' }));
    try {
      const result = await analyzeTrainingAttempt({
        pageName: section,
        title: training.title,
        description: training.description || '',
        cards: [],
        attempts: { reflection: reflection[training.id]?.trim() || 'أنهيت التدريب وأحتاج إلى توجيه عملي لتطبيق ما تعلمته.' },
        score: 0,
        total: 0,
      });
      setInsights((current) => ({ ...current, [training.id]: result.slice(0, 5) }));
    } catch (error) {
      setErrors((current) => ({ ...current, [training.id]: error?.message || 'تعذر إنشاء النصائح الآن.' }));
    } finally {
      setLoadingId('');
    }
  };

  if (!items.length) return null;
  return <section className="training-links-section" dir="rtl" aria-label={`المساحة التدريبية في ${section}`}>
    <div className="training-links-heading"><div className="training-links-icon"><GraduationCap size={23} /></div><div><span>مساحة تدريبية</span><h2>تعلّمي بخطوات عملية</h2></div></div>
    <div className="training-links-list">
      {items.map((training) => <article className="training-link-card" key={training.id}>
        {training.thumbnailUrl && <img src={training.thumbnailUrl} alt="" loading="lazy" />}
        <div className="training-link-copy"><h3>{training.title}</h3>{training.description && <p>{training.description}</p>}
          <div className="training-link-actions"><button type="button" onClick={() => setOpenId((current) => current === training.id ? null : training.id)}>{openId === training.id ? 'إغلاق التدريب' : 'ابدئي التدريب'}</button><a href={training.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> فتح خارجي</a></div>
        </div>
        {openId === training.id && <div className="training-link-completion">
          <div className="training-link-frame-wrap"><iframe src={training.url} title={training.title} loading="lazy" allow="fullscreen; autoplay" /></div>
          <div className="training-finish-box"><h4><Sparkles size={18} /> خلصتِ التدريب؟</h4><p>اكتبي في سطر واحد أهم شيء خرجتِ به، وسيربطه الشات بنصائح عملية تناسبكِ.</p><textarea value={reflection[training.id] || ''} onChange={(event) => setReflection((current) => ({ ...current, [training.id]: event.target.value }))} placeholder="مثال: تعلّمت أن أبدأ بالأهم وأترك وقتًا للراحة…" rows="3" maxLength="1200" />
            <button type="button" className="training-finish-button" onClick={() => finishTraining(training)} disabled={loadingId === training.id}>{loadingId === training.id ? <><Loader2 size={18} className="training-links-spinner" /> جارٍ تجهيز نصائحكِ…</> : 'أنهيت التدريب — أعطيني خمس نصائح'}</button>
            {errors[training.id] && <p className="training-links-error" role="alert">{errors[training.id]}</p>}
          </div>
          {!!insights[training.id]?.length && <div className="training-insights-grid" aria-live="polite"><div className="training-insights-title"><Sparkles size={18} /> خمس نصائح لكِ من شات رِقّة</div>{insights[training.id].map((insight, index) => { const tone = TONES[insight.type] || TONES.action; return <article className="training-insight" key={insight.id || index} style={{ '--insight-color': tone.color, '--insight-bg': tone.background }}><div className="training-insight-top"><span className="training-insight-number">{index + 1}</span><span className="training-insight-icon">{tone.icon}</span><span className="training-insight-label">{tone.label}</span></div><h5>{insight.title}</h5><p>{insight.message}</p>{insight.action && <div className="training-insight-action"><strong>جرّبي الآن</strong><span>{insight.action}</span></div>}</article>; })}</div>}
        </div>}
      </article>)}
    </div>
    <style>{`.training-links-section{width:min(100%,620px);margin:8px auto 28px;padding:18px;border:1px solid #efd6e2;border-radius:24px;background:linear-gradient(145deg,#fff,#fff7fb);box-shadow:0 10px 26px rgba(123,49,87,.09);font-family:'Tajawal',sans-serif}.training-links-heading{display:flex;align-items:center;gap:11px;margin-bottom:14px}.training-links-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:#fceaf2;color:#b12a68}.training-links-heading span{color:#b12a68;font-size:11px;font-weight:900}.training-links-heading h2{margin:2px 0 0;color:#442235;font-size:19px}.training-links-list{display:grid;gap:12px}.training-link-card{overflow:hidden;border:1px solid #f0dde5;border-radius:17px;background:#fff}.training-link-card>img{width:100%;max-height:180px;object-fit:cover;display:block}.training-link-copy{padding:13px}.training-link-copy h3{margin:0 0 5px;color:#54283f;font-size:16px}.training-link-copy p{margin:0;color:#76616d;font-size:12px;line-height:1.8;white-space:pre-line}.training-link-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:11px}.training-link-actions button,.training-link-actions a{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:11px;padding:9px 12px;background:#b12a68;color:#fff;font:inherit;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}.training-link-actions a{background:#fceaf2;color:#9f245d}.training-link-completion{border-top:1px solid #f2e3e9;padding:12px}.training-link-frame-wrap iframe{width:100%;height:min(65vh,620px);min-height:420px;border:1px solid #edd6e2;border-radius:13px;background:#fff}.training-finish-box{margin-top:13px;padding:15px;border:1px solid #efd9e3;border-radius:17px;background:linear-gradient(135deg,#fff8fb,#fffdf5)}.training-finish-box h4{display:flex;align-items:center;gap:7px;margin:0;color:#9f245d;font-size:17px}.training-finish-box p{margin:6px 0 10px;color:#76616d;font-size:13px;line-height:1.8}.training-finish-box textarea{width:100%;resize:vertical;border:1px solid #ead8e0;border-radius:12px;padding:10px;color:#49323e;background:#fff;font:inherit;font-size:14px;line-height:1.7}.training-finish-button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:10px;border:0;border-radius:13px;padding:13px;background:linear-gradient(135deg,#f47799,#b12a68);color:#fff;font:inherit;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px #e94d7b30}.training-finish-button:disabled{opacity:.65;cursor:wait}.training-links-spinner{animation:training-links-spin 1s linear infinite}@keyframes training-links-spin{to{transform:rotate(360deg)}}.training-links-error{padding:9px 11px!important;margin:9px 0 0!important;border-radius:10px;background:#fff0f0;color:#a33d48!important;font-size:12px!important}.training-insights-grid{display:grid;gap:11px;margin-top:14px}.training-insights-title{display:flex;align-items:center;gap:7px;color:#9f245d;font-size:17px;font-weight:900;padding:4px}.training-insight{padding:15px;border:1px solid color-mix(in srgb,var(--insight-color) 22%,#fff);border-right:6px solid var(--insight-color);border-radius:16px;background:var(--insight-bg);box-shadow:0 5px 13px rgba(70,48,36,.05)}.training-insight-top{display:flex;align-items:center;gap:8px}.training-insight-number{display:grid;place-items:center;width:29px;height:29px;border-radius:10px;background:var(--insight-color);color:#fff;font-size:14px;font-weight:900}.training-insight-icon{font-size:22px;color:var(--insight-color)}.training-insight-label{margin-right:auto;color:var(--insight-color);font-size:12px;font-weight:900}.training-insight h5{margin:11px 0 6px;color:#49323e;font-size:18px;line-height:1.6}.training-insight p{margin:0;color:#59453c;font-size:16px;line-height:1.9}.training-insight-action{display:flex;flex-direction:column;gap:3px;margin-top:11px;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,.72);color:#59453c;font-size:14px;line-height:1.8}.training-insight-action strong{color:var(--insight-color);font-size:13px}@media(max-width:480px){.training-links-section{padding:13px}.training-link-completion{padding:9px}.training-link-frame-wrap iframe{min-height:360px}.training-insight h5{font-size:17px}.training-insight p{font-size:15px}}`}</style>
  </section>;
}
