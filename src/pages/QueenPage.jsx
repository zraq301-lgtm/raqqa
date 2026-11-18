import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config/apiConfig';
import { ArrowRight, BookOpen, Check, ChevronDown, Download, Headphones, Pause, Play, RefreshCw, Sun, Volume2 } from 'lucide-react';

const QURAN_API = apiUrl('api/queen/quran');
const AUDIO_URL = (reciter, surah, ayah) => apiUrl(`api/queen/quran/audio?reciter=${reciter}&surah=${surah}&ayah=${ayah}`);
const AUDIO_RECITERS = {
  maher: { label: 'ماهر المعيقلي', folder: 'Maher_AlMuaiqly_64kbps' },
  alafasy: { label: 'مشاري العفاسي', folder: 'Alafasy_64kbps' },
};
const SURAHS_KEY = 'raqqa_quran_surahs_v1';
const SURAH_CACHE_KEY = (number) => `raqqa_quran_surah_${number}_v1`;
const audioCacheName = 'raqqa-quran-audio-v1';

const adhkar = {
  morning: {
    title: 'أذكار الصباح',
    icon: <Sun size={22} />,
    intro: 'ابدئي يومك بذكر الله وطمأنينة القلب.',
    items: [
      { count: 1, text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ... آيَةُ الْكُرْسِيِّ.' },
      { count: 3, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.' },
      { count: 3, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِنْ شَرِّ مَا خَلَقَ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.' },
      { count: 3, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ.' },
      { count: 1, text: 'اللهم بك أصبحنا وبك أمسينا، وبك نحيا وبك نموت، وإليك النشور.' },
      { count: 3, text: 'رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد صلى الله عليه وسلم نبيًا.' },
      { count: 100, text: 'سبحان الله وبحمده.' },
      { count: 1, text: 'اللهم إني أسألك علمًا نافعًا، ورزقًا طيبًا، وعملًا متقبلًا.' },
    ],
  },
  evening: {
    title: 'أذكار المساء',
    icon: <BookOpen size={22} />,
    intro: 'اختمي يومك بحفظ الله وذكره.',
    items: [
      { count: 1, text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ... آيَةُ الْكُرْسِيِّ.' },
      { count: 3, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.' },
      { count: 3, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِنْ شَرِّ مَا خَلَقَ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.' },
      { count: 3, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ.' },
      { count: 1, text: 'أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.' },
      { count: 3, text: 'رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد صلى الله عليه وسلم نبيًا.' },
      { count: 100, text: 'سبحان الله وبحمده.' },
      { count: 1, text: 'اللهم إني أسألك العفو والعافية في الدنيا والآخرة.' },
    ],
  },
};

async function cachedJson(key, url) {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore invalid local cache */ }
  const response = await fetch(url);
  if (!response.ok) throw new Error('تعذر تحميل البيانات. افتحي الصفحة مرة واحدة مع الإنترنت لحفظها على الجهاز.');
  const data = await response.json();
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage may be full */ }
  return data;
}

async function openCachedAudio(url) {
  if (!('caches' in window)) return url;
  const cache = await caches.open(audioCacheName);
  const stored = await cache.match(url);
  if (stored) return URL.createObjectURL(await stored.blob());
  const response = await fetch(url);
  if (!response.ok) throw new Error('تعذر تنزيل المقطع الصوتي.');
  await cache.put(url, response.clone());
  return URL.createObjectURL(await response.blob());
}

async function cacheAudio(url) {
  if (!('caches' in window)) throw new Error('التخزين الصوتي غير مدعوم في هذا الجهاز.');
  const cache = await caches.open(audioCacheName);
  if (await cache.match(url)) return;
  const response = await fetch(url);
  if (!response.ok) throw new Error('تعذر تنزيل أحد المقاطع الصوتية.');
  await cache.put(url, response);
}

function AudioVersePlayer({ verses, reciter, surahNumber, offlineOnly = false }) {
  const audioRef = useRef(null);
  const objectUrlRef = useRef('');
  const [index, setIndex] = useState(0);
  const [source, setSource] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState('');
  const autoplayRef = useRef(false);
  const currentUrl = AUDIO_URL(reciter, surahNumber, verses[index]?.numberInSurah || 1);

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);
  useEffect(() => { setIndex(0); setSource(''); setError(''); }, [surahNumber, reciter]);

  const loadCurrent = async (play = false) => {
    setBusy(true); setError('');
    try {
      const nextSource = await openCachedAudio(currentUrl);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextSource.startsWith('blob:') ? nextSource : '';
      autoplayRef.current = play;
      setSource(nextSource);
      if (!play && nextSource === source) {
        audioRef.current?.play().catch(() => setError('اضغطي تشغيل مرة أخرى للسماح بتشغيل الصوت داخل التطبيق.'));
      }
    } catch (loadError) {
      setError(offlineOnly ? 'هذا المقطع غير محفوظ. اضغطي تنزيل السورة أثناء الاتصال بالإنترنت.' : loadError.message);
    } finally { setBusy(false); }
  };

  const downloadSurah = async () => {
    setBusy(true); setError(''); setDownloadProgress(0);
    try {
      for (let verseIndex = 0; verseIndex < verses.length; verseIndex += 1) {
        const url = AUDIO_URL(reciter, surahNumber, verses[verseIndex].numberInSurah);
        await cacheAudio(url);
        setDownloadProgress(Math.round(((verseIndex + 1) / verses.length) * 100));
      }
    } catch (downloadError) { setError(downloadError.message); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (!source || !audioRef.current) return;
    audioRef.current.load();
    if (autoplayRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise?.catch) playPromise.catch(() => setError('اضغطي زر التشغيل مرة أخرى إذا منع الهاتف التشغيل التلقائي.'));
    }
  }, [source]);
  useEffect(() => {
    if (index > 0) void loadCurrent(true);
    // loadCurrent intentionally follows the selected ayah and reciter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  if (!verses.length) return null;
  return (
    <div style={styles.audioBox}>
      <div style={styles.audioMeta}><Headphones size={18} /> {AUDIO_RECITERS[reciter].label} — الآية {index + 1} من {verses.length}</div>
      <audio ref={audioRef} src={source} controls preload="metadata" onEnded={() => { if (index < verses.length - 1) setIndex((value) => value + 1); }} />
      <button type="button" style={styles.primaryButton} onClick={() => loadCurrent(true)} disabled={busy}>
        {busy ? <RefreshCw size={17} className="spin" /> : source ? <Play size={17} /> : <Download size={17} />}
        {busy ? 'جارٍ التجهيز…' : source ? 'تشغيل الآية' : 'تنزيل وتشغيل'}
      </button>
      <button type="button" style={styles.secondaryButton} onClick={downloadSurah} disabled={busy}>
        <Download size={17} /> {busy && downloadProgress ? `تنزيل السورة ${downloadProgress}%` : 'تنزيل السورة كاملة دون إنترنت'}
      </button>
      {error && <small style={styles.error}>{error}</small>}
    </div>
  );
}

function DhikrPage() {
  const [kind, setKind] = useState('morning');
  const [reciter, setReciter] = useState('alafasy');
  const [audioSource, setAudioSource] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioError, setAudioError] = useState('');
  const data = adhkar[kind];
  const audioUrl = apiUrl(`api/queen/adhkar/audio?period=${kind}&reciter=${reciter}`);
  const loadAdhkarAudio = async () => {
    setAudioBusy(true); setAudioError('');
    try { setAudioSource(await openCachedAudio(audioUrl)); }
    catch (error) { setAudioError('تعذر تشغيل الأذكار. اضغطي تنزيل وتشغيل أثناء الاتصال بالإنترنت.'); }
    finally { setAudioBusy(false); }
  };
  useEffect(() => { setAudioSource(''); setAudioError(''); }, [kind, reciter]);
  return <div style={styles.page} dir="rtl">
    <PageBack title="الأذكار" />
    <div style={styles.hero}><Sun size={30} /><h1>أذكار الصباح والمساء</h1><p>{data.intro} النص والصوت يحفظان داخل التطبيق بعد التنزيل.</p></div>
    <div style={styles.tabs}><button type="button" onClick={() => setKind('morning')} style={kind === 'morning' ? styles.activeTab : styles.tab}>أذكار الصباح</button><button type="button" onClick={() => setKind('evening')} style={kind === 'evening' ? styles.activeTab : styles.tab}>أذكار المساء</button></div>
    <label style={styles.selectLabel}>القارئ الصوتي<select value={reciter} onChange={(event) => setReciter(event.target.value)}><option value="alafasy">مشاري العفاسي</option><option value="fares">فارس عباد</option><option value="jibril">محمد جبريل</option></select></label>
    <div style={styles.audioBox}>
      <div style={styles.audioMeta}><Headphones size={18} /> {data.title} — {reciter === 'alafasy' ? 'مشاري العفاسي' : reciter === 'fares' ? 'فارس عباد' : 'محمد جبريل'}</div>
      {audioSource && <audio src={audioSource} controls preload="metadata" style={{ width: '100%' }} />}
      <button type="button" style={styles.primaryButton} onClick={loadAdhkarAudio} disabled={audioBusy}><Download size={17} /> {audioBusy ? 'جارٍ تنزيل الصوت…' : audioSource ? 'تشغيل الأذكار داخل التطبيق' : 'تنزيل وتشغيل الأذكار'}</button>
      {audioError && <small style={styles.error}>{audioError}</small>}
    </div>
    <div style={styles.cards}>{data.items.map((item, index) => <article key={`${kind}-${index}`} style={styles.dhikrCard}><span style={styles.count}>{item.count}×</span><p>{item.text}</p></article>)}</div>
    <small style={styles.note}>بعد الضغط على «تنزيل وتشغيل» يمكن تشغيل الصوت من داخل التطبيق دون إنترنت.</small>
  </div>;
}
function QuranPage() {
  const [surahs, setSurahs] = useState([]);
  const [surahNumber, setSurahNumber] = useState(1);
  const [surah, setSurah] = useState(null);
  const [reciter, setReciter] = useState('maher');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineOnly, setOfflineOnly] = useState(false);
  const selected = useMemo(() => surahs.find((item) => item.number === Number(surahNumber)), [surahs, surahNumber]);

  useEffect(() => { cachedJson(SURAHS_KEY, `${QURAN_API}/surahs`).then((result) => setSurahs(result.data || [])).catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    setLoading(true); setError('');
    cachedJson(SURAH_CACHE_KEY(surahNumber), `${QURAN_API}/surah/${surahNumber}`)
      .then((result) => setSurah(result.data)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [surahNumber]);

  return <div style={styles.page} dir="rtl">
    <PageBack title="القرآن الكريم" />
    <div style={styles.hero}><BookOpen size={30} /><h1>قراءة القرآن والاستماع إليه</h1><p>اختاري السورة والقارئ. يمكنك تنزيل المقاطع لتشغيلها لاحقًا دون إنترنت.</p></div>
    <div style={styles.controls}>
      <label style={styles.selectLabel}>السورة<select value={surahNumber} onChange={(event) => setSurahNumber(Number(event.target.value))}>{surahs.map((item) => <option key={item.number} value={item.number}>{item.number}. {item.name}</option>)}</select></label>
      <label style={styles.selectLabel}>القارئ<select value={reciter} onChange={(event) => setReciter(event.target.value)}>{Object.entries(AUDIO_RECITERS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>
    </div>
    <label style={styles.offlineToggle}><input type="checkbox" checked={offlineOnly} onChange={(event) => setOfflineOnly(event.target.checked)} /> تشغيل المقاطع المحفوظة فقط دون اتصال</label>
    {loading && <p style={styles.loading}>جارٍ تحميل السورة…</p>}
    {error && <p style={styles.error}>{error}</p>}
    {!loading && surah && <>
      <section style={styles.surahHeader}><h2>{surah.name}</h2><span>{surah.numberOfAyahs} آية</span></section>
      <AudioVersePlayer verses={surah.ayahs || []} reciter={reciter} surahNumber={surah.number} offlineOnly={offlineOnly} />
      <div style={styles.ayahs}>{(surah.ayahs || []).map((ayah) => <p key={ayah.number} style={styles.ayah}><span style={styles.ayahNumber}>{ayah.numberInSurah}</span>{ayah.text}</p>)}</div>
    </>}
    {selected && <small style={styles.note}>النص يحفظ تلقائيًا على الجهاز بعد أول فتح للسورة. الصوت يحفظ عند الضغط على «تنزيل وتشغيل» لكل آية.</small>}
  </div>;
}

function PageBack({ title }) { return <div style={styles.backRow}><Link to="/insight" style={styles.backLink}><ArrowRight size={18} /> كوني ملكة</Link><strong>{title}</strong><span /></div>; }

export default function QueenPage({ mode = 'hub' }) {
  if (mode === 'adhkar') return <DhikrPage />;
  if (mode === 'quran') return <QuranPage />;
  return <div style={styles.page} dir="rtl"><PageBack title="كوني ملكة" /><div style={styles.hero}><Sun size={32} /><h1>كوني ملكة</h1><p>رفقة يومية للذكر والتلاوة، قراءةً واستماعًا، مع حفظ المحتوى على جهازك.</p></div><div style={styles.choiceGrid}><Link to="/queen/adhkar" style={styles.choice}><Sun size={30} /><strong>الأذكار</strong><span>أذكار الصباح والمساء مقروءة ومسموعة</span></Link><Link to="/queen/quran" style={styles.choice}><BookOpen size={30} /><strong>القرآن الكريم</strong><span>قراءة واستماع بصوت ماهر المعيقلي ومشاري العفاسي</span></Link></div></div>;
}

const styles = {
  page: { minHeight: '100vh', maxWidth: 900, margin: '0 auto', padding: '18px 16px 46px', background: '#fffafc', color: '#48363e', fontFamily: 'Tajawal, sans-serif' },
  backRow: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, marginBottom: 18, color: '#7a5364' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 5, color: '#b14c75', textDecoration: 'none', fontWeight: 700 },
  hero: { textAlign: 'center', padding: '20px 14px', borderRadius: 24, background: 'linear-gradient(135deg,#fff0f6,#fff8ed)', color: '#9d456b', marginBottom: 18 },
  'hero h1': { margin: '9px 0 5px', fontSize: 'clamp(1.4rem,5vw,2rem)' },
  'hero p': { margin: 0, lineHeight: 1.8, color: '#795b66' },
  choiceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 },
  choice: { display: 'flex', flexDirection: 'column', gap: 9, textDecoration: 'none', color: '#85425e', padding: 22, borderRadius: 20, background: '#fff', border: '1px solid #f4dce6', boxShadow: '0 8px 24px rgba(140,70,100,.08)' },
  tabs: { display: 'flex', gap: 8, marginBottom: 14 },
  tab: { flex: 1, border: '1px solid #efcdda', background: '#fff', color: '#8a6070', padding: 12, borderRadius: 14, fontWeight: 700 },
  activeTab: { flex: 1, border: '1px solid #bd5a82', background: '#bd5a82', color: '#fff', padding: 12, borderRadius: 14, fontWeight: 700 },
  voiceButton: { display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, borderRadius: 14, padding: '11px 15px', background: '#7f9b75', color: '#fff', fontWeight: 700, marginBottom: 15 },
  cards: { display: 'grid', gap: 10 },
  dhikrCard: { position: 'relative', padding: '14px 50px 14px 14px', borderRadius: 17, background: '#fff', border: '1px solid #f2e0e5', lineHeight: 2, boxShadow: '0 4px 13px rgba(98,62,74,.05)' },
  'dhikrCard p': { margin: 0 },
  count: { position: 'absolute', right: 12, top: 15, color: '#bd5a82', fontWeight: 800 },
  controls: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginBottom: 12 },
  selectLabel: { display: 'grid', gap: 7, color: '#795b66', fontWeight: 700 },
  select: { border: '1px solid #e8cbd6', borderRadius: 12, padding: 11, background: '#fff', color: '#48363e', fontFamily: 'inherit' },
  offlineToggle: { display: 'flex', gap: 8, alignItems: 'center', color: '#795b66', margin: '8px 0 15px' },
  surahHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: '#f8efe7', color: '#89563e' },
  'surahHeader h2': { margin: 0 },
  audioBox: { display: 'grid', gap: 10, margin: '14px 0', padding: 14, borderRadius: 18, background: '#f5f2fb', border: '1px solid #e7def1' },
  audioMeta: { display: 'flex', gap: 7, alignItems: 'center', color: '#69537e', fontWeight: 700 },
  'audioBox audio': { width: '100%' },
  secondaryButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid #d9bfd0', borderRadius: 12, padding: '10px 14px', background: '#fff', color: '#8a5573', fontWeight: 700 },
  primaryButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, borderRadius: 12, padding: '10px 14px', background: '#9a5877', color: '#fff', fontWeight: 700 },
  ayahs: { display: 'grid', gap: 9 },
  ayah: { margin: 0, padding: '16px 12px', borderRadius: 15, background: '#fff', border: '1px solid #eaded7', lineHeight: 2.2, fontSize: '1.2rem', fontFamily: 'Amiri, serif' },
  ayahNumber: { display: 'inline-grid', placeItems: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f1dfc9', color: '#855d3c', fontFamily: 'Tajawal, sans-serif', fontSize: '.78rem', marginLeft: 8 },
  loading: { textAlign: 'center', color: '#846b75' },
  error: { color: '#b12f45', background: '#fff0f0', padding: 10, borderRadius: 10 },
  note: { display: 'block', marginTop: 16, color: '#8b737d', lineHeight: 1.8 },
};
