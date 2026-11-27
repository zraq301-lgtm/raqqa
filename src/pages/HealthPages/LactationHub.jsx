import { privateAiPost } from '../../services/apiClient';
import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import ChatMediaControls from '../../components/ChatMediaControls';
import { persistAiHealthRecord, persistAiScheduledNotification } from '../../services/profileApi';
import { Check } from 'lucide-react';

const LactationHub = () => {
  const Icon = iconMap.feelings;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lady_lactation')) || {};
    } catch { return {}; }
  });
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lactation_history')) || [];
    } catch { return []; }
  });
  const todayKey = new Date().toISOString().slice(0, 10);
  const [feedingLog, setFeedingLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lactation_feed_log')) || []; } catch { return []; }
  });
  const [feedingSettings, setFeedingSettings] = useState(() => {
    try { return { dailyTarget: 8, reminderInterval: 3, defaultSide: 'تبديل الجهة', ...(JSON.parse(localStorage.getItem('lactation_settings')) || {}) }; } catch { return { dailyTarget: 8, reminderInterval: 3, defaultSide: 'تبديل الجهة' }; }
  });
  const [feedEntry, setFeedEntry] = useState({ time: new Date().toTimeString().slice(0, 5), side: 'تبديل الجهة', duration: '', amount: '', type: 'طبيعية', notes: '' });
  const [showFeedingTools, setShowFeedingTools] = useState(true);

  const todayFeeds = feedingLog.filter((item) => item.date === todayKey);
  const updateFeedEntry = (key, value) => setFeedEntry((previous) => ({ ...previous, [key]: value }));
  const updateFeedingSettings = (key, value) => setFeedingSettings((previous) => ({ ...previous, [key]: value }));
  const nextFeedDate = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    const next = new Date(); next.setHours(hours, minutes, 0, 0);
    next.setMinutes(next.getMinutes() + (Number(feedingSettings.reminderInterval) || 3) * 60);
    return next;
  };
  const saveFeedingEntry = () => {
    if (!feedEntry.time) return;
    const entry = { id: `feed-${Date.now()}`, date: todayKey, savedAt: new Date().toISOString(), ...feedEntry };
    const updated = [...feedingLog, entry].slice(-300);
    setFeedingLog(updated);
    localStorage.setItem('lactation_feed_log', JSON.stringify(updated));
    const next = nextFeedDate(feedEntry.time);
    if (next) {
      const reminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]').filter((item) => item.id !== 'lactation-next-feed');
      reminders.push({ id: 'lactation-next-feed', title: '🤱 تذكير الرضعة التالية', body: 'حان وقت متابعة الرضعة التالية حسب إعداداتك.', scheduled_for: next.toISOString(), extra: { type: 'lactation_next_feed', intervalHours: feedingSettings.reminderInterval } });
      localStorage.setItem('raqqa_local_reminders', JSON.stringify(reminders));
      window.dispatchEvent(new Event('trigger_sync_notifications'));
      persistAiScheduledNotification({ category: 'breastfeeding', title: 'تذكير الرضعة التالية', body: 'حان وقت متابعة الرضعة التالية حسب إعداداتك.', scheduled_for: next.toISOString(), metadata: { type: 'lactation_next_feed' } }).catch(() => null);
    }
    setFeedEntry((previous) => ({ ...previous, time: new Date().toTimeString().slice(0, 5), side: feedingSettings.defaultSide, duration: '', amount: '', notes: '' }));
  };
  const deleteFeedEntry = (id) => {
    const updated = feedingLog.filter((item) => item.id !== id);
    setFeedingLog(updated); localStorage.setItem('lactation_feed_log', JSON.stringify(updated));
  };

  useEffect(() => {
    localStorage.setItem('lactation_settings', JSON.stringify(feedingSettings));
  }, [feedingSettings]);

  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    try {
      await persistAiHealthRecord('breastfeeding', { categoryTitle, analysis: currentAnalysis, data });
    } catch (err) { console.error("خطأ في المزامنة:", err); }
  };

  const nextOccurrence = (timeValue, dateValue = '') => {
    if (!timeValue) return null;
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    const target = dateValue ? new Date(`${dateValue}T${timeValue}`) : new Date();
    if (!dateValue) target.setHours(hours, minutes, 0, 0);
    if (Number.isNaN(target.getTime())) return null;
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    return target;
  };

  const scheduleFeedingRoutine = async () => {
    const routineFields = [
      ['الرضاعة الطبيعية-الوقت', 'تنبيه الرضاعة الطبيعية'],
      ['الرضاعة الطبيعية-بداية الرضعة', 'بداية رضعة طبيعية'],
      ['الرضاعة الصناعية-وقت التحضير', 'تحضير الرضعة الصناعية'],
      ['الشفط والتخزين-ساعة الشفط', 'موعد شفط الحليب'],
    ];
    const currentReminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
    const withoutOldRoutine = currentReminders.filter((item) => !String(item.id).startsWith('lactation-routine-'));
    const routineReminders = routineFields.map(([key, label]) => {
      const dateKey = key.startsWith('الشفط') ? 'الشفط والتخزين-تاريخ التخزين' : '';
      const when = nextOccurrence(data[key], data[dateKey]);
      if (!when) return null;
      return { id: `lactation-routine-${key}`, title: `🤱 ${label}`, body: 'حان موعد تسجيل روتين الرضاعة.', scheduled_for: when.toISOString(), extra: { type: 'lactation_routine', field: key } };
    }).filter(Boolean);
    localStorage.setItem('raqqa_local_reminders', JSON.stringify([...withoutOldRoutine, ...routineReminders]));
    window.dispatchEvent(new Event('trigger_sync_notifications'));
    await Promise.all(routineReminders.map((reminder) => persistAiScheduledNotification({ category: 'breastfeeding', title: reminder.title, body: reminder.body, scheduled_for: reminder.scheduled_for, metadata: reminder.extra }).catch(() => null)));
  };

  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  // الدالة المستبدلة والمطورة لتدعم الحفظ في الأندرويد
  const handleSaveAndAnalyze = async (customQuery = null, imageUrl = null) => {
    setLoading(true);
    setShowChat(true);
    if (!customQuery) setAiResponse("جاري إعداد تقرير طبي مفصل عن حالة الرضاعة...");

    try {
      const strictPrompt = `
      أنتِ مساعدة تثقيفية في الرضاعة ولستِ طبيبة أو بديلة عن المختصات:
      1. قومي بتحليل هذه البيانات بدقة شديدة: ${customQuery || JSON.stringify({ formData: data, todayFeeds, feedingSettings })}.
      2. التقرير يجب أن يكون طويلاً ومفصلاً باللغة العربية بأسلوب طبي ودود.
      3. الهيكل المطلوب للرد:
          - **تحليل المدخلات:** شرح لكل معلومة قدمتها الأم وماذا تعني طبياً.
          - **الصواب والخطأ:** تقييم ممارسات الأم الحالية (حددي ما هو صحيح وما يحتاج تعديل).
          - **خطة زيادة إدرار الحليب:** نصائح عملية غذائية وتقنية لزيادة كمية الحليب.
          - **توصيات عامة:** لا تنسبي المعلومة إلى بحث أو بروتوكول حديث ما لم يوجد مرجع موثوق ضمن المصادر المحلية المرفقة.
          - **تنبيهات هامة:** متى يجب استشارة الطبيب فوراً؟
      4. إذا أُرفقت صورة، اذكري ما يمكن ملاحظته منها بحذر دون تشخيص أو تكرار أي بيانات تعريفية.
      5. لا تخرجي عن موضوع الرضاعة والأمومة أبداً.
      `;

      const response = await privateAiPost({
        specialtyTopic: 'breastfeeding',
        data: { prompt: strictPrompt, image: imageUrl || undefined }
      });

      const aiGeneratedReport = response.data.reply || response.data.message || "عذراً، لم أتمكن من استلام التحليل الطبي حالياً.";
      setAiResponse(aiGeneratedReport);

      // --- منطق الحفظ والجدولة الجديد للأندرويد ---
      const scheduledTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // جدولة بعد ساعة كمثال
      await scheduleFeedingRoutine();

      // 1. إعداد نص الإشعار الفوري للتأكيد
      const instantConfirm = {
        id: Math.floor(Math.random() * 10000),
        title: "✅ تم حفظ بياناتك بشكل آمن",
        body: "تم تحليل بياناتك وحفظ التقرير، وسنذكّرك في الموعد المحدد.",
        scheduled_for: new Date(Date.now() + 500).toISOString(),
      };

      // 2. إعداد إشعار الموعد المخصص الذي يحتوي على تقرير الذكاء الاصطناعي
      const aiReportNotification = {
        id: Math.floor(Math.random() * 10000),
        title: "✨ تقرير رقة الذكي",
        body: aiGeneratedReport,
        scheduled_for: scheduledTime,
        extra: { report: aiGeneratedReport }
      };

      // 3. الحفظ المحلي في المصفوفة الموحدة
      const existingReminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
      const updatedReminders = [...existingReminders, instantConfirm, aiReportNotification];
      localStorage.setItem('raqqa_local_reminders', JSON.stringify(updatedReminders));

      // 4. إطلاق إشارة التفعيل الفوري للأندرويد
      window.dispatchEvent(new Event('trigger_sync_notifications'));

      // الحفظ في التاريخ (History)
      const newEntry = { id: Date.now(), text: aiGeneratedReport, date: new Date().toLocaleString() };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('lactation_history', JSON.stringify(updatedHistory));

      if (!customQuery) await saveAndNotify("تحليل الرضاعة الشامل", aiGeneratedReport);

      setUserQuery('');
      setChatImage(null);
      console.log("🚀 تم الحفظ، التحليل، وإرسال إشارة الإشعار الفوري للأندرويد");

    } catch (error) {
      setAiResponse("حدث خطأ في الاتصال بالخبير الطبي.");
      console.error("خطأ في عملية الحفظ والجدولة:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = () => {
    if (!userQuery.trim() && !chatImage) return;
    handleSaveAndAnalyze(userQuery.trim() || 'حللي الصورة المرفقة في سياق الرضاعة.', chatImage);
  };

  const deleteResponse = (id) => {
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    localStorage.setItem('lactation_history', JSON.stringify(filtered));
  };

  const renderInput = (f, sectionTitle) => {
    const key = `${sectionTitle}-${f}`;
    const isDate = f.includes('تاريخ');
    const isTime = f.includes('الوقت') || f.includes('ساعة') || f.includes('بداية الرضعة') || f.includes('نهاية الرضعة');
    const value = data[key] || '';
    const saveField = (nextValue) => { const newData = { ...data, [key]: nextValue }; setData(newData); localStorage.setItem('lady_lactation', JSON.stringify(newData)); };
    if (isDate || isTime) return <div key={f} style={styles.fieldWrap}><label style={styles.fieldLabel}>{f}</label><input aria-label={f} type={isDate ? 'date' : 'time'} style={styles.input} value={value} onChange={e => saveField(e.target.value)} /></div>;
    const numberField = ['الكمية مل', 'كمية الشفط', 'مدة الرضعة', 'المدة', 'الوزن', 'الطول', 'درجة الحرارة', 'معدل الرضاعة', 'عدد الرضعات', 'الحفاضات', 'ماء', 'سوائل', 'ساعات الراحة'].includes(f);
    if (numberField) return <div key={f} style={styles.fieldWrap}><label style={styles.fieldLabel}>{f}</label><input aria-label={f} type="number" min="0" step={f.includes('درجة') ? '0.1' : '1'} style={styles.input} value={value} onChange={e => saveField(e.target.value)} /></div>;
    if (f === 'ملاحظات') return <div key={f} style={styles.fieldWrap}><label style={styles.fieldLabel}>{f}</label><textarea aria-label={f} rows="2" style={styles.input} value={value} onChange={e => saveField(e.target.value)} placeholder="اكتبي التفاصيل المهمة" /></div>;
    const options = f === 'الجهة' || f === 'جهة الثدي' ? ['الثدي الأيمن', 'الثدي الأيسر', 'كلاهما', 'تبديل الجهة'] : f === 'نوع الحليب' ? ['حليب الأم', 'حليب صناعي', 'مختلط'] : f === 'رد فعل الرضيع' ? ['طبيعي', 'غازات', 'قيء', 'طفح أو حساسية', 'بكاء مستمر'] : f === 'درجة البرودة' ? ['درجة الغرفة', 'الثلاجة', 'الفريزر'] : f === 'درجة الحرارة' ? ['باردة', 'مناسبة', 'ساخنة'] : f === 'مستوى الشبع' ? ['شبع جيد', 'شبع جزئي', 'ما زال جائعًا'] : f === 'نظافة الرضاعة' ? ['تم التعقيم', 'غسل جيد', 'تحتاج تنظيفًا'] : null;
    if (options) return <div key={f} style={styles.fieldWrap}><label style={styles.fieldLabel}>{f}</label><select aria-label={f} style={styles.input} value={value} onChange={e => saveField(e.target.value)}><option value="">اختاري</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
    const checked = Boolean(value);
    return <button type="button" key={f} className={`lactation-check${checked ? ' is-checked' : ''}`} aria-pressed={checked} onClick={() => { const newData = {...data, [key]: checked ? '' : 'تم التأكيد'}; setData(newData); localStorage.setItem('lady_lactation', JSON.stringify(newData)); }}><span>{f}</span><span className="lactation-check-mark"><Check size={15} strokeWidth={3} /></span></button>;
  };

  return (
    <div style={styles.mainContainer}>
      <style>{`.lactation-check{min-height:46px;padding:9px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font:inherit;font-size:.75rem;display:flex;align-items:center;justify-content:space-between;gap:7px;text-align:right;cursor:pointer;transition:transform .18s ease,background .18s ease,border-color .18s ease}.lactation-check:active{transform:scale(.97)}.lactation-check.is-checked{background:rgba(255,255,255,.3);border-color:#fff}.lactation-check-mark{width:23px;height:23px;flex:0 0 23px;border-radius:7px;border:2px solid rgba(255,255,255,.65);display:grid;place-items:center;color:transparent;background:rgba(255,255,255,.12);transition:all .18s ease}.lactation-check.is-checked .lactation-check-mark{background:#fff;border-color:#fff;color:#739673}.lactation-tools input,.lactation-tools select,.lactation-tools textarea{width:100%;box-sizing:border-box;padding:8px;border:0;border-radius:9px;background:#fff;color:#355b3a;font:inherit;font-size:.75rem}`}</style>
      <div style={styles.header}>
        <div style={styles.statsRow}>
          <button onClick={() => setShowChat(true)} style={{...styles.circle, border:'none', cursor:'pointer', background:'#fff', color:'#739673'}}>💬</button>
          <div style={styles.circle}>🤱</div>
          <div style={styles.circle}><Icon size={18} /></div>
        </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={styles.title}>مستشار الرضاعة الذكي</h2>
            <div style={styles.subtitle}>اختاري بعلامة صح — والوقت والتاريخ كما هما</div>
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${Math.min((todayFeeds.length / Math.max(Number(feedingSettings.dailyTarget) || 1, 1)) * 100, 100)}%` }}></div></div>
      </div>

      <section className="lactation-tools" style={styles.trackerCard} aria-labelledby="lactation-tracker-title">
        <button type="button" style={styles.trackerHeader} onClick={() => setShowFeedingTools(!showFeedingTools)}>
          <span id="lactation-tracker-title">🤱 متابعة الرضعات اليوم</span><span>{showFeedingTools ? '▲' : '▼'}</span>
        </button>
        {showFeedingTools && <>
          <div style={styles.counterRow}>
            <div><strong style={styles.counterNumber}>{todayFeeds.length}</strong><span style={styles.counterLabel}>رضعة مسجلة</span></div>
            <div><strong style={styles.counterNumber}>{feedingSettings.dailyTarget}</strong><span style={styles.counterLabel}>الهدف اليومي</span></div>
            <div><strong style={styles.counterNumber}>{Math.max(Number(feedingSettings.dailyTarget) - todayFeeds.length, 0)}</strong><span style={styles.counterLabel}>المتبقي</span></div>
          </div>
          <div style={styles.settingsStrip}>
            <label>الهدف اليومي<input type="number" min="1" max="24" value={feedingSettings.dailyTarget} onChange={(e) => updateFeedingSettings('dailyTarget', e.target.value)} /></label>
            <label>التذكير بعد (ساعة)<input type="number" min="1" max="8" step="0.5" value={feedingSettings.reminderInterval} onChange={(e) => updateFeedingSettings('reminderInterval', e.target.value)} /></label>
            <label>الجهة الافتراضية<select value={feedingSettings.defaultSide} onChange={(e) => { updateFeedingSettings('defaultSide', e.target.value); updateFeedEntry('side', e.target.value); }}><option>تبديل الجهة</option><option>الثدي الأيمن</option><option>الثدي الأيسر</option><option>كلاهما</option></select></label>
          </div>
          <div style={styles.feedEntryBox}>
            <strong>تسجيل رضعة الآن</strong>
            <div style={styles.feedGrid}>
              <label>الوقت<input type="time" value={feedEntry.time} onChange={(e) => updateFeedEntry('time', e.target.value)} /></label>
              <label>النوع<select value={feedEntry.type} onChange={(e) => updateFeedEntry('type', e.target.value)}><option>طبيعية</option><option>صناعية</option><option>شفط</option></select></label>
              <label>الجهة<select value={feedEntry.side} onChange={(e) => updateFeedEntry('side', e.target.value)}><option>تبديل الجهة</option><option>الثدي الأيمن</option><option>الثدي الأيسر</option><option>كلاهما</option></select></label>
              <label>المدة (دقيقة)<input type="number" min="0" step="1" value={feedEntry.duration} onChange={(e) => updateFeedEntry('duration', e.target.value)} /></label>
              <label>الكمية (مل)<input type="number" min="0" step="5" value={feedEntry.amount} onChange={(e) => updateFeedEntry('amount', e.target.value)} /></label>
            </div>
            <label style={styles.fullLabel}>ملاحظة قصيرة<input type="text" value={feedEntry.notes} onChange={(e) => updateFeedEntry('notes', e.target.value)} placeholder="شبع، نوم، تقيؤ، ألم أو ملاحظة مهمة" /></label>
            <button type="button" style={styles.saveFeedBtn} onClick={saveFeedingEntry}>حفظ الرضعة وتذكير التالية ✓</button>
          </div>
          <div style={styles.feedHistory}><strong>سجل اليوم</strong>{todayFeeds.slice(-5).reverse().map((item) => <div key={item.id} style={styles.feedHistoryRow}><span>{item.time}</span><span>{item.type}</span><span>{item.side}</span><span>{item.duration ? `${item.duration} د` : item.amount ? `${item.amount} مل` : '—'}</span><button type="button" onClick={() => deleteFeedEntry(item.id)} aria-label="حذف الرضعة">حذف</button></div>)}{todayFeeds.length === 0 && <small>لم تُسجل رضعات اليوم بعد.</small>}</div>
        </>}
      </section>

      <div style={styles.sectionsList}>
        {sections.map((sec, i) => (
          <div key={i} style={{...styles.sectionCard, background: openIdx === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}}>
            <div style={styles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span style={{ fontWeight: 'bold' }}>{sec.emoji} {sec.title}</span>
              <span style={styles.plusIcon}>{openIdx === i ? '✕' : '＋'}</span>
            </div>
            {openIdx === i && (
                  <div style={styles.fieldsGrid}>{sec.fields.map(f => renderInput(f, sec.title))}</div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.footerControls}>
        <button onClick={() => handleSaveAndAnalyze()} style={styles.analyzeBtn}>
          {loading ? 'جاري إعداد التقرير الطبي...' : 'إصدار تقرير الرضاعة الشامل'}
        </button>

        <div style={styles.historyBox}>
          {history.map(item => (
            <div key={item.id} style={styles.historyItem}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <small style={{ opacity: 0.6 }}>{item.date}</small>
                <div style={{display:'flex', gap:'5px'}}>
                   <button onClick={() => deleteResponse(item.id)} style={styles.smallActionBtn}>🗑️</button>
                   <button onClick={() => {setAiResponse(item.text); setShowChat(true);}} style={styles.smallActionBtn}>👁️</button>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', marginTop:'5px' }}>{item.text.substring(0, 80)}...</div>
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <div style={styles.overlay}>
          <div style={styles.chatSheet}>
            <div style={styles.chatHeader}>
              <span style={{ fontWeight: '800' }}>🤱 التقرير الطبي للرضاعة</span>
              <button onClick={() => setShowChat(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.chatBody}>
              {chatImage && <img src={chatImage} alt="الصورة المرفقة" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 12, marginBottom: 12 }} />}
              {loading ? (
                <div style={{textAlign:'center', marginTop:'50px'}}>
                   <div style={styles.loader}></div>
                   <p style={{fontSize:'0.8rem', color:'#739673'}}>جاري فحص البيانات طبياً...</p>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-line', lineHeight:'1.6' }}>
                  {aiResponse || "أدخلي بياناتكِ واضغطي على 'تحليل' للحصول على التقرير."}
                </div>
              )}
            </div>
            <div style={styles.chatFooter}>
              <div style={{ marginBottom: 10 }}>
                <ChatMediaControls imageData={chatImage} onImageSelected={setChatImage} onImageRemoved={() => setChatImage(null)}
                  onTranscript={(text) => setUserQuery((value) => `${value}${value ? ' ' : ''}${text}`)} disabled={loading} accent="#739673" />
              </div>
              <div style={styles.chatInputWrapper}>
                <input
                  style={styles.chatInput}
                  placeholder="اسألي الخبيرة عن أي تفاصيل إضافية..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSend())}
                />
                <button
                  onClick={handleChatSend}
                  style={styles.sendBtn}
                >🚀</button>
              </div>
              <button onClick={() => setShowChat(false)} style={styles.doneBtn}>فهمت التوصيات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
    mainContainer: {
      background: 'linear-gradient(160deg, #96b896 0%, #739673 100%)',
      borderRadius: '35px', padding: '20px', color: '#fff', direction: 'rtl',
      fontFamily: 'sans-serif', minHeight: '90vh', position: 'relative', overflow: 'hidden',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2)', border: '6px solid rgba(255,255,255,0.1)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    statsRow: { display: 'flex', gap: '8px' },
    circle: { width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    title: { margin: 0, fontSize: '1.1rem', fontWeight: '800' },
    subtitle: { fontSize: '0.6rem', opacity: 0.8 },
    progressContainer: { marginBottom: '20px' },
    progressBar: { width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
    progressFill: { width: '75%', height: '100%', background: '#fff', borderRadius: '10px' },
    trackerCard: { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '18px', padding: '13px', marginBottom: '14px' },
    trackerHeader: { width: '100%', display: 'flex', justifyContent: 'space-between', background: 'none', border: 0, color: '#fff', font: 'inherit', fontWeight: '800', padding: 0, cursor: 'pointer', textAlign: 'right' },
    counterRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '7px', margin: '13px 0' },
    counterNumber: { display: 'block', fontSize: '1.35rem', textAlign: 'center' },
    counterLabel: { display: 'block', fontSize: '.62rem', textAlign: 'center', opacity: .85 },
    settingsStrip: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '7px', marginBottom: '11px' },
    settingsStripLabel: { fontSize: '.68rem' },
    feedEntryBox: { background: 'rgba(0,0,0,.08)', borderRadius: '13px', padding: '10px' },
    feedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '7px', marginTop: '8px' },
    feedEntryLabel: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.68rem' },
    fullLabel: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.68rem', marginTop: '8px' },
    saveFeedBtn: { width: '100%', border: 0, borderRadius: '10px', padding: '10px', marginTop: '9px', background: '#fff', color: '#5e8561', fontWeight: '800', cursor: 'pointer' },
    feedHistory: { marginTop: '12px', fontSize: '.72rem' },
    feedHistoryRow: { display: 'grid', gridTemplateColumns: '45px 55px 1fr 50px 35px', gap: '4px', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.18)' },
    fieldWrap: { marginBottom: '10px' },
    fieldLabel: { fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: '#eee' },
    sectionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    sectionCard: { borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' },
    sectionHeader: { padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
    plusIcon: { background: '#fff', color: '#739673', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' },
    fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.05)' },
    input: { width: '100%', padding: '8px', borderRadius: '10px', border: 'none', fontSize: '0.8rem' },
    footerControls: { marginTop: '20px' },
    analyzeBtn: { width: '100%', padding: '12px', borderRadius: '15px', border: 'none', background: '#fff', color: '#739673', fontWeight: 'bold', cursor: 'pointer' },
    actionButtons: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0' },
    roundBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff' },
    historyBox: { maxHeight: '150px', overflowY: 'auto', marginTop: '10px' },
    historyItem: { background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', marginBottom: '8px' },
    smallActionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    chatSheet: { background: '#fff', width: '92%', height: '80%', borderRadius: '30px', color: '#333', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease' },
    chatHeader: { padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', color: '#739673' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#999' },
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', fontSize: '0.9rem', textAlign: 'right' },
    chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
    chatInputWrapper: { display: 'flex', gap: '8px', marginBottom: '10px' },
    chatInput: { flex: 1, padding: '12px', borderRadius: '18px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none' },
    sendBtn: { background: '#739673', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff' },
    doneBtn: { background: '#739673', color: '#fff', border: 'none', padding: '10px', borderRadius: '18px', fontSize: '0.9rem', width: '100%', fontWeight: 'bold' },
    loader: { border: '3px solid #f3f3f3', borderTop: '3px solid #739673', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '10px auto' }
};

export default LactationHub;
