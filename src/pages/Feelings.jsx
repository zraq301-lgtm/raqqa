import { publicAiPost } from '../services/apiClient';
import { apiUrl } from '../config/apiConfig';
import React, { useState } from 'react';
import {
  Sparkles, Heart, Moon, BookOpen, Activity, Cloud, CloudRain, Flame, BatteryLow,
  ShieldCheck, Users, ShieldAlert, Wind, Gift,
  Clock, Brain, Flower2, Coins, Hourglass, Sun,
  Camera, Mic, Image, Trash2, X, MapPin, Smile, Send, Stethoscope
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمات الميديا من المسار المحدد
import { persistAiHealthRecord, persistAiScheduledNotification } from '../services/profileApi';
import ChatMediaControls from '../components/ChatMediaControls';
import PublishedPageContent from '../components/PublishedPageContent';

const RaqqaFeelingsApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // سجل الردود
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [activeMood, setActiveMood] = useState(null);

  // --- الدالة المحدثة لجدولة الإشعارات المحلية مع دعم الصور ---
  const handleSaveAndAnalysis = async (aiGeneratedReport, categoryTitle) => {
    try {
      // إعداد وقت الموعد (بعد 72 ساعة)
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 72);
      await persistAiHealthRecord('feelings', { category: categoryTitle, inputs, aiReport: aiGeneratedReport });

      // 1. إعداد نص الإشعار الفوري للتأكيد
      const instantConfirm = {
        id: Math.floor(Math.random() * 10000),
        title: "✅ تم حفظ بياناتك بشكل آمن",
        body: `لقد تم تحليل مشاعرك بخصوص ${categoryTitle} وحفظ التقرير، سنقوم بتذكيرك لاحقاً.`,
        scheduled_for: new Date(Date.now() + 500).toISOString(),
      };

      // 2. إعداد إشعار الموعد المخصص (تمت إضافة خصائص الصورة هنا)
      const aiReportNotification = {
        id: Math.floor(Math.random() * 10000),
        title: `✨ تقرير رقة الذكي: ${categoryTitle}`,
        body: aiGeneratedReport.substring(0, 150) + "...",
        scheduled_for: scheduledTime.toISOString(),

        // --- خصائص ظهور الصورة في أندرويد ---
        smallIcon: "ic_stat_name", // اسم الأيقونة في نظام أندرويد
        largeIcon: "res://public/notifications/feelings.png", // مسار الصورة الكبيرة

        extra: { report: aiGeneratedReport }
      };

      // 3. الحفظ المحلي في المصفوفة الموحدة (raqqa_local_reminders)
      const existingReminders = JSON.parse(localStorage.getItem('raqqa_local_reminders') || '[]');
      const updatedReminders = [...existingReminders, instantConfirm, aiReportNotification];
      localStorage.setItem('raqqa_local_reminders', JSON.stringify(updatedReminders));

      // 4. إطلاق إشارة التفعيل لملف App.jsx
      window.dispatchEvent(new Event('trigger_sync_notifications'));
      await persistAiScheduledNotification({ category: 'feelings', title: `تذكير المشاعر: ${categoryTitle}`, body: 'راجعي تسجيلك السابق واكتبي ما تشعرين به اليوم.', scheduled_for: scheduledTime.toISOString() });

      console.log("🚀 تم الحفظ محلياً مع إعدادات الصورة");

    } catch (error) {
      console.error("خطأ في عملية الحفظ والجدولة المحلية:", error);
    }
  };

  const categories = [
    { id: 1, title: "المشاعر الإيمانية", icon: <Sparkles />, items: ["لذة المناجاة 🤲", "خشوع الصلاة ✨", "طمأنينة الذكر 📿", "حلاوة الإيمان 🍯", "الرضا بالقضاء ✅", "حسن الظن بالله 🌈"] },
    { id: 2, title: "المشاعر الهرمونية", icon: <Activity />, items: ["تقلبات المزاج 🎢", "وهن جسدي 💤", "حساسية مفرطة 🌸", "طاقة الصيام 🌙", "نشاط الفجر ☀️"] },
    { id: 3, title: "العلاقات والود", icon: <Heart />, items: ["بر الوالدين 🌳", "موعة الزوج ❤️", "رحمة الأبناء 🐣", "صلة الرحم 🔗", "الحب في الله 🫂"] },
    { id: 4, title: "الذات والنمو", icon: <Brain />, items: ["فخر بالحجاب 🧕", "استحقاق الذات 👑", "جهاد النفس ⚔️", "رغبة في الأثر 🍃", "توبة نصوح ✨"] },
    { id: 5, title: "الضغوط والابتلاءات", icon: <ShieldAlert />, items: ["صبر جميل 💎", "اختناق التوقعات 🌪️", "ضغط مجتمعي 👁️", "ثقل الأمانة 🎒"] },
    { id: 6, title: "النضج والوقار", icon: <Hourglass />, items: ["قبول الشيب 🕰️", "وقار الحكمة 💎", "زهد في الدنيا 🍃", "طمأنينة الختام 🌅"] },
    { id: 7, title: "المخاوف والظلال", icon: <ShieldCheck />, items: ["خوف سوء الخاتمة ⌛", "قلق على الأبناء 🧒", "رهبة القبر 🌑", "وساوس النفس 💭"] },
    { id: 8, title: "التعافي والترميم", icon: <Wind />, items: ["جبر القلوب 🩹", "مداواة الندبات 🧩", "انشراح الصدر 🌬️", "استشفاء بالقرآن 📖"] },
    { id: 9, title: "الطفلة الداخلية", icon: <Smile />, items: ["براءة الفطرة 🍭", "فضول المعرفة 🎈", "دهشة الخلق 🌟", "حاجة للأمان 🧸"] },
    { id: 10, title: "الإنجاز والعمل", icon: <Clock />, items: ["بركة الوقت ⏳", "إتقان العمل 🎯", "فرحة الإنجاز 🏆", "نفع الناس 🤝"] }
  ];

  const moodGroups = [
    {
      id: 'support',
      title: 'مشاعر تحتاج إلى رفق',
      hint: 'اختاري الشعور الأقرب لما تمرّين به الآن',
      moods: [
        { id: 'anxiety', name: 'قلق', icon: <Cloud size={24} /> },
        { id: 'sadness', name: 'حزن', icon: <CloudRain size={24} /> },
        { id: 'anger', name: 'غضب', icon: <Flame size={24} /> },
        { id: 'tension', name: 'توتر', icon: <Wind size={24} /> },
        { id: 'loneliness', name: 'وحدة', icon: <Moon size={24} /> },
        { id: 'exhaustion', name: 'إرهاق', icon: <BatteryLow size={24} /> },
      ],
    },
    {
      id: 'nurture',
      title: 'مشاعر جميلة نحب تعزيزها',
      hint: 'اختاري شعورًا جميلًا لنساعدكِ على تنميته',
      moods: [
        { id: 'joy', name: 'فرح', icon: <Sun size={24} /> },
        { id: 'calm', name: 'طمأنينة', icon: <Flower2 size={24} /> },
        { id: 'gratitude', name: 'امتنان', icon: <Sparkles size={24} /> },
        { id: 'love', name: 'محبة', icon: <Heart size={24} /> },
        { id: 'hope', name: 'أمل', icon: <Smile size={24} /> },
        { id: 'confidence', name: 'ثقة', icon: <ShieldCheck size={24} /> },
      ],
    },
  ];

  const handleProcess = async (customPrompt = null, imageOverride = undefined) => {
    setLoading(true);
    setShowChat(true);

    const isFromInputs = !customPrompt;
    const imageToAnalyze = imageOverride === undefined ? uploadedImageUrl : imageOverride;

    const summary = Object.entries(inputs)
      .filter(([k, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const currentCategory = activeTab?.title || "العام";
    let finalPrompt = customPrompt ||
      `أنا أنثى مسلمة، أشعر في قسم ${currentCategory} بالآتي: (${summary}).
      حللي مشاعري بأسلوب يجمع بين "طب المشاعر" والعمق النفسي التحليلي.
      قدمي نصائح عملية (Somatic tracking) وتوجيهات لترميم الذات، مع ذكر آية أو حديث يربط الجانب النفسي بالإيماني.`;

    if (imageToAnalyze) {
      finalPrompt += ' (أرفقت صورة مع السؤال؛ افحصيها ضمن حدود المعلومات العامة.)';
    }

    try {
      const options = {
        url: apiUrl('api/ai'),
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: finalPrompt, image: imageToAnalyze || undefined }
      };

      const response = await publicAiPost(options);
      const responseText = response.data.reply || response.data.message || "شكراً لمشاركتكِ مشاعركِ يا رفيقتي.";

      setAiResponse(responseText);
      setHistory(prev => [responseText, ...prev]);
      setUploadedImageUrl(null);

      if (isFromInputs) {
        await handleSaveAndAnalysis(responseText, currentCategory);
      }

    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("تعذر تقديم الإجابة الآن. تحققي من اتصالك بالإنترنت وحاولي مرة أخرى يا رفيقتي 🌸");
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelection = (mood, groupId) => {
    setActiveMood(mood);
    setShowMoodPicker(false);
    setActiveTab(null);
    setInputs({});
    setChatInput('');
    setUploadedImageUrl(null);
    const goal = groupId === 'support'
      ? 'قدمي احتواءً لطيفًا وخطوة عملية واحدة صغيرة تساعدني على تهدئة هذا الشعور أو التعامل معه الآن.'
      : 'قدمي اقتراحًا بسيطًا يساعدني على تنمية هذا الشعور الجميل والاحتفاظ به في يومي.';
    const prompt = `أشعر الآن بـ"${mood.name}". ${goal} أجيبي بالعربية وبصيغة مخاطبة مؤنثة، في نصيحة قصيرة لا تتجاوز ثلاث جمل. كوني رحيمة وعملية، ولا تقدمي تشخيصًا طبيًا أو وعودًا قاطعة.`;
    handleProcess(prompt, null);
  };

  const handleChatSend = () => {
    const message = chatInput.trim();
    if (!message && !uploadedImageUrl) return;
    setChatInput('');
    handleProcess(message || 'حللي الصورة المرفقة من فضلك.');
  };

  const deleteHistoryItem = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
  };

  const handleFeatureNotImplemented = (feature) => {
    alert(`خاصية ${feature} ستكون متاحة قريبًا بإذن الله ✨`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>
        <p style={styles.subtitle}>محلل مشاعر المرأة المسلمة الشامل</p>

        <button
          style={styles.doctorBtn}
          onClick={() => { setActiveMood(null); setShowChat(true); setAiResponse("أهلاً بكِ في عيادة رقة النفسية.. كيف تشعرين اليوم؟"); }}
        >
          <Stethoscope size={20} /> تحدثي مع طبيب المشاعر الذكي
        </button>
        <button type="button" style={styles.moodPickerBtn} onClick={() => setShowMoodPicker(true)}>
          <Heart size={20} /> اختاري شعورك الآن
        </button>
      </header>

      <PublishedPageContent pageNames={['المشاعر']} title="محتوى المشاعر المنشور" />

      {showMoodPicker && !showChat && (
        <div style={styles.moodOverlay} role="dialog" aria-modal="true" aria-labelledby="mood-picker-title">
          <div style={styles.moodPanel}>
            <div style={styles.moodHeader}>
              <div>
                <h2 id="mood-picker-title" style={styles.moodTitle}>ما الشعور الأقرب إليكِ؟</h2>
                <p style={styles.moodIntro}>اختاريه، وسنشارككِ نصيحة قصيرة تناسبه.</p>
              </div>
              <button type="button" style={styles.closeMoodPicker} onClick={() => setShowMoodPicker(false)} aria-label="إغلاق اختيار المشاعر">
                <X size={22} />
              </button>
            </div>
            {moodGroups.map((group) => (
              <section key={group.id} style={styles.moodGroup}>
                <h3 style={styles.moodGroupTitle}>{group.title}</h3>
                <p style={styles.moodGroupHint}>{group.hint}</p>
                <div style={styles.moodGrid}>
                  {group.moods.map((mood) => (
                    <button
                      key={mood.id}
                      type="button"
                      style={styles.moodCard}
                      onClick={() => handleMoodSelection(mood, group.id)}
                      aria-label={`اختيار شعور ${mood.name}`}
                    >
                      <span style={styles.moodIcon}>{mood.icon}</span>
                      <span style={styles.moodName}>{mood.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {!activeTab && (
        <div style={styles.grid}>
          {categories.map(cat => (
            <div key={cat.id} style={styles.iconCard} onClick={() => setActiveTab(cat)}>
              <div style={styles.iconLarge}>{cat.icon}</div>
              <span style={styles.iconTitle}>{cat.title}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab && !showChat && (
        <div style={styles.fullOverlay}>
          <div style={styles.activeContent}>
            <div style={styles.cardHeader}>
              <h2 style={{color: '#f06292'}}>{activeTab.title}</h2>
              <X style={{cursor: 'pointer'}} onClick={() => {setActiveTab(null); setInputs({});}} />
            </div>

            <div style={styles.scrollableInputList}>
              {activeTab.items.map((item, idx) => (
                <div key={idx} style={styles.inputRowFull}>
                  <label style={styles.label}>{item}</label>
                  <input
                    style={styles.inputField}
                    placeholder="صفي شعورك بعمق..."
                    value={inputs[item] || ""}
                    onChange={(e) => setInputs({...inputs, [item]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <button
              style={styles.actionBtn}
              onClick={() => handleProcess()}
              disabled={loading || Object.keys(inputs).length === 0}
            >
              {loading ? "جاري التحليل النفسي العميق..." : "تحليل المشاعر بالذكاء الصناعي ✨"}
            </button>
          </div>
        </div>
      )}

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Sparkles color="#f06292" size={20} />
                <h3 style={{margin: 0, color: '#f06292', fontSize: '1.1rem'}}>{activeMood ? `نصيحة لشعور ${activeMood.name}` : 'محراب رقة للدردشة'}</h3>
              </div>
              <X style={{cursor: 'pointer'}} onClick={() => setShowChat(false)} />
            </div>

            <div style={styles.chatBody}>
              {loading ? (
                <div style={styles.loadingPulse}>جاري استحضار الإجابة الإيمانية والنفسية...</div>
              ) : (
                <>
                  <div style={styles.responseBox}>
                    <p style={{whiteSpace: 'pre-wrap'}}>{aiResponse}</p>
                    {uploadedImageUrl && <p style={{fontSize: '0.7rem', color: '#f06292'}}>تم إرفاق صورة 🖼️</p>}
                  </div>

                  {history.length > 0 && (
                    <div style={styles.historySection}>
                      <h4 style={styles.historyTitle}>سجل الاستشفاء والردود:</h4>
                      {history.map((h, i) => (
                        <div key={i} style={styles.historyItem}>
                          <div style={{flex: 1}}>{h.substring(0, 90)}...</div>
                          <Trash2
                            size={18}
                            style={{color: '#ff8aae', cursor: 'pointer', marginRight: '10px'}}
                            onClick={() => deleteHistoryItem(i)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={styles.chatFooter}>
              <div style={styles.inputWrapper}>
                <input
                  style={styles.mainChatInput}
                  placeholder="اسألي رقة عن أي وجع أو شعور..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSend())}
                />
                <button
                  style={styles.sendBtn}
                  onClick={handleChatSend}
                  disabled={loading}
                >
                  <Send size={20} />
                </button>
              </div>

              <div style={styles.chatToolbar}>
                <ChatMediaControls imageData={uploadedImageUrl} onImageSelected={setUploadedImageUrl} onImageRemoved={() => setUploadedImageUrl(null)}
                  onTranscript={(text) => setChatInput((value) => `${value}${value ? ' ' : ''}${text}`)} disabled={loading} accent="#f06292" />
                <button style={styles.toolBtnChat} onClick={() => {setHistory([]); setAiResponse("تم مسح السجل بنجاح.");}} title="مسح السجل"><Trash2 size={22}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.azharBtn}>
        <MapPin size={20} /> اسألي الأزهر
      </a>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(to bottom, #fdf2f8, #ffffff)', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { fontSize: '2.5rem', color: '#f06292', marginBottom: '5px' },
  subtitle: { color: '#888', fontStyle: 'italic', marginBottom: '15px' },
  doctorBtn: { background: '#f06292', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(240,98,146,0.3)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', maxWidth: '1000px', margin: '0 auto' },
  iconCard: { background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(240,98,146,0.1)', transition: '0.3s' },
  iconLarge: { fontSize: '1.8rem', color: '#f06292', marginBottom: '10px' },
  iconTitle: { fontWeight: 'bold', color: '#444', fontSize: '0.9rem' },
  moodPickerBtn: { marginTop: '12px', background: '#fff', color: '#d74781', border: '1px solid #f4c6d5', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(240,98,146,0.12)' },
  moodOverlay: { position: 'fixed', inset: 0, background: 'rgba(61,29,44,0.48)', zIndex: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', direction: 'rtl' },
  moodPanel: { width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '26px', padding: '24px', boxShadow: '0 24px 60px rgba(80,30,54,0.2)' },
  moodHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '22px' },
  moodTitle: { margin: '0 0 6px', color: '#713b55', fontSize: '1.35rem' },
  moodIntro: { margin: 0, color: '#8b7781', fontSize: '0.95rem' },
  closeMoodPicker: { width: '40px', height: '40px', flexShrink: 0, border: 'none', borderRadius: '50%', background: '#fff2f7', color: '#c64e7b', cursor: 'pointer', display: 'grid', placeItems: 'center' },
  moodGroup: { marginTop: '20px' },
  moodGroupTitle: { margin: '0 0 5px', color: '#713b55', fontSize: '1rem' },
  moodGroupHint: { margin: '0 0 12px', color: '#9b8991', fontSize: '0.82rem' },
  moodGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '10px' },
  moodCard: { minHeight: '104px', border: '1px solid #f6e2ea', borderRadius: '18px', background: 'linear-gradient(160deg, #fff 0%, #fff8fb 100%)', color: '#59434e', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', fontFamily: 'inherit', transition: 'transform 0.18s ease, box-shadow 0.18s ease' },
  moodIcon: { width: '48px', height: '48px', borderRadius: '50%', background: '#ffedf4', color: '#d85888', display: 'grid', placeItems: 'center' },
  moodName: { fontSize: '0.9rem', fontWeight: 'bold' },
  fullOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' },
  activeContent: { width: '100%', maxWidth: '500px', maxHeight: '90vh', background: 'white', borderRadius: '25px', padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  scrollableInputList: { flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' },
  inputRowFull: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
  label: { fontSize: '0.85rem', color: '#f06292', marginBottom: '6px', fontWeight: 'bold' },
  inputField: { padding: '12px', borderRadius: '12px', border: '1px solid #fce4ec', background: '#fff9f9', outline: 'none' },
  actionBtn: { width: '100%', padding: '14px', borderRadius: '50px', border: 'none', background: '#f06292', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column' },
  chatContainer: { height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', width: '100%' },
  chatHeader: { padding: '15px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '20px', background: '#fcfcfc' },
  responseBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(240,98,146,0.1)', borderRight: '5px solid #f06292', color: '#444', lineHeight: '1.8' },
  chatFooter: { padding: '15px 20px', borderTop: '1px solid #f5f5f5', background: 'white' },
  inputWrapper: { display: 'flex', gap: '10px', marginBottom: '15px' },
  mainChatInput: { flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #eee', outline: 'none', background: '#f9f9f9' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatToolbar: { display: 'flex', gap: '25px', justifyContent: 'center' },
  toolBtnChat: { background: 'none', border: 'none', color: '#f06292', cursor: 'pointer', opacity: 0.8 },
  historySection: { marginTop: '30px', borderTop: '1px dashed #eee', paddingTop: '20px' },
  historyTitle: { color: '#f06292', fontSize: '0.9rem', marginBottom: '12px' },
  historyItem: { display: 'flex', alignItems: 'center', padding: '12px', background: '#fff', borderRadius: '12px', marginBottom: '10px', fontSize: '0.8rem', color: '#777', border: '1px solid #f9f9f9' },
  loadingPulse: { textAlign: 'center', padding: '40px', color: '#f06292', fontWeight: 'bold' },
  azharBtn: { position: 'fixed', bottom: '20px', left: '20px', background: '#00897b', color: 'white', padding: '12px 20px', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 101, fontSize: '0.9rem' }
};

export default RaqqaFeelingsApp;
