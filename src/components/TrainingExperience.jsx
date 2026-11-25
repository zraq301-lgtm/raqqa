import React, { useState } from 'react';
import TrainingCards from './TrainingCards';
import { analyzeTrainingAttempt } from '../services/trainingCoach';

const TONES = {
  strength: { label: 'نقطة قوة', color: '#23845b', background: '#effaf4', icon: '✦' },
  focus: { label: 'تحتاج مراجعة', color: '#b66a27', background: '#fff6e9', icon: '◎' },
  action: { label: 'خطوة عملية', color: '#5665bb', background: '#f1f3ff', icon: '↗' },
  encouragement: { label: 'تشجيع', color: '#b04d78', background: '#fff0f6', icon: '♡' },
};

export default function TrainingExperience({ pageName, title, cards, accent = '#b08968', variant = 'soft' }) {
  const [attempt, setAttempt] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!Array.isArray(cards) || cards.length === 0) return null;

  const handleAnalyze = async () => {
    if (!attempt || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await analyzeTrainingAttempt({ pageName, title, ...attempt });
      setInsights(result);
    } catch (analysisError) {
      setError(analysisError.message || 'تعذر تحليل التدريب الآن.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="training-experience" dir="rtl">
    <TrainingCards cards={cards} accent={accent} variant={variant} onComplete={setAttempt} />
    {attempt && <section className="training-analysis-panel" aria-live="polite">
      <div className="training-analysis-intro">
        <div>
          <span className="training-analysis-kicker">اكتمل التدريب</span>
          <h3>هل ترغبين في معرفة خطوتكِ التالية؟</h3>
          <p>سأقرأ إجاباتكِ الفعلية وأقترح لكِ توجيهات قصيرة تناسب مستواكِ.</p>
        </div>
        <button type="button" className="training-analysis-button" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'جارٍ تحليل أدائكِ...' : insights.length ? 'إعادة التحليل' : 'حلّلي أدائي وقدّمي لي نصائح'}
        </button>
      </div>
      {error && <div className="training-analysis-error" role="alert">{error}</div>}
      {insights.length > 0 && <div className="training-insights-grid">
        {insights.map((insight) => {
          const tone = TONES[insight.type] || TONES.action;
          return <details key={insight.id} className="training-insight" style={{ '--insight-color': tone.color, '--insight-bg': tone.background }} open>
            <summary><span className="training-insight-icon">{tone.icon}</span><span>{insight.title}</span><small>{tone.label}</small></summary>
            <div className="training-insight-body"><p>{insight.message}</p>{insight.action && <div className="training-insight-action"><strong>جرّبي الآن</strong><span>{insight.action}</span></div>}<label className="training-insight-done"><input type="checkbox" /> علّمتها كمهمة منجزة</label></div>
          </details>;
        })}
      </div>}
    </section>}
    <style>{`.training-analysis-panel{margin:0 0 22px;padding:18px;border-radius:22px;background:linear-gradient(135deg,#fff,#fff8f1);border:1px solid #f0dfd3;box-shadow:0 10px 28px rgba(90,55,35,.08)}.training-analysis-intro{display:flex;align-items:center;justify-content:space-between;gap:15px}.training-analysis-kicker{display:inline-block;color:${accent};font-size:12px;font-weight:800;margin-bottom:5px}.training-analysis-intro h3{margin:0;color:#59453c;font-size:17px;line-height:1.7}.training-analysis-intro p{margin:4px 0 0;color:#8b756a;font-size:13px;line-height:1.7}.training-analysis-button{border:0;border-radius:14px;padding:12px 14px;background:${accent};color:#fff;font:inherit;font-size:13px;font-weight:800;cursor:pointer;min-width:155px;box-shadow:0 7px 15px color-mix(in srgb,${accent} 28%,transparent)}.training-analysis-button:disabled{opacity:.6;cursor:wait}.training-analysis-error{margin-top:12px;padding:10px;border-radius:12px;background:#fff0f0;color:#9a4545;font-size:13px}.training-insights-grid{display:grid;gap:11px;margin-top:16px}.training-insight{border:1px solid color-mix(in srgb,var(--insight-color) 18%,#fff);border-right:5px solid var(--insight-color);border-radius:15px;background:var(--insight-bg);overflow:hidden}.training-insight summary{display:flex;align-items:center;gap:9px;cursor:pointer;list-style:none;padding:13px;font-weight:800;color:#59453c}.training-insight summary::-webkit-details-marker{display:none}.training-insight summary small{margin-right:auto;color:var(--insight-color);font-size:11px}.training-insight-icon{display:grid;place-items:center;width:27px;height:27px;border-radius:50%;background:#fff;color:var(--insight-color);font-size:18px}.training-insight-body{padding:0 13px 13px;color:#68544b;font-size:13px;line-height:1.8}.training-insight-body p{margin:0 0 9px}.training-insight-action{display:flex;flex-direction:column;gap:2px;padding:9px 11px;border-radius:10px;background:rgba(255,255,255,.7)}.training-insight-action strong{color:var(--insight-color);font-size:12px}.training-insight-done{display:flex;align-items:center;gap:6px;margin-top:10px;color:#876f63;font-size:11px;cursor:pointer}.training-insight-done input{accent-color:var(--insight-color)}@media(max-width:560px){.training-analysis-intro{align-items:stretch;flex-direction:column}.training-analysis-button{width:100%}}`}</style>
  </div>;
}
