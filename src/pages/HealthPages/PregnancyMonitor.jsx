import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

[cite_start]// استيراد الدوال من مسار الميديا المذكور [cite: 3]
import { takePhoto, fetchImage, uploadToVercel } from '../services/MediaService';

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [savedNotes, setSavedNotes] = useState(JSON.parse(localStorage.getItem('preg_saved_notes')) || []);
  const [pregnancyWeek, setPregnancyWeek] = useState(12);
  const [userInput, setUserInput] = useState('');

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

  // حفظ الرد في المفضلة
  const saveToFavorites = (msg) => {
    const newSaved = [msg, ...savedNotes];
    setSavedNotes(newSaved);
    localStorage.setItem('preg_saved_notes', JSON.stringify(newSaved));
    alert("تم الحفظ في قائمة المفضلة");
  };

  // دالة الرفع والمعالجة المشتركة (للكاميرا والاستوديو)
  const processMediaUpload = async (mediaSourceFunc) => {
    try {
      const base64Data = await mediaSourceFunc();
      if (!base64Data) return;

      setIsProcessing(true);
      setShowChat(true);
      
      const userMsgId = Date.now();
      const tempMsg = { 
        id: userMsgId, 
        query: "تحليل وسائط", 
        reply: "جاري رفع الملف وتحليله طبياً...", 
        time: new Date().toLocaleTimeString('ar-SA') 
      };
      setChatHistory(prev => [tempMsg, ...prev]);

      const fileName = `med_${userMsgId}.png`;
      const mimeType = 'image/png';

      // الرفع إلى Vercel باستخدام الرابط المحدد في MediaService
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا طبيب نساء وتوليد خبير. كأنثى مسلمة، مرفق رابط الصورة للتحليل الطبي: ${finalAttachmentUrl}. قدم نصيحة طبية دقيقة بخصوص هذا المستند أو الصورة.` 
        }
      });

      if (response.status === 200) {
        const aiReply = response.data.reply || "تم استلام الصورة ومعالجتها طبياً.";
        const finalMsg = { id: Date.now(), query: "تحليل صورة", reply: aiReply, time: new Date().toLocaleTimeString('ar-SA') };
        setChatHistory(prev => [finalMsg, ...prev.filter(m => m.id !== userMsgId)]);
      }
    } catch (error) {
      console.error("خطأ الوسائط:", error);
      alert("حدث خطأ أثناء معالجة الصورة.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim()) return;

    setLoading(true);
    setShowChat(true);
    setUserInput('');

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          prompt: `أنتِ طبيب نساء وتوليد خبير. أجيبي على هذا الاستفسار الطبي: ${textToSend}. بأسلوب مهني ومطمئن.` 
        }
      });

      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: "استفسار مباشر", reply, time: new Date().toLocaleTimeString('ar-SA') };
      
      const updatedHistory = [newMsg, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('preg_ai_v3', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setLoading(false);
    }
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
          prompt: `أنتِ طبيب نساء وتوليد خبير. حللي هذه البيانات لـ (${category.title}): ${dataString}. قدمي نصائح طبية دقيقة.` 
        }
      });
      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') };
      
      const updatedHistory = [newMsg, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('preg_ai_v3', JSON.stringify(updatedHistory));
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      <style>{`
        .app-container { background-color: #FDF2F8; min-height: 100vh; padding: 20px; font-family: sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .ai-btn { background: #7C3AED; color: white; padding: 12px; border-radius: 15px; border: none; cursor: pointer; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px; }
        .feature-card { background: white; padding: 15px; border-radius: 20px; text-align: center; border: 1px solid #FBCFE8; }
        .category-item { background: white; border-radius: 25px; margin-bottom: 15px; overflow: hidden; }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 18px 20px; border: none; background: none; }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .custom-input { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #F1F5F9; background: #F8FAFC; font-size: 12px; }
        .analyze-full-btn { grid-column: span 2; background: #7C3AED; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #7C3AED; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; background: #FDF2F8; }
        .msg-card { background: white; padding: 15px; border-radius: 20px 20px 0 20px; border: 1px solid #F1F5F9; margin-bottom: 15px; }
        .save-btn { background: #10B981; color: white; border: none; padding: 5px 10px; border-radius: 8px; font-size: 10px; display: flex; align-items: center; gap: 3px; cursor: pointer; }
        .prompt-container { padding: 15px; border-top: 1px solid #F1F5F9; background: white; }
        .input-wrapper { display: flex; gap: 8px; background: #F8FAFC; padding: 8px; border-radius: 20px; border: 1px solid #E2E8F0; }
        .chat-input { flex: 1; border: none; background: transparent; padding: 8px; outline: none; font-size: 13px; }
      `}</style>

      {/* Header & Stats */}
      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>
          <MessageSquare size={20}/>
        </button>
        <div style={{textAlign:'right'}}>
          <h1 style={{fontSize:'20px', color:'#5B21B6', margin:0}}>متابعة الحمل الذكية <Plus size={18} style={{display:'inline'}}/></h1>
        </div>
      </header>

      <div className="features-grid">
        <div className="feature-card">
          <span style={{fontSize:'12px', color:'#9D174D'}}>الأسبوع الحالي</span>
          <span style={{display:'block', fontSize:'24px', fontWeight:'bold', color:'#7C3AED'}}>{pregnancyWeek}</span>
          <input type="range" min="1" max="42" value={pregnancyWeek} onChange={(e)=>setPregnancyWeek(e.target.value)} style={{width:'100%', accentColor:'#7C3AED'}} />
        </div>
        <div className="feature-card">
          <Clock size={20} style={{margin:'0 auto', color:'#7C3AED'}}/>
          <span style={{fontSize:'12px', color:'#9D174D'}}>الموعد القادم</span>
          <div style={{fontSize:'13px', fontWeight:'bold'}}>22 فبراير</div>
        </div>
      </div>

      {/* Categories List */}
      <div className="category-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="category-item">
            <button className="category-header" onClick={() => setActiveTab(activeTab === index ? null : index)}>
              <ChevronRight size={20} style={{transform: activeTab === index ? 'rotate(90deg)' : 'none', transition:'0.3s'}}/>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={{fontWeight:'bold', color:'#5B21B6'}}>{cat.title}</span>
                {cat.icon}
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
                      <Sparkles size={16} style={{marginLeft:'5px'}}/> {loading ? 'جاري التحليل...' : 'تحليل وحفظ'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Chat Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={28}/></button>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:'bold'}}>طبيب النساء الذكي</div>
                <div style={{fontSize:'10px', opacity:0.8}}>مساعدك الطبي المتكامل</div>
              </div>
              <button onClick={() => { if(window.confirm('مسح السجل؟')) setChatHistory([]); }} style={{background:'rgba(0,0,0,0.2)', border:'none', color:'white', padding:'8px', borderRadius:'10px'}}><Trash2 size={18}/></button>
            </div>

            <div className="chat-body">
              {(loading || isProcessing) && (
                <div style={{textAlign:'center', padding:'20px', color:'#7C3AED'}}>
                  <Sparkles className="animate-spin" style={{margin:'0 auto'}}/>
                  <p>جاري معالجة طلبك...</p>
                </div>
              )}
              
              {chatHistory.map(msg => (
                <div key={msg.id} className="msg-card">
                  <div style={{fontSize:'10px', color:'#7C3AED', fontWeight:'bold', marginBottom:'5px'}}>{msg.query}</div>
                  <p style={{fontSize:'13px', lineHeight:'1.5', color:'#475569', whiteSpace:'pre-wrap'}}>{msg.reply}</p>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:'12px', borderTop:'1px solid #F1F5F9', paddingTop:'8px'}}>
                    <div style={{display:'flex', gap:'10px'}}>
                      <button className="save-btn" onClick={() => saveToFavorites(msg)}><Bookmark size={12}/> حفظ</button>
                      <button onClick={() => setChatHistory(prev => prev.filter(m => m.id !== msg.id))} style={{background:'none', border:'none', color:'#F87171'}}><Trash2 size={14}/></button>
                    </div>
                    <span style={{fontSize:'10px', color:'#94A3B8'}}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="prompt-container">
              <div className="input-wrapper">
                <button onClick={() => processMediaUpload(takePhoto)} style={{color:'#7C3AED', background:'none', border:'none'}}><Camera size={20}/></button>
                <button onClick={() => processMediaUpload(fetchImage)} style={{color:'#7C3AED', background:'none', border:'none'}}><ImageIcon size={20}/></button>
                <input 
                  className="chat-input" 
                  placeholder="اسألي طبيب النساء عن أي شيء..." 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={() => handleSendMessage()} style={{background:'#7C3AED', color:'white', border:'none', borderRadius:'50%', padding:'8px'}}>
                  <Send size={18}/>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
