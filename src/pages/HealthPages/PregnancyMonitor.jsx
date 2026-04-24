import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الخدمات (تأكد من صحة المسارات في مشروعك)
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';
import babyIcon from '../../assets/baby.png'; 

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [promptInput, setPromptInput] = useState('');
  
  const [pregnancyMonth, setPregnancyMonth] = useState(localStorage.getItem('saved_preg_month') || '');
  const [deliveryDate, setDeliveryDate] = useState(''); 
  const [rawDeliveryDate, setRawDeliveryDate] = useState(null);

  const categories = [
    { id: 'weeks', title: 'تطور الأسابيع', icon: <Calendar />, fields: ['الأسبوع الحالي', 'أعراض الأسبوع', 'ملاحظات الطبيب', 'المراجعة القادمة', 'تاريخ الولادة', 'تغيرات الوزن', 'حجم الجنين', 'نصيحة الأسبوع', 'تطور الأعضاء', 'مهام الأسبوع'] },
    { id: 'fetal', title: 'نمو الجنين', icon: <Activity />, fields: ['حركة الجنين', 'نبض القلب', 'الوزن التقديري', 'وضعية الجنين', 'السائل الأمينوسي', 'طول الفخذ', 'محيط الرأس', 'محيط البطن', 'التنفس الجنيني', 'حالة المشيمة'] },
    { id: 'mother', title: 'صحة الأم', icon: <Stethoscope />, fields: ['ضغط الدم', 'مستوى السكر', 'الوزن الحالي', 'الأعراض الشائعة', 'الحالة النفسية', 'درجة الحرارة', 'مستوى التورم', 'جودة النوم', 'النشاط البدني', 'معدل شرب الماء'] },
    { id: 'exams', title: 'الفحوصات', icon: <ClipboardList />, fields: ['تحليل الدم', 'فحص السكر', 'السونار', 'تحليل البول', 'فحوصات وراثية', 'فحص الغدة', 'نسبة الحديد', 'ضغط العين', 'تخطيط القلب', 'فحص عنق الرحم'] },
    { id: 'meds', title: 'سجل المكملات', icon: <Pill />, fields: ['حمض الفوليك', 'الحديد', 'الكالسيوم', 'فيتامين د', 'أوميغا 3', 'مغنيسيوم', 'فيتامين سي', 'بي 12', 'مكملات الغذاء', 'أدوية أخرى'] },
    { id: 'birth', title: 'الاستعداد للولادة', icon: <ShoppingBag />, fields: ['حقيبة المستشفى', 'خطة الولادة', 'تمارين التنفس', 'تجهيزات المولود', 'المستشفى', 'ملابس الأم', 'أوراق الثبوتية', 'مرافق الولادة', 'كرسي السيارة', 'ترتيبات المنزل'] },
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => state[cat.id] = Array(cat.fields.length).fill(''));
    return state;
  });

  useEffect(() => {
    if (pregnancyMonth) {
      localStorage.setItem('saved_preg_month', pregnancyMonth);
      const currentMonthNum = parseInt(pregnancyMonth);
      if (currentMonthNum >= 1 && currentMonthNum <= 9) {
        const today = new Date();
        const monthsRemaining = 9 - currentMonthNum;
        const projected = new Date(today.getFullYear(), today.getMonth() + monthsRemaining, today.getDate() + 7);
        setRawDeliveryDate(projected.toISOString());
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setDeliveryDate(projected.toLocaleDateString('ar-SA', options));
      }
    }
  }, [pregnancyMonth]);

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    let targetSchedule = rawDeliveryDate || new Date().toISOString(); 
    try {
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'pregnancy_followup',
          title: `تحديث طبي: ${categoryTitle} 🩺`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: targetSchedule, 
          all_data: JSON.stringify(inputs),
          pregnancy_month: pregnancyMonth,
          expected_delivery_date: deliveryDate,
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);
    } catch (err) { console.error("خطأ المزامنة:", err); }
  };

  const runAiAnalysis = async (catIdx) => {
    const category = categories[catIdx];
    const dataString = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(' | ');
    if (!dataString) return alert("الرجاء إدخال بيانات للتحليل");
    setLoading(true); setShowChat(true);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `حللي بيانات ${category.title} للحامل في الشهر ${pregnancyMonth}: ${dataString}` }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') }, ...prev]);
      await saveAndNotify(category.title, reply);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const sendCustomPrompt = async () => {
    if (!promptInput.trim()) return;
    setLoading(true); setShowChat(true);
    const userQuery = promptInput; setPromptInput('');
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userQuery }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ id: Date.now(), query: userQuery, reply, time: new Date().toLocaleTimeString('ar-SA') }, ...prev]);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      <style>{`
        .app-container { background: linear-gradient(135deg, #fdf4f5 0%, #e8d5e0 100%); min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; overflow-y: auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 25px; align-items: center; }
        
        /* تصميم الساعة المطور */
        .pregnancy-clock-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 35px; position: relative; }
        .clock-outer {
          width: 280px; height: 280px; border-radius: 50%; background: white;
          border: 10px solid #d4a5bc; box-shadow: 0 15px 35px rgba(139, 61, 109, 0.2);
          position: relative; display: flex; justify-content: center; align-items: center;
          background-image: radial-gradient(circle, #fff 0%, #fdf4f5 100%);
        }
        .mandala-bg {
          position: absolute; width: 90%; height: 90%; opacity: 0.15;
          background-image: url('https://www.transparenttextures.com/patterns/mandala.png'); /* نمط ماندالا */
        }
        .month-mark { position: absolute; font-weight: 800; color: #8b3d6d; font-size: 18px; }
        .clock-hand {
          position: absolute; width: 100%; height: 100%; top: 0; left: 0;
          display: flex; justify-content: center; z-index: 10;
        }
        .baby-bubble {
          position: absolute; width: 70px; height: 70px; border-radius: 50%;
          background: white; border: 3px solid #d4a5bc; top: -20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1); overflow: hidden;
          display: flex; justify-content: center; align-items: center;
        }
        .baby-bubble img { width: 85%; height: 85%; object-fit: contain; }

        .center-display { text-align: center; z-index: 5; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 50%; }
        
        .delivery-card {
          margin-top: -15px; background: white; padding: 12px 30px; border-radius: 40px;
          box-shadow: 0 8px 20px rgba(139, 61, 109, 0.1); border: 1.5px solid #d4a5bc;
          color: #8b3d6d; font-weight: bold; z-index: 20; display: flex; align-items: center; gap: 10px;
        }

        .ai-btn-top { background: white; color: #8b3d6d; padding: 10px 20px; border-radius: 25px; border: 1.5px solid #d4a5bc; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .category-item { background: white; border-radius: 25px; margin-bottom: 12px; border: 1px solid #e8d5e0; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 18px 22px; border: none; background: none; align-items: center; cursor: pointer; }
        .quick-chat-bar { background: white; padding: 10px 15px; border-radius: 30px; display: flex; gap: 10px; margin-bottom: 25px; border: 1px solid #d4a5bc; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .custom-input { width: 100%; padding: 12px; border-radius: 15px; border: 1px solid #eee; font-size: 13px; background: #fafafa; outline: none; }
        .analyze-full-btn { grid-column: span 2; background: #8b1e4a; color: white; border: none; padding: 14px; border-radius: 18px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 5px; }
      `}</style>

      <header className="header">
        <button className="ai-btn-top" onClick={() => setShowChat(true)}>
          <div className="w-6 h-6 bg-[#d4a5bc] rounded-full flex items-center justify-center text-white"><Stethoscope size={14}/></div>
          دليل الخبراء
        </button>
        <div style={{textAlign:'right', color:'#6d3d6d'}}>
          <h2 style={{fontSize:'22px', margin:0, fontWeight:'900'}}>متابعة الحمل <Heart size={20} style={{display:'inline', color:'#8b3d6d'}} fill="#8b3d6d"/></h2>
        </div>
      </header>

      <div className="pregnancy-clock-section">
        <div className="clock-outer">
          <div className="mandala-bg"></div>
          {[1,2,3,4,5,6,7,8,9].map((m) => {
            const angle = (m * 40) - 200; 
            return (
              <div key={m} className="month-mark" style={{
                left: '50%', top: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-115px) rotate(${-angle}deg)`,
                color: m.toString() === pregnancyMonth ? '#8a2be2' : '#c44d7a',
                fontSize: m.toString() === pregnancyMonth ? '22px' : '18px'
              }}>{m}</div>
            );
          })}

          <motion.div 
            className="clock-hand"
            animate={{ rotate: pregnancyMonth ? (parseInt(pregnancyMonth) * 40 - 200) : -160 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          >
            <div className="baby-bubble">
              <img src={babyIcon} alt="Baby" />
            </div>
            <div style={{width: 3, height: 110, background: 'linear-gradient(to bottom, #d4a5bc, #8b3d6d)', marginTop: 25, borderRadius: 10}}></div>
          </motion.div>

          <div className="center-display">
            <div style={{fontSize: '14px', color: '#6d3d6d', fontWeight: 'bold'}}>الشهر</div>
            <div style={{fontSize: '60px', fontWeight: '900', color: '#6d3d6d', lineHeight: 1}}>{pregnancyMonth || '-'}</div>
          </div>
        </div>
        
        {deliveryDate && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="delivery-card">
             <Calendar size={18} />
             <span>موعد الولادة المتوقع: <span style={{color: '#8b1e4a'}}>{deliveryDate}</span></span>
          </motion.div>
        )}
      </div>

      <div className="quick-chat-bar">
        <Sparkles size={20} color="#8b3d6d" />
        <input 
          className="custom-input" 
          style={{border:'none', background:'none', flex:1}} 
          placeholder="هل لديكِ استفسار أو قلق؟ اكتبي هنا..." 
          value={promptInput} 
          onChange={(e) => setPromptInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && sendCustomPrompt()} 
        />
        <button onClick={sendCustomPrompt} style={{background:'#8b1e4a', border:'none', color:'white', padding:'8px 15px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold'}}>استفسار</button>
      </div>

      <div className="category-list">
        {categories.map((cat, index) => (
          <motion.div layout key={cat.id} className="category-item">
            <div className="category-header" onClick={() => setActiveTab(activeTab === index ? null : index)}>
              <ChevronRight size={20} style={{transform: activeTab === index ? 'rotate(90deg)' : 'none', transition: '0.3s', color: '#8b3d6d'}} />
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                {cat.id === 'weeks' && (
                  <select 
                    style={{padding:'4px 10px', borderRadius:'15px', border:'1.5px solid #d4a5bc', color:'#8b3d6d', fontWeight:'bold', fontSize:'12px', outline:'none'}}
                    value={pregnancyMonth} 
                    onChange={(e) => { e.stopPropagation(); setPregnancyMonth(e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">اختر الشهر</option>
                    {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>شهر {m}</option>)}
                  </select>
                )}
                <span style={{fontWeight:'bold', color:'#6d3d6d'}}>{cat.title}</span>
                <span style={{color:'#8b3d6d'}}>{cat.icon}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeTab === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="inputs-container">
                    {cat.fields.map((field, idx) => (
                      <input key={idx} className="custom-input" placeholder={field} value={inputs[cat.id][idx]} onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)} />
                    ))}
                    <button className="analyze-full-btn" onClick={(e) => { e.stopPropagation(); runAiAnalysis(index); }}>
                      <Sparkles size={18}/>
                      {loading ? 'جاري التحليل والمزامنة...' : 'تحليل الطبيب وحفظ البيانات'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" style={{position:'fixed', inset:0, background:'#fdf4f5', zIndex:1000, display:'flex', flexDirection:'column'}} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div style={{background:'#8b3d6d', color:'white', padding:'20px', display:'flex', justifyContext:'space-between', alignItems:'center'}}>
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={28}/></button>
              <div style={{fontWeight:'bold', flex:1, textAlign:'center'}}>طبيب راقي - المستشار الذكي</div>
              <button onClick={() => setChatHistory([])} style={{background:'none', border:'none', color:'white'}}><Trash2 size={20}/></button>
            </div>
            <div style={{flex:1, overflowY:'auto', padding:'20px'}}>
              {chatHistory.map(msg => (
                <div key={msg.id} style={{background:'white', padding:'15px', borderRadius:'20px', marginBottom:'15px', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', borderRight:'4px solid #8b3d6d'}}>
                  <div style={{fontSize:'11px', color:'#8b3d6d', fontWeight:'bold', marginBottom: 5}}>متابعة: {msg.query}</div>
                  <p style={{fontSize:'14px', color:'#334155', lineHeight: 1.6, margin:0}}>{msg.reply}</p>
                </div>
              ))}
              {loading && <div style={{textAlign:'center', padding: 20, color: '#8b3d6d'}}>جاري معالجة طلبك...</div>}
            </div>
            <div style={{padding:'15px', display:'flex', gap:'10px', background:'white', borderTop:'1px solid #eee'}}>
              <button className="ai-btn-top" style={{padding:'10px'}} onClick={() => handleMediaAction('camera')}><Camera size={22}/></button>
              <input className="custom-input" style={{flex: 1}} value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="اسألي الطبيب..." />
              <button style={{background:'#8b3d6d', color:'white', border:'none', padding:'10px 20px', borderRadius:'15px'}} onClick={sendCustomPrompt}><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
