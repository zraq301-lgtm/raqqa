import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v2')) || []);

  // 1. القوائم (HTML Structure Data) [cite: 5, 7]
  const categories = [
    { id: 'fetal', title: 'نمو الجنين', icon: <Activity />, fields: ['حركة الجنين', 'نبض القلب', 'الوزن التقديري', 'وضعية الجنين', 'السائل الأمينوسي'] },
    { id: 'mother', title: 'صحة الأم', icon: <Stethoscope />, fields: ['ضغط الدم', 'مستوى السكر', 'الوزن الحالي', 'الأعراض الشائعة', 'الحالة النفسية'] },
    { id: 'exams', title: 'الفحوصات', icon: <ClipboardList />, fields: ['تحليل الدم', 'فحص السكر', 'السونار', 'تحليل البول', 'فحوصات وراثية'] },
    { id: 'meds', title: 'سجل المكملات', icon: <Pill />, fields: ['حمض الفوليك', 'الحديد', 'الكالسيوم', 'فيتامين د', 'أوميغا 3'] },
    { id: 'birth', title: 'الاستعداد للولادة', icon: <ShoppingBag />, fields: ['حقيبة المستشفى', 'خطة الولادة', 'تمارين التنفس', 'تجهيزات المولود', 'المستشفى'] },
    { id: 'weeks', title: 'تطور الأسابيع', icon: <Calendar />, fields: ['الأسبوع الحالي', 'أعراض الأسبوع', 'ملاحظات الطبيب', 'المراجعة القادمة', 'تاريخ الولادة'] },
  ];

  // 2. إدارة المدخلات [cite: 8, 9]
  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => state[cat.id] = Array(cat.fields.length).fill(''));
    return state;
  });

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // 3. وظائف الاتصال الخارجي (CapacitorHttp) [cite: 3, 10, 14]
  const saveToNeon = async (catTitle, aiReply) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catTitle, value: 'تقرير طبي', note: aiReply }
      });
    } catch (err) { console.error("Neon DB Error", err); }
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
          prompt: `أنتِ طبيبة نساء وتوليد متخصصة. حللي بيانات (${category.title}): ${dataString}. ردي بتقرير موسع، دافئ، ومفصل طبيًا.` 
        }
      });
      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') };
      setChatHistory(prev => {
        const updated = [newMsg, ...prev];
        localStorage.setItem('preg_ai_v2', JSON.stringify(updated));
        return updated;
      });
      await saveToNeon(category.title, reply);
    } catch (err) { console.error("AI Error", err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      {/* CSS Styles [Visual Mapping from Screenshot] */}
      <style>{`
        .app-container { background-color: #FDF2F8; min-height: 100vh; padding: 20px; font-family: sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; margin-top: 15px; }
        .ai-btn { background-color: #7C3AED; color: white; padding: 12px 18px; border-radius: 20px; border: none; font-weight: bold; font-size: 13px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
        .title-group { text-align: right; color: #5B21B6; }
        .title-group h1 { font-size: 24px; margin: 0; }
        .category-list { display: flex; flex-direction: column; gap: 15px; }
        .category-item { background: white; border-radius: 25px; overflow: hidden; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .category-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border: none; background: none; cursor: pointer; }
        .category-header span { color: #5B21B6; font-weight: bold; font-size: 17px; }
        .icon-box { color: #7C3AED; display: flex; align-items: center; gap: 10px; }
        .inputs-container { padding: 0 20px 20px 20px; display: flex; flex-direction: column; gap: 10px; }
        .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #F1F5F9; background: #F8FAFC; font-size: 14px; outline: none; }
        .analyze-btn { background: #7C3AED; color: white; border: none; padding: 14px; border-radius: 15px; font-weight: bold; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #7C3AED; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 0 0 30px 30px; }
        .history-list { flex: 1; overflow-y: auto; padding: 20px; }
        .chat-card { background: #F8FAFC; border-radius: 25px 25px 0 25px; padding: 20px; margin-bottom: 20px; border: 1px solid #E2E8F0; }
        .chat-footer { padding: 20px; border-top: 1px solid #F1F5F9; display: flex; gap: 10px; align-items: center; }
        .tool-btn { width: 45px; height: 45px; border-radius: 15px; border: none; background: #F1F5F9; color: #64748B; display: flex; align-items: center; justify-content: center; }
      `}</style>

      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>تحليل الطبيب <br/> AI</button>
        <div className="title-group">
          <h1>متابعة الحمل</h1>
          <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
             <h1 style={{marginTop:'-5px'}}>الذكية</h1>
             <Plus size={24} style={{color:'#7C3AED', marginRight:'5px'}}/>
          </div>
        </div>
      </header>

      {/* 4. نظام ترتيب القوائم عبر HTML [cite: 19] */}
      <div className="category-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="category-item">
            <button className="category-header" onClick={() => setActiveTab(activeTab === index ? null : index)}>
              <div style={{color:'#7C3AED', fontSize:'12px', transform: activeTab === index ? 'rotate(180deg)' : 'rotate(0)'}}>▼</div>
              <div className="icon-box">
                <span>{cat.title}</span>
                {cat.icon}
              </div>
            </button>
            
            <AnimatePresence>
              {activeTab === index && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{overflow:'hidden'}}>
                  <div className="inputs-container">
                    {cat.fields.map((field, idx) => (
                      <input 
                        key={idx} 
                        className="custom-input" 
                        placeholder={field} 
                        value={inputs[cat.id][idx]}
                        onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)}
                      />
                    ))}
                    <button className="analyze-btn" onClick={() => runAiAnalysis(index)}>
                      <Sparkles size={18}/> {loading ? 'جاري التحليل...' : 'تحليل وحفظ'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <button style={{backgroundColor:'#B91C1C', color:'white', border:'none', padding:'12px 35px', borderRadius:'30px', fontWeight:'bold', marginTop:'30px'}}>عودة</button>

      {/* 5. شاشة الشات والذكاء الاصطناعي [cite: 29, 30] */}
      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={30}/></button>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:'bold'}}>طبيبة رقة</div>
                <div style={{fontSize:'10px', opacity:0.8}}>مستشارة الولادة والحمل</div>
              </div>
              <button onClick={() => { if(confirm('حذف السجل؟')) setChatHistory([]); }} style={{background:'rgba(255,0,0,0.1)', border:'none', color:'white', padding:'8px', borderRadius:'10px'}}><Trash2 size={20}/></button>
            </div>

            <div className="history-list">
              {loading && <div style={{textAlign:'center', color:'#7C3AED', padding:'20px'}}>الطبيبة تراجع بياناتك الآن...</div>}
              {chatHistory.map(msg => (
                <div key={msg.id} className="chat-card">
                  <div style={{fontSize:'11px', color:'#7C3AED', fontWeight:'bold', marginBottom:'8px'}}>قسم: {msg.query}</div>
                  <p style={{fontSize:'14px', lineHeight:'1.6', color:'#334155', whiteSpace:'pre-wrap'}}>{msg.reply}</p>
                  <div style={{display:'flex', justifyBetween:'center', marginTop:'15px', paddingTop:'10px', borderTop:'1px solid #E2E8F0'}}>
                    <span style={{fontSize:'10px', color:'#94A3B8'}}>{msg.time}</span>
                    <button onClick={() => setChatHistory(prev => prev.filter(m => m.id !== msg.id))} style={{marginRight:'auto', background:'none', border:'none', color:'#F87171'}}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-footer">
              <button className="tool-btn" onClick={() => alert('تم فتح الكاميرا لتصوير الأشعة')}><Camera size={20}/></button>
              <button className="tool-btn" onClick={() => alert('الميكروفون قيد التسجيل...')}><Mic size={20}/></button>
              <div style={{flex:1, background:'#F1F5F9', height:'45px', borderRadius:'15px', display:'flex', alignItems:'center', padding:'0 15px', color:'#94A3B8', fontSize:'12px'}}>اكتبي سؤالاً للطبيبة...</div>
              <button style={{width:'45px', height:'45px', borderRadius:'15px', border:'none', background:'#7C3AED', color:'white'}}><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
