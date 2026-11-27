import { privateAiPost } from '../../services/apiClient';
import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import ChatMediaControls from '../../components/ChatMediaControls';
import { saveHealthRecord, saveScheduledNotification } from '../../services/profileApi';

// --- مكون الساعة المطور (بناءً على التقويم القمري 29 يوماً) ---
const PeriodClock = ({ prediction, startDate, cycleDuration = 29, periodDays = 5 }) => {
  const [rotation, setRotation] = useState(0);

  const clockLayout = useMemo(() => {
    const cycle = parseInt(cycleDuration) || 29;
    const period = parseInt(periodDays) || 5;
    const periodDeg = (period / cycle) * 360;
    const ovulationDay = cycle - 14;
    const fertilityStartDeg = ((ovulationDay - 3) / cycle) * 360;
    const fertilityEndDeg = ((ovulationDay + 2) / cycle) * 360;

    return { periodEnd: periodDeg, fertilityStart: fertilityStartDeg, fertilityEnd: fertilityEndDeg, cycle };
  }, [cycleDuration, periodDays]);

  const dayNumbers = useMemo(() => {
    const days = [];
    for (let i = 1; i <= clockLayout.cycle; i++) {
      const angle = (i / clockLayout.cycle) * 360 - 90;
      days.push({ day: i, angle });
    }
    return days;
  }, [clockLayout.cycle]);

  useEffect(() => {
    if (!startDate) return;
    const today = new Date();
    const start = new Date(startDate);
    const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24)) % clockLayout.cycle;
    setRotation((diffDays / clockLayout.cycle) * 360);
  }, [startDate, clockLayout.cycle]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '35px', backdropFilter: 'blur(10px)' }}>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '2px' }}></div> أيام الحيض</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: '#4CAF50', borderRadius: '2px' }}></div> أيام الخصوبة</div>
      </div>

      <div style={{ width: '220px', height: '220px', borderRadius: '50%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 15px 35px rgba(233, 30, 99, 0.15)', background: '#fff' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(#ff4d4d 0deg ${clockLayout.periodEnd}deg, #f0f0f0 ${clockLayout.periodEnd}deg ${clockLayout.fertilityStart}deg, #4CAF50 ${clockLayout.fertilityStart}deg ${clockLayout.fertilityEnd}deg, #f0f0f0 ${clockLayout.fertilityEnd}deg 360deg)`, opacity: 0.25, clipPath: 'circle(50% at 50% 50%)' }}></div>
        {dayNumbers.map((d) => (
          <div key={d.day} style={{ position: 'absolute', transform: `rotate(${d.angle}deg) translate(95px) rotate(${-d.angle}deg)`, fontSize: '9px', fontWeight: 'bold', color: d.day <= (parseInt(periodDays) || 5) ? '#ff4d4d' : '#888' }}>{d.day}</div>
        ))}
        <div style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transition: 'transform 1.5s' }}><span style={{ position: 'absolute', top: '-10px', left: 'calc(50% - 12px)', fontSize: '24px' }}>💖</span></div>
        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#E91E63' }}>{prediction ? 'توقعات رقة' : 'أهلاً بكِ'}</div>
        </div>
      </div>
    </div>
  );
};

const MenstrualTracker = () => {
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('menstrual_data')) || {});
  const [prediction, setPrediction] = useState(() => JSON.parse(localStorage.getItem('last_prediction')) || null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chat_history')) || []);
  const [savedNotes, setSavedNotes] = useState(() => JSON.parse(localStorage.getItem('saved_notes')) || []);
  const [openAccordion, setOpenAccordion] = useState(1);
  const [showSavedList, setShowSavedList] = useState(false);

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory.map(({ image, ...message }) => message)));
    localStorage.setItem('saved_notes', JSON.stringify(savedNotes));
    if (prediction) {
      localStorage.setItem('last_prediction', JSON.stringify(prediction));
    }
  }, [data, chatHistory, savedNotes, prediction]);

  const toggleChoice = (key, option, single = false) => {
    setData((previous) => {
      const current = Array.isArray(previous[key]) ? previous[key] : (previous[key] ? [previous[key]] : []);
      const next = current.includes(option) ? current.filter((item) => item !== option) : (single ? [option] : [...current, option]);
      return { ...previous, [key]: next };
    });
  };

  const displayValue = (value) => Array.isArray(value) ? value.join('، ') : (value || '');

  const saveMenstrualSelection = async (selectedData, nextPrediction) => {
    const savedAt = new Date().toISOString();
    const record = {
      schemaVersion: 2,
      category: 'menstrual',
      data: selectedData,
      prediction: nextPrediction,
      savedAt,
    };
    const localRecords = JSON.parse(localStorage.getItem('menstrual_records') || '[]');
    localStorage.setItem('menstrual_records', JSON.stringify([{ id: `menstrual-${Date.now()}`, ...record }, ...localRecords].slice(0, 50)));

    const confirmationTime = new Date(Date.now() + 2500).toISOString();
    const confirmationReminder = {
      id: `menstrual-saved-${Date.now()}`,
      title: 'تم حفظ بيانات الدورة بأمان',
      body: 'تم حفظ بياناتك، وسيصلك تنبيه عند الموعد المحدد.',
      scheduled_for: confirmationTime,
      extra: { type: 'menstrual_saved', schemaVersion: 2 },
    };
    const existingReminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
    localStorage.setItem('raqqa_local_reminders', JSON.stringify([...existingReminders.filter((item) => item.id !== confirmationReminder.id), confirmationReminder]));
    window.dispatchEvent(new Event('trigger_sync_notifications'));

    try {
      await saveHealthRecord('menstrual', record, { recordedAt: savedAt });
      await saveScheduledNotification({ category: 'menstrual', title: confirmationReminder.title, body: confirmationReminder.body, scheduled_for: confirmationTime, metadata: record });
    } catch (error) {
      console.error('Menstrual cloud save failed:', error);
    }
  };

  // --- دالة الحفظ المحلي والتحليل الذكي ---
  const handleSaveAndAnalysis = async (aiGeneratedReport, scheduledTime) => {
    const reminderId = `menstrual-${scheduledTime}`;
    const existingReminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
    const activeReminders = existingReminders.filter((item) => item.id !== reminderId);
    const periodReminder = {
      id: reminderId,
      title: "✨ تذكير موعد الدورة المتوقع",
      body: `قد تبدأ الدورة في ${new Date(scheduledTime).toLocaleDateString('ar-EG')}.`,
      scheduled_for: scheduledTime,
      extra: { report: aiGeneratedReport, type: 'menstrual_prediction' }
    };
    localStorage.setItem('raqqa_local_reminders', JSON.stringify([...activeReminders, periodReminder]));
    window.dispatchEvent(new Event('trigger_sync_notifications'));
    try {
      await saveHealthRecord('menstrual', { schemaVersion: 2, data, prediction, aiReport: aiGeneratedReport }, { recordedAt: new Date().toISOString() });
      const scheduledPayload = { category: 'menstrual', title: 'تذكير الدورة المتوقع', body: 'قد تبدأ دورتك حسب آخر تسجيل.', scheduled_for: scheduledTime, metadata: { schemaVersion: 2, data, prediction } };
      await saveScheduledNotification(scheduledPayload);
      console.log("🚀 تم الحفظ، التحليل، وإرسال إشارة الإشعار الفوري");

    } catch (error) {
      console.error("خطأ في عملية الحفظ والجدولة:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !chatImage) return;
    const currentInput = chatInput.trim() || 'حللي الصورة الصحية المرفقة من فضلك.';
    const userMsg = { id: Date.now(), role: 'user', content: currentInput, image: chatImage, time: new Date().toLocaleTimeString('ar-EG') };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await privateAiPost({
        specialtyTopic: 'cycle',
        data: { prompt: `أنا أنثى مسلمة، سؤالي هو: ${userMsg.content}. مع مراعاة كامل بياناتي الصحية بما فيها العمر والوزن وبيانات الفوط الصحية: ${JSON.stringify(data)}`, image: chatImage || undefined }
      });
      const responseText = response.data.reply || response.data.content || response.data.message;
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: responseText, time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => [...prev, aiMsg]);
      setChatImage(null);

      // حفظ الاستشارة محلياً كإشعار فوري
      await handleSaveAndAnalysis(responseText, new Date(Date.now() + 2000).toISOString());

    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setChatHistory(prev => prev.filter(msg => msg.id !== id));
  };

  const saveToNotes = (msg) => {
    if (!savedNotes.find(n => n.id === msg.id)) {
      setSavedNotes(prev => [...prev, msg]);
      alert('تم الحفظ في المفضلة');
    }
  };

  const handleSaveAndAnalyze = async () => {
    const startStr = data['سجل التواريخ_تاريخ البدء'];
    if (!startStr) {
        alert("الرجاء تحديد تاريخ بدء الدورة أولاً");
        return;
    }
    setLoading(true);

    const cycleLen = parseInt(data['سجل التواريخ_مدة الدورة']) || 29;
    const start = new Date(startStr);
    const nextDateObj = new Date(start);
    nextDateObj.setDate(start.getDate() + cycleLen);

    const ovulation = new Date(nextDateObj);
    ovulation.setDate(nextDateObj.getDate() - 14);
    const fertStart = new Date(ovulation); fertStart.setDate(ovulation.getDate() - 5);

    const calc = {
      nextDate: nextDateObj.toLocaleDateString('ar-EG'),
      nextDateRaw: nextDateObj.toISOString().split('T')[0],
      fertility: `${fertStart.toLocaleDateString('ar-EG')} - ${ovulation.toLocaleDateString('ar-EG')}`
    };
    setPrediction(calc);
    await saveMenstrualSelection(data, calc);

    try {
      const summary = JSON.stringify(data);
      const response = await privateAiPost({
        specialtyTopic: 'cycle',
        data: { prompt: `حللي بيانات الدورة الشهرية المختارة بعلامات الصح، مع التركيز على التواريخ والمدة والأعراض والمزاج والنزف والعناية الصحية، وقدمي تقريرًا تثقيفيًا حذرًا يوضح توقع الدورة القادمة دون تشخيص: ${summary}` }
      });
      const responseText = response.data.reply || response.data.content || response.data.message;

      const aiMsg = { id: Date.now(), role: 'ai', content: responseText, time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => [...prev, aiMsg]);

      // استخدام الدالة المحلية بدلاً من saveAndNotify الفيربيس
      await handleSaveAndAnalysis(responseText, new Date(calc.nextDateRaw).toISOString());

    } catch (e) { console.error(e); }

    setLoading(false);
    setShowChat(true);
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FFF5F7 0%, #FCE4EC 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl', overflowY: 'auto' },
    card: { background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 30px rgba(233, 30, 99, 0.05)', marginBottom: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #FFD1DF', outline: 'none', marginTop: '5px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
    chatBar: { padding: '15px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' },
    chatInput: { flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #FFD1DF', outline: 'none' },
    sendBtn: { background: '#E91E63', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: [
      { name: "تاريخ البدء", type: "date" }, { name: "تاريخ الانتهاء", type: "date" },
      { name: "مدة الدورة", single: true, options: ["21 يومًا", "24 يومًا", "26 يومًا", "28 يومًا", "29 يومًا", "30 يومًا", "32 يومًا", "35 يومًا"] },
      { name: "مدة الحيض", single: true, options: ["يوم واحد", "يومان", "3 أيام", "4 أيام", "5 أيام", "6 أيام", "7 أيام", "أكثر من 7 أيام"] },
    ] },
    { id: 2, title: "البيانات الأساسية", emoji: "⚖️", fields: [
      { name: "الفئة العمرية", options: ["أقل من 18", "18–24", "25–34", "35–44", "45 فأكثر"] },
      { name: "الفئة الوزنية", options: ["أقل من 50 كجم", "50–59 كجم", "60–69 كجم", "70–79 كجم", "80 كجم فأكثر", "لا أرغب بالإجابة"] },
      { name: "حالة صحية مرتبطة", options: ["لا توجد", "تكيس المبايض", "بطانة الرحم المهاجرة", "اضطراب الغدة", "فقر الدم", "لا أعلم"] },
      { name: "وسيلة منع الحمل", options: ["لا أستخدم", "حبوب", "لولب نحاسي", "لولب هرموني", "وسيلة أخرى"] },
    ] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: [
      { name: "أعراض اليوم", options: ["لا توجد أعراض", "تقلصات أسفل البطن", "ألم أسفل الظهر", "صداع أو شقيقة", "انتفاخ", "ألم الثدي", "غثيان", "دوخة", "تعب شديد", "إمساك أو إسهال", "حبوب أو تغير البشرة", "تغير الشهية"] },
      { name: "درجة الألم", options: ["لا يوجد", "خفيف", "متوسط", "شديد", "يمنعني من نشاطي"] },
      { name: "أعراض تستدعي الانتباه", options: ["نزف شديد جدًا", "ألم مفاجئ أو غير معتاد", "حرارة", "إغماء", "لا توجد"] },
    ] },
    { id: 4, title: "الحالة المزاجية والنوم", emoji: "😰", fields: [
      { name: "المشاعر الحالية", options: ["هادئة", "قلقة", "عصبية", "حزينة", "حساسة عاطفيًا", "متقلبة المزاج", "لا تغيير"] },
      { name: "النوم والطاقة", options: ["نوم جيد", "أرق", "نعاس زائد", "طاقة منخفضة", "طاقة طبيعية"] },
      { name: "الرغبة في الدعم", options: ["أحتاج نصيحة", "أحتاج متابعة الأعراض", "أحتاج تذكيرًا", "لا أحتاج حاليًا"] },
    ] },
    { id: 5, title: "النزف والعناية الصحية", emoji: "🩸", fields: [
      { name: "كثافة الدم", options: ["خفيف", "متوسط", "غزير", "متقطع", "تبقيع فقط"] },
      { name: "التجلطات", options: ["لا توجد", "صغيرة", "كبيرة أو متكررة"] },
      { name: "عدد تغيير الفوطة", options: ["1–2 يوميًا", "3–4 يوميًا", "5–6 يوميًا", "أكثر من 6 يوميًا", "أستخدم وسيلة أخرى"] },
      { name: "نوع وسيلة الحماية", options: ["فوط صحية", "سدادة قطنية", "كوب الحيض", "ملابس داخلية للدورة", "أكثر من وسيلة"] },
      { name: "العناية والنشاط", options: ["شرب ماء كافٍ", "راحة", "مشي خفيف", "كمادة دافئة", "تناولت مسكنًا بعد استشارة", "لم أقم بأي إجراء"] },
    ] },
  ];

  return (
    <div style={styles.container}>
      {prediction && (
        <div style={{ ...styles.card, padding: '14px', marginBottom: '12px' }} aria-label="ملخص الدورة والخصوبة">
          <div style={{ fontSize: '13px', fontWeight: '900', color: '#7A1746', marginBottom: '10px' }}>ملخص توقعاتك القادمة</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
            <div style={{ background: '#FFF0F3', padding: '12px', borderRadius: '15px', border: '1px solid #FFD1DF' }}>
              <div style={{ color: '#D81B60', fontSize: '12px', fontWeight: '800' }}>● الحيض القادم</div>
              <strong style={{ display: 'block', color: '#880E4F', fontSize: '15px', marginTop: '4px' }}>{prediction.nextDate}</strong>
            </div>
            <div style={{ background: '#F0FFF4', padding: '12px', borderRadius: '15px', border: '1px solid #C6F6D5' }}>
              <div style={{ color: '#2F855A', fontSize: '12px', fontWeight: '800' }}>● فترة الخصوبة</div>
              <strong style={{ display: 'block', color: '#22543D', fontSize: '14px', marginTop: '4px' }}>{prediction.fertility}</strong>
            </div>
          </div>
        </div>
      )}
      <PeriodClock
        startDate={data['سجل التواريخ_تاريخ البدء']}
        cycleDuration={data['سجل التواريخ_مدة الدورة']}
        periodDays={data['سجل التواريخ_مدة الحيض']}
        prediction={prediction}
      />

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1.5px solid #E91E63', color: '#E91E63', padding: '8px 20px', borderRadius: '15px', fontWeight: 'bold' }}>💬 استشارة رقة</button>
          <button onClick={() => setShowSavedList(!showSavedList)} style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '15px' }}>🔖 المحفوظات</button>
        </div>
        <button onClick={handleSaveAndAnalyze} style={styles.btnPrimary} disabled={loading}>
          {loading ? "جاري الحفظ والتحليل..." : "حفظ وتحليل طبي شامل ✨"}
        </button>
      </div>

      {showSavedList && (
        <div style={styles.card}>
          <h4 style={{ color: '#E91E63' }}>الردود المحفوظة</h4>
          {savedNotes.map(n => (
            <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
              {n.content.substring(0, 50)}...
              <button onClick={() => { setSavedNotes(savedNotes.filter(x => x.id !== n.id)) }} style={{ color: 'red', border: 'none', background: 'none', marginRight: '10px' }}>حذف</button>
            </div>
          ))}
        </div>
      )}

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{sec.emoji} {sec.title}</span>
            <span style={{ color: '#E91E63' }}>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map((field) => {
                const key = `${sec.title}_${field.name}`;
                const value = data[key];
                if (field.type === 'date') return (
                  <div key={field.name}>
                    <label style={{ fontSize: '11px', color: '#999' }}>{field.name}</label>
                    <input type="date" style={styles.input} value={value || ''} onChange={(e) => setData({ ...data, [key]: e.target.value })} />
                  </div>
                );
                return (
                  <fieldset key={field.name} style={{ gridColumn: '1 / -1', border: '1px solid #FFE0E8', borderRadius: 14, padding: '10px 12px', margin: 0 }}>
                    <legend style={{ padding: '0 5px', fontSize: '12px', color: '#880E4F', fontWeight: 'bold' }}>{field.name}</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8 }}>
                      {field.options.map((option) => {
                        const selected = Array.isArray(value) ? value.includes(option) : value === option;
                        return <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 9px', borderRadius: 10, background: selected ? '#FFF0F3' : '#FAFAFA', border: `1px solid ${selected ? '#E91E63' : '#EEE'}`, color: selected ? '#880E4F' : '#555', fontSize: 12, cursor: 'pointer' }}>
                          <input type="checkbox" checked={selected} onChange={() => toggleChoice(key, option, field.single)} style={{ accentColor: '#E91E63', width: 17, height: 17 }} />
                          <span>{option}</span>
                        </label>;
                      })}
                    </div>
                    {value && <div style={{ marginTop: 7, color: '#777', fontSize: 11 }}>المحدد: {displayValue(value)}</div>}
                  </fieldset>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {showChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '24px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة الذكية</span>
            <span style={{ fontSize: 12 }}>استشارة خاصة</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '15px', borderRadius: '20px', marginBottom: '15px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap',
                position: 'relative'
              }}>
                {msg.image && <img src={msg.image} alt="الصورة المرفقة" style={{ display: 'block', maxWidth: 200, maxHeight: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />}
                {msg.content}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '5px' }}>
                  <button onClick={() => deleteMessage(msg.id)} style={{ fontSize: '10px', color: msg.role === 'user' ? '#ffc1c1' : '#E91E63', background: 'none', border: 'none' }}>حذف 🗑️</button>
                  {msg.role === 'ai' && <button onClick={() => saveToNotes(msg)} style={{ fontSize: '10px', color: '#38A169', background: 'none', border: 'none' }}>حفظ 🔖</button>}
                </div>
              </div>
            ))}
            {loading && <p style={{ textAlign: 'center', color: '#E91E63' }}>جاري التفكير...</p>}
          </div>

          <div style={{ ...styles.chatBar, flexWrap: 'wrap' }}>
            <div style={{ flexBasis: '100%' }}>
              <ChatMediaControls imageData={chatImage} onImageSelected={setChatImage} onImageRemoved={() => setChatImage(null)}
                onTranscript={(text) => setChatInput((value) => `${value}${value ? ' ' : ''}${text}`)} disabled={loading} accent="#E91E63" />
            </div>
            <input
              style={styles.chatInput}
              placeholder="اسألي طبيبة رقة أي شيء..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            />
            <button onClick={handleSendMessage} style={styles.sendBtn}>🚀</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
