import React, { useState } from 'react';
import { MEDICAL_SEARCH_API_URL } from '../../config/apiConfig';
import '../../styles/medical-search.css';

const suggestions = ['أعراض نقص الحديد', 'الحمل في الأسابيع الأولى', 'أسباب الصداع المتكرر', 'العناية بعد الولادة'];

export default function MedicalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);

  const search = async (event) => {
    event?.preventDefault();
    const value = query.trim();
    if (value.length < 2) { setMessage('اكتبي كلمة أو سؤالًا طبيًا من حرفين على الأقل.'); return; }
    setLoading(true); setMessage('جاري البحث داخل المصادر الطبية الموثوقة…'); setSearched(true);
    try {
      const response = await fetch(MEDICAL_SEARCH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value, limit: 10 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || 'تعذر تنفيذ البحث.');
      setResults(Array.isArray(data.results) ? data.results : []);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setMessage(data.results?.length ? `ظهر ${data.results.length} من النتائج الموثوقة.` : 'لم نجد نتيجة مناسبة. جرّبي كلمات مختلفة.');
    } catch (error) {
      setResults([]); setSources([]); setMessage(error.message || 'تعذر الاتصال بخدمة البحث.');
    } finally { setLoading(false); }
  };

  return (
    <section className="medical-search-page" dir="rtl">
      <header className="medical-search-hero">
        <div className="medical-search-icon">⌕</div>
        <div><span>معلومة موثوقة قبل أي قرار</span><h1>البحث الطبي الآمن</h1><p>ابحثي في مصادر صحية رسمية بدل النتائج العشوائية، واقرئي المعلومة من مصدرها الأصلي.</p></div>
      </header>

      <div className="medical-search-notice"><strong>تنبيه مهم</strong><span>هذه نتائج تثقيفية وليست تشخيصًا أو وصفة علاج. عند وجود أعراض شديدة أو طارئة، تواصلي مع طبيبة أو الطوارئ فورًا.</span></div>

      <form className="medical-search-form" onSubmit={search}>
        <label htmlFor="medical-query">ماذا تريدين أن تعرفي؟</label>
        <div className="medical-search-input-row"><input id="medical-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: أعراض نقص الحديد" maxLength={240} /><button type="submit" disabled={loading}>{loading ? 'جاري البحث…' : 'ابحثي'}</button></div>
        <div className="medical-search-suggestions">{suggestions.map((item) => <button type="button" key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
      </form>

      {message && <p className="medical-search-message" role="status">{message}</p>}
      {searched && !loading && !results.length && <div className="medical-search-empty">لم تظهر نتائج لهذه العبارة. جرّبي صياغة أقصر أو كلمة طبية مختلفة.</div>}
      <div className="medical-search-results">{results.map((result) => <article className="medical-search-result" key={result.url}><span className="medical-search-source">{result.source}</span><h2>{result.title}</h2><p>{result.snippet}</p><a href={result.url} target="_blank" rel="noreferrer">قراءة المصدر الأصلي ↗</a></article>)}</div>

      <footer className="medical-search-sources"><strong>مصادر البحث المسموح بها</strong><div>{sources.map((source) => <span key={source.id}>{source.name}</span>)}</div></footer>
    </section>
  );
}
