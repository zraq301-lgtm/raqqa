import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [pregnancyWeek, setPregnancyWeek] = useState(12);
  const [reminders, setReminders] = useState(JSON.parse(localStorage.getItem('reminders')) || []);
  
  // المداخلات كاملة (10 حقول لكل قسم)
  const categories = [
    { id: 'fetal', title: 'نمو الجنين', icon: <Activity />, fields: ['حركة الجنين', 'نبض القلب', 'الوزن التقديري', 'وضعية الجنين', 'السائل الأمينوسي', 'طول الفخذ', 'محيط الرأس', 'محيط البطن', 'التنفس الجنيني', 'حالة المشيمة'] },
    { id: 'mother', title: 'صحة الأم', icon: <Stethoscope />, fields: ['ضغط الدم', 'مستوى السكر', 'الوزن الحالي', 'الأعراض الشائعة', 'الحالة النفسية', 'درجة الحرارة', 'مستوى التورم', 'جودة النوم', 'النشاط البدني', 'معدل شرب الماء'] },
    { id: 'exams', title: 'الفحوصات', icon: <ClipboardList />, fields: ['تحليل الدم', 'فحص السكر', 'السونار', 'تحليل البول', 'فحوصات وراثية', 'فحص الغدة', 'نسبة الحديد', 'ضغط العين', 'تخطيط القلب', 'فحص عنق الرحم'] },
    { id: 'meds', title: 'سجل المكملات', icon: <Pill />, fields: ['حمض الفوليك', 'الحديد', 'الكالسيوم', 'فيتامين د', 'أوميغا 3', 'مغنيسيوم', 'فيتامين سي', 'بي 12', 'مكملات الغذاء', 'أدوية أخرى'] },
    { id: 'birth', title: 'الاستعداد للولادة', icon: <ShoppingBag />, fields: ['حقيبة المستشفى', 'خطة الولادة', 'تمارين التنفس', 'تجهيزات المولود', 'المستشفى', 'ملابس الأم', 'أوراق الثبوتية', 'مرافق الولادة', 'كرسي السيارة', 'ترتيبات المنزل'] },
    { id: 'weeks', title: 'تطور الأسابيع', icon: <Calendar />, fields: ['الأسبوع الحالي', 'أعراض الأسبوع', 'ملاحظات الطبيب', 'المراجعة القادمة', 'تاريخ الولادة', 'تغيرات الوزن', 'حجم الجنين', 'نصيحة الأسبوع', 'تطور الأعضاء', 'مهام الأسبوع'] },
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => state[cat.id] = Array(cat.fields.length).fill(''));
    return state;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // --- دوال الوسائط المضافة ---
  const handleMediaAction = async (type) => {
    try {
        // محاكاة جلب البيانات (يجب استبدال takePhoto و fetchImage بدوال الكاميرا الفعلية لديك)
        alert(`جاري فتح ${type === 'camera' ? 'الكاميرا' : 'المعرض'}...`);
        const base64Data = "data:image/png;base64,..."; // مثال

        if (!base64Data) return;

        const timestamp = Date.now();
        const fileName = `img_${timestamp}.png`;
        const mimeType = 'image/png';

        // الرفع إلى Vercel Blob (دالة افتراضية تبعا لطلبك)
        // const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);
        const finalAttachmentUrl = "https://vercel-blob-url.com/sample.png"; 

        console.log("تم الرفع بنجاح، الرابط:", finalAttachmentUrl);
        return finalAttachmentUrl;

    } catch (error) {
        console.error("فشل في معالجة أو رفع الصورة:", error);
        alert("حدث خطأ أثناء الوصول للوسائط.");
    }
  };

  // وظائف الاتصال والتحليل (تم تحديث الرابط لـ رقة HJL8)
  const saveToNeon = async (catTitle, aiReply) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catTitle, value: 'تقرير شامل', note: aiReply }
      });
    } catch (err) { console.error("Database Error", err); }
  };

  const runAiAnalysis = async (catIdx) => {
    const category = categories[catIdx];
    const dataString = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(' | ');
    if (!dataString) return;

    setLoading(true);
    setShowChat(true);

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          prompt: `أنتِ طبيبة خبيرة في الرشاقة، التخسيس، التغذية العلاجية، والرياضة للحوامل. حللي هذه البيانات لـ (${category.title}): ${dataString}. قدمي نصائح تركز على الوزن المثالي، النشاط البدني المناسب، والنظام الغذائي الصحي بأسلوب رقيق ومطمئن.` 
        }
      });
      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') };
      setChatHistory(prev => [newMsg, ...prev]);
      localStorage.setItem('preg_ai_v3', JSON.stringify([newMsg, ...chatHistory]));
      await saveToNeon(category.title, reply);
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      <style>{`
        .app-container { background-color: #FDF2F8; min-height: 100vh; padding: 20px; font-family: sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .ai-btn { background: #7C3AED; color: white; padding: 12px 18px; border-radius: 20px; border: none; font-weight: bold; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); cursor: pointer; }
        .title-group { text-align: right; color: #5B21B6; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px; }
        .feature-card { background: white; padding: 15px; border-radius: 20px; text-align: center; border: 1px solid #FBCFE8; }
        .week-num { font-size: 28px; font-weight: bold; color: #7C3AED; display: block; }
        .week-label { font-size: 11px; color: #9D174D; font-weight: bold; }
        .category-item { background: white; border-radius: 25px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.5); overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 18px 20px; border: none; background: none; }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .custom-input { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #F1F5F9; background: #F8FAFC; font-size: 12px; }
        .analyze-full-btn { grid-column: span 2; background: #7C3AED; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; margin-top: 5px; }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #7C3AED; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; background: #FDF2F8; }
        .msg-card { background: white; padding: 15px; border-radius: 20px 20px 0 20px; border: 1px solid #F1F5F9; margin-bottom: 15px; }
        .save-btn { background: #10B981; color: white; border: none; padding: 5px 10px; border-radius: 8px; font-size: 10px; display: flex; align-items: center; gap: 3px; }
      `}</style>

      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>
          <div style={{display:'flex', alignItems:'center', gap: '5px'}}>
            <MessageSquare size={18}/> <span>طبيبة رقة <br/> AI</span>
          </div>
        </button>
        <div className="title-group">
          <h1 style={{fontSize:'22px', margin:0}}>متابعة الحمل</h1>
          <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
             <h2 style={{fontSize:'22px', margin:0}}>الذكية</h2>
             <Plus size={24} style={{color:'#7C3AED', marginRight:'5px'}}/>
          </div>
        </div>
      </header>

      <div className="features-grid">
        <div className="feature-card">
          <span className="week-label">أنتِ الآن في</span>
          <span className="week-num">{pregnancyWeek}</span>
          <span className="week-label">الأسبوع</span>
          <input type="range" min="1" max="42" value={pregnancyWeek} onChange={(e)=>setPregnancyWeek(e.target.value)} style={{width:'100%', accentColor:'#7C3AED'}} />
        </div>
        <div className="feature-card" onClick={() => alert('سيتم تذكيرك بموعد الفحص القادم')}>
          <div style={{color:'#7C3AED', marginBottom:'5px'}}><Clock size={24} style={{margin:'0 auto'}}/></div>
          <span className="week-label">الموعد القادم</span>
          <div style={{fontSize:'12px', fontWeight:'bold', marginTop:'5px'}}>22 فبراير</div>
        </div>
      </div>

      <div className="category-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="category-item">
            <button className="category-header" onClick={() => setActiveTab(activeTab === index ? null : index)}>
              <div style={{color:'#7C3AED', transform: activeTab === index ? 'rotate(180deg)' : 'none'}}>▼</div>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={{fontWeight:'bold', color:'#5B21B6'}}>{cat.title}</span>
                <span style={{color:'#7C3AED'}}>{cat.icon}</span>
              </div>
            </button>
            <AnimatePresence>
              {activeTab === index && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{overflow:'hidden'}}>
                  <div className="inputs-container">
                    {cat.fields.map((field, idx) => (
                      <input key={idx} className="custom-input" placeholder={field} value={inputs[cat.id][idx]} onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)} />
                    ))}
                    <button className="analyze-full-btn" onClick={() => runAiAnalysis(index)}>
                      <Sparkles size={16} style={{display:'inline', marginLeft:'5px'}}/> {loading ? 'جاري التحليل...' : 'تحليل الرشاقة وحفظ'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* شاشة الشات المحدثة */}
      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={28}/></button>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:'bold'}}>طبيبة رقة: رشاقة وتغذية</div>
                <div style={{fontSize:'10px', opacity:0.8}}>تخصص تغذية، رياضة، ورشاقة الحمل</div>
              </div>
              <button onClick={() => { if(confirm('حذف كل الردود؟')) setChatHistory([]); }} style={{background:'rgba(0,0,0,0.1)', border:'none', color:'white', padding:'8px', borderRadius:'10px'}}><Trash2 size={20}/></button>
            </div>

            <div className="chat-body">
              {loading && <div style={{textAlign:'center', padding:'20px', color:'#7C3AED', fontWeight:'bold'}}>انتظري، طبيبة التغذية تراجع بياناتك...</div>}
              {chatHistory.map(msg => (
                <div key={msg.id} className="msg-card">
                  <div style={{fontSize:'10px', color:'#7C3AED', fontWeight:'bold', marginBottom:'5px'}}>تحليل: {msg.query}</div>
                  <p style={{fontSize:'13px', lineHeight:'1.5', color:'#475569', whiteSpace:'pre-wrap'}}>{msg.reply}</p>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:'12px', borderTop:'1px solid #F1F5F9', paddingTop:'8px'}}>
                    <div style={{display:'flex', gap:'10px'}}>
                      <button className="save-btn" onClick={() => alert('تم الحفظ في المفضلة')}><Bookmark size={12}/> حفظ</button>
                      <button onClick={() => setChatHistory(prev => prev.filter(m => m.id !== msg.id))} style={{background:'none', border:'none', color:'#F87171'}}><Trash2 size={14}/></button>
                    </div>
                    <span style={{fontSize:'10px', color:'#94A3B8'}}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{padding:'20px', borderTop:'1px solid #F1F5F9', display:'flex', gap:'10px'}}>
              <button className="ai-btn" style={{padding:'10px'}} onClick={()=>handleMediaAction('camera')}><Camera size={20}/></button>
              <button className="ai-btn" style={{padding:'10px'}} onClick={()=>handleMediaAction('gallery')}><ImageIcon size={20}/></button>
              <div style={{flex:1, background:'#F8FAFC', borderRadius:'15px', display:'flex', alignItems:'center', fontSize:'11px', color:'#94A3B8', border:'1px solid #E2E8F0', padding:'0 15px'}}>اسألي عن التغذية أو الرياضة...</div>
              <button className="ai-btn" style={{padding:'10px'}}><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
