import { privateAiPost } from '../../services/apiClient';
import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import ChatMediaControls from '../../components/ChatMediaControls';
import { persistAiHealthRecord, persistAiScheduledNotification } from '../../services/profileApi';

// تم إصلاح المسار هنا ليكون نسبياً (Relative Path) ليعمل الـ Build بنجاح
import alarmSound from '../../assets/fine-alarm.mp3';

const AnalogClock = memo(() => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hoursDeg = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;
  const minutesDeg = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const secondsDeg = (time.getSeconds() / 60) * 360;

  return (
    <div style={clockStyles.outerRing}>
      <div style={clockStyles.clockFace}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{...clockStyles.tick, transform: `rotate(${i * 30}deg)`}} />
        ))}
        <span style={{...clockStyles.num, top: '10px', left: '50%', transform: 'translateX(-50%)'}}>12</span>
        <span style={{...clockStyles.num, bottom: '10px', left: '50%', transform: 'translateX(-50%)'}}>6</span>
        <span style={{...clockStyles.num, left: '10px', top: '50%', transform: 'translateY(-50%)'}}>9</span>
        <span style={{...clockStyles.num, right: '10px', top: '50%', transform: 'translateY(-50%)'}}>3</span>
        <div style={{ ...clockStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)` }} />
        <div style={{ ...clockStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)` }} />
        <div style={{ ...clockStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)` }} />
        <div style={clockStyles.centerDot} />
      </div>
    </div>
  );
});

const sections = [
  { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "الطول", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات", "تسجيل القياس الصباحي"] },
  { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات", "مستوى الشدة", "وقت التمرين", "تمرين الإحماء", "تمرين الإطالة", "راحة بين التمارين"] },
  { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل", "وجبة إفطار", "خضار أو فاكهة", "وجبة خفيفة مناسبة", "تسجيل الوجبات"] },
  { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "أعشاب", "ديتوكس", "الترطيب", "تجنب السكر", "زجاجة ماء قريبة", "تسجيل آخر كوب"] },
  { id: "sleep", title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "الاستيقاظ", "الجودة", "الاسترخاء", "الكافيين", "القيلولة", "موعد نوم ثابت", "إبعاد الهاتف قبل النوم"] },
  { id: "mind", title: "الصحة النفسية", emoji: "🧠", fields: ["التوتر", "التنفس", "المزاج", "الدافعية", "التأمل", "عادات إيجابية", "وقت للراحة", "طلب الدعم عند الحاجة"] },
  { id: "beauty", title: "المكملات والجمال", emoji: "✨", fields: ["فيتامينات", "جلد", "شعر", "كولاجين", "حرق", "أوميجا 3", "العناية بالبشرة", "العناية بالشعر", "مراجعة المكملات"] },
  { id: "cycle", title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة", "الاحتباس", "تغير الوزن", "الرياضة", "ألم الجسم", "النوم أثناء الدورة", "تسجيل الأعراض"] }
];

const PregnancyMonitor = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('roqa_chat_history')) || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showClockSettings, setShowClockSettings] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_fitness')) || {});
  const [alarms, setAlarms] = useState(() => JSON.parse(localStorage.getItem('roqa_alarms')) || {});
  const todayKey = new Date().toISOString().slice(0, 10);
  const defaultDailyEntry = { weight: '', height: '', waist: '', steps: '', exerciseMinutes: '', exerciseType: '', water: '', sleep: '', meals: '', mood: '', notes: '' };
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem('fitness_daily_logs')) || []);
  const [dailyEntry, setDailyEntry] = useState(() => ({ ...defaultDailyEntry, ...(JSON.parse(localStorage.getItem('fitness_daily_logs')) || []).find((item) => item.date === new Date().toISOString().slice(0, 10)) }));
  const [fitnessGoals, setFitnessGoals] = useState(() => ({ steps: 7000, exerciseMinutes: 30, water: 2000, sleep: 7, ...(JSON.parse(localStorage.getItem('fitness_goals')) || {}) }));
  const [trackingReminders, setTrackingReminders] = useState(() => ({ weight: '08:00', walk: '17:00', water: '12:00', meals: '14:00', daily: '20:00', ...(JSON.parse(localStorage.getItem('fitness_tracking_reminders')) || {}) }));
  const [showTracking, setShowTracking] = useState(true);

  const audioRef = useRef(new Audio(alarmSound));

  useEffect(() => {
    localStorage.setItem('roqa_alarms', JSON.stringify(alarms));
    localStorage.setItem('roqa_chat_history', JSON.stringify(chatHistory.map(({ image, img, ...message }) => message)));
    localStorage.setItem('fitness_daily_logs', JSON.stringify(dailyLogs.slice(-120)));
    localStorage.setItem('fitness_goals', JSON.stringify(fitnessGoals));
    localStorage.setItem('fitness_tracking_reminders', JSON.stringify(trackingReminders));
  }, [alarms, chatHistory, dailyLogs, fitnessGoals, trackingReminders]);

  useEffect(() => {
    const savedToday = dailyLogs.find((item) => item.date === todayKey);
    if (savedToday) setDailyEntry({ ...defaultDailyEntry, ...savedToday });
  }, [todayKey]);

  const updateDailyEntry = (key, value) => setDailyEntry((previous) => ({ ...previous, [key]: value }));
  const saveDailyEntry = () => {
    const entry = { ...dailyEntry, date: todayKey, savedAt: new Date().toISOString() };
    setDailyLogs((previous) => [...previous.filter((item) => item.date !== todayKey), entry].sort((a, b) => a.date.localeCompare(b.date)));
    updateData('lastDailyEntry', todayKey);
  };
  const numeric = (value) => Number.parseFloat(value) || 0;
  const previousWeight = [...dailyLogs].filter((item) => item.date !== todayKey && numeric(item.weight) > 0).pop();
  const heightMeters = numeric(dailyEntry.height || data['الطول']) / 100;
  const bmi = heightMeters > 0 && numeric(dailyEntry.weight) > 0 ? (numeric(dailyEntry.weight) / (heightMeters * heightMeters)).toFixed(1) : null;
  const averageSteps = dailyLogs.length ? Math.round(dailyLogs.reduce((sum, item) => sum + numeric(item.steps), 0) / dailyLogs.length) : 0;

  const syncTrackingReminders = async (nextReminders) => {
    const existing = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
    const withoutTracking = existing.filter((item) => !String(item.id).startsWith('fitness-tracking-'));
    const labels = { weight: ['⚖️ متابعة الوزن', 'سجلي وزنك ومحيط خصرك اليوم.'], walk: ['🚶‍♀️ وقت المشي', 'حان وقت المشي أو الحركة الخفيفة.'], water: ['💧 تذكير الماء', 'اشربي كوبًا من الماء الآن.'], meals: ['🥗 متابعة الوجبات', 'سجلي وجبتك واختاري مصدر بروتين وخضار.'], daily: ['✅ المتابعة اليومية', 'أكملي سجل الرشاقة اليومي.'] };
    const reminders = Object.entries(nextReminders).map(([key, time]) => {
      const scheduled = nextAlarmDate(time); const [title, body] = labels[key] || [];
      return scheduled && title ? { id: `fitness-tracking-${key}`, title, body, scheduled_for: scheduled.toISOString(), extra: { type: 'fitness_tracking', tracker: key } } : null;
    }).filter(Boolean);
    localStorage.setItem('raqqa_local_reminders', JSON.stringify([...withoutTracking, ...reminders]));
    window.dispatchEvent(new Event('trigger_sync_notifications'));
    await Promise.all(reminders.map((reminder) => persistAiScheduledNotification({ category: 'fitness_tracking', title: reminder.title, body: reminder.body, scheduled_for: reminder.scheduled_for, metadata: reminder.extra }).catch(() => null)));
  };

  useEffect(() => { syncTrackingReminders(trackingReminders); }, [trackingReminders]);

  const nextAlarmDate = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    return target;
  };

  const syncFitnessAlarmReminders = async (nextAlarms) => {
    const existing = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
    const withoutFitness = existing.filter((item) => !String(item.id).startsWith('fitness-alarm-'));
    const reminders = Object.entries(nextAlarms).map(([id, time]) => {
      const scheduled = nextAlarmDate(time);
      const section = sections.find((item) => item.id === id);
      if (!scheduled || !section) return null;
      return { id: `fitness-alarm-${id}`, title: `⏰ ${section.title}`, body: `حان وقت تسجيل ${section.title}.`, scheduled_for: scheduled.toISOString(), extra: { type: 'fitness_alarm', sectionId: id } };
    }).filter(Boolean);
    localStorage.setItem('raqqa_local_reminders', JSON.stringify([...withoutFitness, ...reminders]));
    window.dispatchEvent(new Event('trigger_sync_notifications'));
    await Promise.all(reminders.map((reminder) => persistAiScheduledNotification({ category: 'fitness_wellness', title: reminder.title, body: reminder.body, scheduled_for: reminder.scheduled_for, metadata: reminder.extra }).catch(() => null)));
  };

  // --- تفعيل المنبه الصوتي والإشعارات المحلية ---
  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      Object.entries(alarms).forEach(([id, time]) => {
        if (time === currentTime && now.getSeconds() === 0) {
          audioRef.current.play().catch(e => console.log("Audio deferred"));

          const section = sections.find(s => s.id === id);
          // الجدولة الأساسية تتم عبر raqqa_local_reminders حتى تعمل والتطبيق مغلق.
        }
      });
    }, 1000);
    return () => clearInterval(checkAlarms);
  }, [alarms]);

  useEffect(() => {
    syncFitnessAlarmReminders(alarms);
  }, [alarms]);

  // --- دالة الحفظ والتحليل الجديدة المستبدلة ---
  const handleSaveAndAnalysis = async (aiGeneratedReport, scheduledTime) => {
    try {
      await persistAiHealthRecord('fitness_wellness', { data, aiReport: aiGeneratedReport });
      // 1. إعداد نص الإشعار الفوري للتأكيد
      const instantConfirm = {
        id: Math.floor(Math.random() * 10000),
        title: "✅ تم حفظ بياناتك بشكل آمن",
        body: "تم تحليل بياناتك وحفظ التقرير، وسنذكّرك في الموعد المحدد.",
        scheduled_for: new Date(Date.now() + 500).toISOString(), // يظهر فوراً بعد نصف ثانية
      };

      // 2. إعداد إشعار الموعد المخصص الذي يحتوي على تقرير الذكاء الاصطناعي
      const aiReportNotification = {
        id: Math.floor(Math.random() * 10000),
        title: "✨ تقرير رقة الذكي",
        body: aiGeneratedReport, // نص تقرير الذكاء الاصطناعي الذي سيظهر للمستخدم
        scheduled_for: scheduledTime, // التاريخ والوقت المخصص
        extra: { report: aiGeneratedReport }
      };

      // 3. الحفظ المحلي في المصفوفة الموحدة (raqqa_local_reminders)
      const existingReminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
      const updatedReminders = [...existingReminders, instantConfirm, aiReportNotification];
      localStorage.setItem('raqqa_local_reminders', JSON.stringify(updatedReminders));

      // 4. إطلاق إشارة التفعيل الفوري لملف App.jsx لجدولة الإشعارات في الأندرويد
      window.dispatchEvent(new Event('trigger_sync_notifications'));
      await persistAiScheduledNotification({ category: 'fitness_wellness', title: 'تذكير النشاط الصحي', body: 'حان وقت تسجيل نشاطك الصحي.', scheduled_for: scheduledTime });

      console.log("🚀 تم الحفظ، التحليل، وإرسال إشارة الإشعار الفوري");

    } catch (error) {
      console.error("خطأ في عملية الحفظ والجدولة:", error);
    }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const handleSectionAction = async (section) => {
    setIsLoading(true);
    setIsChatOpen(true);
    setChatHistory(prev => [{ type: 'ai', text: 'جاري تجهيز التحليل الآمن…' }, ...prev]);
    const sectionData = section.fields.map(f => `${f}: ${data[`${section.id}-${f}`] || 'N/A'}`).join(", ");
    const trackingContext = `المتابعة اليومية: ${JSON.stringify(dailyEntry)}، الأهداف: ${JSON.stringify(fitnessGoals)}، متوسط الخطوات: ${averageSteps}، BMI: ${bmi || 'غير متاح'}`;
    try {
      const response = await privateAiPost({
        specialtyTopic: 'fitness',
        data: { prompt: `بصفتك خبيرة صحة ورشاقة، حللي بيانات ${section.title}: ${sectionData}. ${trackingContext}. قدمي ملاحظات عملية قابلة للقياس، واذكري متى يلزم استشارة مختص، دون تشخيص أو وعود بنتائج.` }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ type: 'ai', text: `(تحليل تلقائي لـ ${section.title}): ${reply}` }, ...prev]);

      // إعداد وقت مجدول (مثلاً بعد 24 ساعة من الآن بشكل افتراضي)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      // استدعاء الدالة الجديدة هنا
      await handleSaveAndAnalysis(reply, futureDate.toISOString());

      setIsChatOpen(true);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [{ type: 'ai', text: err?.message || 'تعذر تشغيل التحليل الآن. تأكدي من تسجيل الدخول واتصال الإنترنت ثم حاولي مرة أخرى.' }, ...prev]);
    }
    finally { setIsLoading(false); }
  };

  const handleAIQuery = async () => {
    if (!prompt.trim() && !capturedImage) return;
    const userMsg = prompt;
    setPrompt("");
    setIsLoading(true);
    setIsChatOpen(true);
    try {
      const response = await privateAiPost({
        specialtyTopic: 'fitness',
        data: { prompt: userMsg || 'حللي الصورة المرفقة صحياً', image: capturedImage || undefined }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ type: 'user', text: userMsg || 'صورة مرفقة للتحليل', img: capturedImage }, { type: 'ai', text: reply }, ...prev]);
      setCapturedImage(null);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [{ type: 'ai', text: err?.message || 'تعذر تشغيل التحليل الآن. تأكدي من تسجيل الدخول واتصال الإنترنت ثم حاولي مرة أخرى.' }, ...prev]);
    }
    finally { setIsLoading(false); }
  };

  return (
    <div style={mergedStyles.container}>
      <div style={mergedStyles.clockSection}>
        <AnalogClock />
        <button style={mergedStyles.miniClockBtn} onClick={() => setShowClockSettings(!showClockSettings)}>
          {showClockSettings ? "إغلاق الضبط" : "ضبط مواعيد التنبيه ⏰"}
        </button>
        {showClockSettings && (
          <div style={mergedStyles.alarmList}>
            {sections.map(s => (
              <div key={s.id} style={mergedStyles.alarmItem}>
                <span>{s.emoji} {s.title}</span>
                <input type="time" value={alarms[s.id] || ''} onChange={(e) => setAlarms({...alarms, [s.id]: e.target.value})} />
              </div>
            ))}
          </div>
        )}
      </div>

      <section style={mergedStyles.trackingCard} aria-labelledby="fitness-tracking-title">
        <button type="button" style={mergedStyles.trackingTitle} onClick={() => setShowTracking(!showTracking)}>
          <span id="fitness-tracking-title">📊 المتابعة اليومية الحقيقية</span><span>{showTracking ? '▲' : '▼'}</span>
        </button>
        {showTracking && <>
          <p style={mergedStyles.trackingHint}>سجلي أرقام اليوم بدل الاكتفاء بالتعليم، وسيُحفظ السجل تلقائيًا لمقارنة تقدمك مع الوقت.</p>
          <div style={mergedStyles.metricGrid}>
            {[
              ['weight', 'الوزن (كجم)', 'number', '0.1'], ['height', 'الطول (سم)', 'number', '0.1'], ['waist', 'الخصر (سم)', 'number', '0.1'], ['steps', 'الخطوات', 'number', '1'],
              ['exerciseMinutes', 'مدة الرياضة (دقيقة)', 'number', '1'], ['water', 'الماء (مل)', 'number', '100'], ['sleep', 'النوم (ساعة)', 'number', '0.5']
            ].map(([key, label, type, step]) => <label key={key} style={mergedStyles.metricInput}><span>{label}</span><input type={type} min="0" step={step} value={dailyEntry[key]} onChange={(e) => updateDailyEntry(key, e.target.value)} /></label>)}
          </div>
          <div style={mergedStyles.metricGrid}>
            <label style={mergedStyles.metricInput}><span>نوع الرياضة</span><select value={dailyEntry.exerciseType} onChange={(e) => updateDailyEntry('exerciseType', e.target.value)}><option value="">اختاري النوع</option><option>مشي</option><option>تمارين مقاومة</option><option>كارديو</option><option>يوغا أو إطالة</option><option>راحة</option></select></label>
            <label style={mergedStyles.metricInput}><span>الوجبات المتوازنة</span><select value={dailyEntry.meals} onChange={(e) => updateDailyEntry('meals', e.target.value)}><option value="">اختاري التقييم</option><option>وجبات منتظمة</option><option>بروتين وخضار في أغلب الوجبات</option><option>أكل عاطفي أو غير منتظم</option><option>أحتاج دعمًا</option></select></label>
            <label style={mergedStyles.metricInput}><span>المزاج والطاقة</span><select value={dailyEntry.mood} onChange={(e) => updateDailyEntry('mood', e.target.value)}><option value="">اختاري الحالة</option><option>ممتازة</option><option>جيدة</option><option>متوسطة</option><option>منخفضة</option></select></label>
          </div>
          <label style={mergedStyles.metricInput}><span>ملاحظات اليوم</span><textarea rows="2" value={dailyEntry.notes} onChange={(e) => updateDailyEntry('notes', e.target.value)} placeholder="اكتبي ما أكلتِه، الألم، أو أي ملاحظة تساعدك على فهم تقدمك" /></label>
          <button type="button" style={mergedStyles.saveTrackingBtn} onClick={saveDailyEntry}>حفظ متابعة اليوم ✓</button>
          <div style={mergedStyles.insightRow}>
            <span>الـ BMI: <b>{bmi || 'أضيفي الطول والوزن'}</b></span>
            <span>التغير: <b>{previousWeight && numeric(dailyEntry.weight) ? `${(numeric(dailyEntry.weight) - numeric(previousWeight.weight)).toFixed(1)} كجم` : 'لا توجد مقارنة'}</b></span>
            <span>متوسط الخطوات: <b>{averageSteps || '—'}</b></span>
          </div>
          <div style={mergedStyles.goalsBox}>
            <strong>أهدافك اليومية</strong>
            <div style={mergedStyles.metricGrid}>
              {[["steps", "خطوة"], ["exerciseMinutes", "دقيقة رياضة"], ["water", "مل ماء"], ["sleep", "ساعة نوم"]].map(([key, label]) => <label key={key} style={mergedStyles.goalInput}><span>{label}</span><input type="number" min="0" value={fitnessGoals[key]} onChange={(e) => setFitnessGoals((previous) => ({ ...previous, [key]: e.target.value }))} /></label>)}
            </div>
          </div>
          <div style={mergedStyles.historyBox}><strong>آخر السجلات</strong>{dailyLogs.slice(-5).reverse().map((item) => <div key={item.date} style={mergedStyles.historyRow}><span>{item.date}</span><span>{item.weight || '—'} كجم</span><span>{item.steps || '—'} خطوة</span><span>{item.exerciseMinutes || '—'} د</span></div>)}</div>
        </>}
      </section>

      <section style={mergedStyles.trackingCard} aria-labelledby="fitness-reminders-title">
        <div style={mergedStyles.trackingTitle} id="fitness-reminders-title"><span>🔔 جدولة المتابعة والإشعارات</span></div>
        <p style={mergedStyles.trackingHint}>تذكيرات مستقرة للوزن والمشي والماء والوجبات والسجل اليومي، ويمكن تعديل وقت كل منها.</p>
        <div style={mergedStyles.reminderGrid}>{[["weight", "الوزن"], ["walk", "المشي"], ["water", "الماء"], ["meals", "الوجبات"], ["daily", "السجل اليومي"]].map(([key, label]) => <label key={key} style={mergedStyles.reminderItem}><span>{label}</span><input type="time" value={trackingReminders[key]} onChange={(e) => setTrackingReminders((previous) => ({ ...previous, [key]: e.target.value }))} /></label>)}</div>
      </section>

      <button style={mergedStyles.openChatBtn} onClick={() => setIsChatOpen(true)}>
        💬 تحدث مع طبيبة رقة الذكية
      </button>

      {isChatOpen && (
        <div style={mergedStyles.chatOverlay}>
          <div style={mergedStyles.chatCard}>
            <div style={mergedStyles.chatHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <div style={mergedStyles.statusDot}></div>
                <span>👩‍⚕️ طبيبة رقة الذكية</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={mergedStyles.closeBtn}>✕</button>
            </div>

            <div style={mergedStyles.chatBody}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={msg.type === 'user' ? mergedStyles.userMsg : mergedStyles.aiMsg}>
                  {msg.img && <img src={msg.img} alt="uploaded" style={mergedStyles.chatImg} />}
                  {msg.text}
                </div>
              ))}
              {isLoading && <div style={mergedStyles.aiMsg}>جاري التحليل بعناية... ✨</div>}
            </div>

            <div style={mergedStyles.chatFooter}>
              {capturedImage && (
                <div style={mergedStyles.previewWrapper}>
                  <img src={capturedImage} style={mergedStyles.miniPreview} />
                  <button onClick={() => setCapturedImage(null)} style={mergedStyles.removeImg}>✕</button>
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <ChatMediaControls imageData={capturedImage} onImageSelected={setCapturedImage} onImageRemoved={() => setCapturedImage(null)}
                  onTranscript={(text) => setPrompt((value) => `${value}${value ? ' ' : ''}${text}`)} disabled={isLoading} accent="#7b1fa2" />
              </div>
              <div style={mergedStyles.chatInputRow}>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="اسألي طبيبتك عن أي شيء..."
                  style={mergedStyles.chatInput}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAIQuery())}
                />
                <button onClick={handleAIQuery} style={mergedStyles.sendBtn} disabled={isLoading}>
                  {isLoading ? '...' : '➔'}
                </button>
              </div>
              <div style={mergedStyles.chatActions}>
                <button onClick={() => setChatHistory([])} style={mergedStyles.actionBtnText}>🗑️ مسح السجل</button>
                <button style={mergedStyles.actionBtnText}>💾 السجلات المحفوظة</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={mergedStyles.accordion}>
            {sections.map((sec, i) => (
              <div key={sec.id} style={mergedStyles.sectionCard}>
                <div style={mergedStyles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span style={{fontSize:'1.1rem'}}>{sec.emoji} {sec.title} <small style={mergedStyles.sectionProgress}>{sec.fields.filter((field) => Boolean(data[`${sec.id}-${field}`])).length}/{sec.fields.length}</small></span>
              <span>{openIdx === i ? '▲' : '▼'}</span>
            </div>
            {openIdx === i && (
              <div style={mergedStyles.verticalList}>
                {sec.fields.map((f) => {
                  const key = `${sec.id}-${f}`;
                  const checked = Boolean(data[key]);
                  return <label key={key} style={{ ...mergedStyles.checkInput, ...(checked ? mergedStyles.checkInputChecked : {}) }}><span>{f}</span><input type="checkbox" aria-label={f} checked={checked} onChange={() => updateData(key, checked ? '' : 'تم الإنجاز')} style={mergedStyles.hiddenCheckbox} /><span style={{ ...mergedStyles.checkMark, ...(checked ? mergedStyles.checkMarkChecked : {}) }}>✓</span></label>;
                })}
                <button style={mergedStyles.saveSectionBtn} onClick={() => handleSectionAction(sec)} disabled={isLoading}>
                    {isLoading ? "جاري التحليل..." : "حفظ وتحليل البيانات 💾"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// الستايلات
const clockStyles = {
  outerRing: { width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #f06292, #f8bbd0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', boxShadow: '0 8px 20px rgba(240, 98, 146, 0.3)' },
  clockFace: { width: '140px', height: '140px', borderRadius: '50%', background: '#fff', position: 'relative', overflow: 'hidden' },
  tick: { position: 'absolute', width: '2px', height: '8px', background: '#f8bbd0', left: '50%', transformOrigin: '0 70px' },
  num: { position: 'absolute', fontSize: '12px', fontWeight: 'bold', color: '#880e4f' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '5px', height: '35px', background: '#4a148c', transformOrigin: 'bottom center', borderRadius: '5px' },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '50px', background: '#ad1457', transformOrigin: 'bottom center', borderRadius: '3px' },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '55px', background: '#e91e63', transformOrigin: 'bottom center' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid white' },
};

const mergedStyles = {
  container: { background: '#fdfbff', padding: '15px', direction: 'rtl', minHeight: '100vh' },
  clockSection: { background: 'white', padding: '20px', borderRadius: '30px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' },
  miniClockBtn: { background: '#f06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  alarmList: { marginTop: '15px', background: '#fff0f5', padding: '10px', borderRadius: '15px' },
  alarmItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' },
  openChatBtn: { width: '100%', background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)', color: 'white', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: 'bold', marginBottom: '20px', fontSize: '16px', boxShadow: '0 4px 12px rgba(123, 31, 162, 0.3)' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatCard: { width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#7b1fa2', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusDot: { width: '10px', height: '10px', background: '#4caf50', borderRadius: '50%' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column-reverse', gap: '15px' },
  userMsg: { alignSelf: 'flex-start', background: '#e1bee7', padding: '12px 18px', borderRadius: '20px 20px 20px 5px', maxWidth: '85%', fontSize: '15px', color: '#333' },
  aiMsg: { alignSelf: 'flex-end', background: '#fff', padding: '12px 18px', borderRadius: '20px 20px 5px 20px', maxWidth: '85%', fontSize: '15px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  chatImg: { width: '100%', borderRadius: '10px', marginBottom: '8px' },
  chatFooter: { padding: '15px', background: 'white', borderTop: '1px solid #eee' },
  chatInputRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '25px', border: '1.5px solid #e1bee7', outline: 'none' },
  iconBtn: { background: '#f3e5f5', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '20px' },
  sendBtn: { background: '#ffd54f', border: 'none', width: '45px', height: '45px', borderRadius: '50%', fontSize: '24px', color: '#4a148c', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewWrapper: { position: 'relative', width: '70px', marginBottom: '10px' },
  miniPreview: { width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' },
  removeImg: { position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px' },
  chatActions: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' },
  actionBtnText: { background: 'none', border: 'none', color: '#7b1fa2', fontSize: '13px' },
  trackingCard: { background: 'linear-gradient(180deg, #fff, #fff8fc)', borderRadius: '22px', marginBottom: '16px', padding: '17px', border: '1px solid #eadcf2', boxShadow: '0 4px 14px rgba(123,31,162,.06)' },
  trackingTitle: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 0, color: '#4a148c', font: 'inherit', fontWeight: '900', fontSize: '16px', padding: 0, cursor: 'pointer', textAlign: 'right' },
  trackingHint: { color: '#765d80', fontSize: '12px', lineHeight: 1.7, margin: '10px 0 14px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: '10px', marginBottom: '11px' },
  metricInput: { display: 'flex', flexDirection: 'column', gap: '5px', color: '#633275', fontSize: '12px', fontWeight: '700' },
  goalInput: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px', color: '#633275', fontSize: '11px' },
  metricInputInput: { padding: '10px', borderRadius: '10px', border: '1px solid #e4d5ea', background: '#fff', font: 'inherit', minWidth: 0 },
  saveTrackingBtn: { width: '100%', padding: '13px', borderRadius: '13px', border: 0, background: '#7b1fa2', color: '#fff', fontWeight: '900', cursor: 'pointer' },
  insightRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' },
  goalsBox: { marginTop: '14px', padding: '12px', borderRadius: '14px', background: '#f8effb', color: '#4a148c' },
  historyBox: { marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #eadcf2', color: '#4a148c', fontSize: '12px' },
  historyRow: { display: 'grid', gridTemplateColumns: '1.2fr repeat(3, 1fr)', gap: '5px', padding: '7px 0', color: '#6d5b74', borderBottom: '1px solid #f0e8f3' },
  reminderGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '9px' },
  reminderItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', background: '#fff8fc', border: '1px solid #eadcf2', borderRadius: '11px', padding: '9px', color: '#633275', fontSize: '12px', fontWeight: '700' },
  sectionProgress: { marginRight: '7px', color: '#8a63a0', fontSize: '11px', fontWeight: '700' },
  hiddenCheckbox: { position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' },
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '15px', border: '1px solid #f3e5f5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  sectionHeader: { padding: '18px 20px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#4a148c' },
  verticalList: { padding: '20px', background: '#fffafb', display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', color: '#7b1fa2', fontWeight: '600' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px' },
  checkInput: { minHeight: '50px', padding: '10px 11px', borderRadius: '13px', border: '1px solid #eadcf2', background: '#fff', color: '#5b2679', font: 'inherit', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', textAlign: 'right', cursor: 'pointer', transition: 'transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease' },
  checkInputChecked: { background: '#f3e5f5', borderColor: '#7b1fa2', boxShadow: '0 5px 14px rgba(123,31,162,.14)' },
  checkMark: { width: '23px', height: '23px', flex: '0 0 23px', borderRadius: '7px', border: '2px solid #d8c1e3', color: 'transparent', display: 'grid', placeItems: 'center', transition: 'all .18s ease' },
  checkMarkChecked: { background: '#7b1fa2', borderColor: '#7b1fa2', color: '#fff', fontWeight: '900' },
  saveSectionBtn: { background: '#4a148c', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', fontSize: '15px' }
};

export default PregnancyMonitor;
