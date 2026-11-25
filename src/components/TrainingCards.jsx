import React, { useMemo, useState } from 'react';

/**
 * كروت تدريب اختيارية محفوظة داخل article.interactiveCards.
 * يظهر كارت واحد فقط، ولا يُفتح التالي إلا بعد اختيار إجابة.
 */
export default function TrainingCards({ cards = [], accent = '#b08968', variant = 'soft', onComplete = () => {} }) {
  const normalized = useMemo(() => cards
    .filter((card) => card && (card.question || card.prompt))
    .map((card, index) => ({
      id: card.id || `training-card-${index}`,
      question: String(card.question || card.prompt || '').trim(),
      choices: Array.isArray(card.choices) && card.choices.length
        ? card.choices.map((choice) => String(choice).trim()).filter(Boolean).slice(0, 4)
        : [],
      answer: String(card.answer || card.correctAnswer || '').trim(),
      explanation: String(card.explanation || '').trim(),
      points: Number(card.points) || 1,
    }))
    .filter((card) => card.question), [cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState({});

  if (!normalized.length) return null;
  const current = normalized[currentIndex];
  const isCorrect = current.answer && selected && selected === current.answer;
  const submitAnswer = () => {
    if (!selected || revealed) return;
    setAttempts((currentAttempts) => ({
      ...currentAttempts,
      [current.id]: { selected, answer: current.answer, correct: Boolean(isCorrect), points: current.points },
    }));
    setRevealed(true);
    if (isCorrect) setScore((value) => value + current.points);
  };
  const nextCard = () => {
    if (currentIndex === normalized.length - 1) {
      const completedAttempts = {
        ...attempts,
        [current.id]: { selected, answer: current.answer, correct: Boolean(isCorrect), points: current.points },
      };
      onComplete({
        score: Object.values(completedAttempts).reduce((sum, item) => sum + (item.correct ? item.points : 0), 0),
        total: normalized.length,
        cards: normalized,
        attempts: completedAttempts,
      });
    }
    setCurrentIndex((value) => value + 1);
    setSelected('');
    setRevealed(false);
  };
  const finished = currentIndex >= normalized.length;
  if (finished) {
    return <section className="training-cards training-cards-finished" style={{ '--training-accent': accent }} aria-label="نتيجة التدريب">
      <strong>أحسنتِ، اكتمل التدريب</strong>
      <span>النقاط التي حصلتِ عليها: {score}</span>
    </section>;
  }
  return <section className={`training-cards training-cards-${variant}`} style={{ '--training-accent': accent }} aria-label="كروت التدريب">
    <div className="training-cards-heading"><span>تدريب تفاعلي</span><small>السؤال {currentIndex + 1} من {normalized.length} · النقاط {score}</small></div>
    <article className="training-card">
      <div className="training-card-number">{currentIndex + 1}</div>
      <h3>{current.question}</h3>
      {current.choices.length > 0 ? <div className="training-choices">
        {current.choices.map((choice) => <button key={choice} type="button" className={`training-choice ${selected === choice ? 'selected' : ''} ${revealed && choice === current.answer ? 'correct' : ''}`} onClick={() => !revealed && setSelected(choice)}>{choice}</button>)}
      </div> : <textarea className="training-answer-input" value={selected} onChange={(event) => setSelected(event.target.value)} placeholder="اكتبي إجابتك هنا" disabled={revealed} rows={3} />}
      {!revealed ? <button type="button" className="training-submit" onClick={submitAnswer} disabled={!selected}>تأكيد الإجابة</button> : <div className={`training-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
        <strong>{isCorrect ? `إجابة صحيحة +${current.points} نقطة` : 'شكرًا لمحاولتك'}</strong>
        {current.answer && !isCorrect && <span>الإجابة الصحيحة: {current.answer}</span>}
        {current.explanation && <p>{current.explanation}</p>}
        {currentIndex < normalized.length - 1 ? <button type="button" className="training-next" onClick={nextCard}>السؤال التالي</button> : <button type="button" className="training-next" onClick={nextCard}>عرض النتيجة</button>}
      </div>}
    </article>
    <style>{`.training-cards{margin:20px 0;padding:16px;border-radius:20px;background:linear-gradient(145deg,#fffdfb,#fff7f1);border:1px solid color-mix(in srgb,var(--training-accent) 28%,#fff);box-shadow:0 8px 22px rgba(90,55,35,.08);text-align:right}.training-cards-heading{display:flex;justify-content:space-between;gap:10px;align-items:center;color:var(--training-accent);font-weight:800;margin-bottom:12px}.training-cards-heading small{font-size:11px;color:#987f73;font-weight:600}.training-cards-outlined{background:#fff;border-style:dashed}.training-cards-elevated{box-shadow:0 14px 30px rgba(90,55,35,.16)}.training-card{position:relative;padding:18px 14px 14px;background:#fff;border-radius:16px;border:1px solid #f1e5dd}.training-card-number{position:absolute;top:10px;left:10px;width:27px;height:27px;display:grid;place-items:center;border-radius:50%;background:var(--training-accent);color:#fff;font-weight:800}.training-card h3{margin:0 36px 16px 0;color:#59453c;font-size:17px;line-height:1.8}.training-choices{display:grid;gap:8px}.training-choice,.training-submit,.training-next{font:inherit;border:0;border-radius:12px;padding:11px 13px;cursor:pointer}.training-choice{text-align:right;background:#fff9f5;border:1px solid #f0dfd5;color:#6e5549}.training-choice.selected{border-color:var(--training-accent);background:#fff0e8}.training-choice.correct{background:#eaf8ee;border-color:#70bb83}.training-submit,.training-next{margin-top:12px;background:var(--training-accent);color:#fff;font-weight:800}.training-submit:disabled{opacity:.45;cursor:not-allowed}.training-answer-input{width:100%;box-sizing:border-box;border:1px solid #ecdcd3;border-radius:12px;padding:11px;font:inherit;resize:vertical}.training-feedback{display:flex;flex-direction:column;gap:7px;margin-top:12px;padding:11px;border-radius:12px;line-height:1.7}.training-feedback.correct{background:#effaf1;color:#2c7540}.training-feedback.incorrect{background:#fff5ed;color:#805438}.training-feedback p{margin:0}.training-cards-finished{display:flex;flex-direction:column;gap:5px;text-align:center;color:var(--training-accent)}`}</style>
  </section>;
}
