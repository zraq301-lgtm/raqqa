import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

// تصحيح المسار للوصول إلى المجلد الصحيح
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [promptInput, setPromptInput] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(''); // حالة لتاريخ الولادة المتوقع

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

  // تأثير لحساب تاريخ الولادة المتوقع عند تغيير شهر الحمل
  useEffect(() => {
    if (pregnancyMonth) {
      const currentMonthNum = parseInt(pregnancyMonth);
      if (currentMonthNum >= 1 && currentMonthNum <= 9) {
        const monthsRemaining = 9 - currentMonthNum;
        const projectedDeliveryDate = new Date();
        projectedDeliveryDate.setMonth(projectedDeliveryDate.getMonth() + monthsRemaining);
        // إضافة أسبوع لتقريب الموعد (طريقة نيجلي)
        projectedDeliveryDate.setDate(projectedDeliveryDate.getDate() + 7);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setDeliveryDate(projectedDeliveryDate.toLocaleDateString('ar-SA', options));
      } else {
        setDeliveryDate('');
      }
    } else {
      setDeliveryDate('');
    }
  }, [pregnancyMonth]);

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // دالة حفظ التوكن والمزامنة - تُستدعى فقط للبيانات والصور
  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    
    // استخدام تاريخ الولادة المتوقع المحسوب بالفعل
    if (!deliveryDate) return; 

    // تحويل تاريخ الولادة المتوقع من النص إلى كائن تاريخ للمزامنة
    const deliveryDateObj = new Date(deliveryDate.replace('،', '')); // إزالة الفاصلة المحتملة

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
          scheduled_for: deliveryDateObj.toISOString(),
          all_data: JSON.stringify(inputs),
          note: `تحليل آلي لـ ${categoryTitle}`
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      if (savedToken) {
        const fcmOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تقرير حمل جديد 🤰',
            body: `طبيب راقي قام بتحليل ${categoryTitle}، اضغطي للعرض.`,
            data: { type: 'medical_report' }
          }
        };
        await CapacitorHttp.post(fcmOptions);
      }
    } catch (err) {
      console.error("خطأ في مزامنة البيانات:", err);
    }
  };

  const handleMediaAction = async (sourceType) => {
    try {
      const base64Data = sourceType === 'camera' ? await takePhoto() : await fetchImage();
      if (!base64Data) return;
      setIsProcessing(true);
      setShowChat(true);
      const userMsgId = Date.now();
      const tempMsg = { id: userMsgId, query: "تحليل وسائط", reply: "جاري المعالجة...", time: new Date().toLocaleTimeString('ar-SA') };
      setChatHistory(prev => [tempMsg, ...prev]);

      const fileName = `preg_img_${userMsgId}.png`;
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, 'image/png');

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `بصفتك خبير، حلل هذه الصورة الطبية المتعلقة بالحمل: ${finalAttachmentUrl}` }
      });

      if (response.status === 200) {
        const aiReply = response.data.reply || "تم التحليل بنجاح.";
        const finalMsg = { id: Date.now(), query: "تحليل صورة", reply: aiReply, time: new Date().toLocaleTimeString('ar-SA') };
        setChatHistory(prev => [finalMsg, ...prev.filter(m => m.id !== userMsgId)]);
        // الحفظ والإشعار مفعل هنا لأنه تحليل لبيانات (صورة)
        await saveAndNotify("تحليل وسائط", aiReply);
      }
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  const sendCustomPrompt = async () => {
    if (!promptInput.trim()) return;
    setLoading(true);
    setShowChat(true);
    const userQuery = promptInput;
    setPromptInput('');
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userQuery }
      });
      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: userQuery, reply, time: new Date().toLocaleTimeString('ar-SA') };
      setChatHistory(prev => [newMsg, ...prev]);
      
      // لا توجد دالة saveAndNotify هنا (منع الحفظ والإشعار للأسئلة العامة)
    } catch (err) { console.error(err); }
    setLoading(false);
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
        data: { prompt: `حللي بيانات ${category.title} للحامل: ${dataString}` }
      });
      const reply = response.data.reply || response.data.message;
      const newMsg = { id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') };
      setChatHistory(prev => [newMsg, ...prev]);
      // تفعيل الحفظ والإشعار لمدخلات البيانات فقط
      await saveAndNotify(category.title, reply);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      <style>{`
        .app-container { 
          background-color: #FDF2F8; 
          min-height: 100vh; 
          padding: 20px; 
          font-family: sans-serif;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .ai-btn { background: #E9D5FF; color: #7C3AED; padding: 12px 18px; border-radius: 20px; border: none; cursor: pointer; font-weight: bold; }
        .quick-chat-bar { background: white; padding: 10px; border-radius: 15px; display: flex; gap: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); align-items: center; border: 1px solid #FBCFE8; }
        .quick-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .category-item { background: white; border-radius: 25px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.5); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 18px 20px; border: none; background: none; align-items: center; }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .custom-input { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #F1F5F9; background: #F8FAFC; font-size: 12px; }
        .analyze-full-btn { grid-column: span 2; background: #E9D5FF; color: #7C3AED; border: none; padding: 12px; border-radius: 12px; font-weight: bold; margin-top: 5px; cursor: pointer; }
        .month-picker { display: flex; align-items: center; gap: 5px; background: white; padding: 5px 10px; border-radius: 10px; border: 1px solid #E9D5FF; }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #E9D5FF; color: #7C3AED; padding: 20px; display: flex; justify-content: space-between; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; background: #FDF2F8; }
        .msg-card { background: white; padding: 15px; border-radius: 20px 20px 0 20px; margin-bottom: 15px; }
        .prompt-bar { padding: 15px; background: white; border-top: 1px solid #F1F5F9; display: flex; gap: 8px; }
        .prompt-input { flex: 1; padding: 12px; border-radius: 15px; border: 1px solid #E2E8F0; }
        .category-list { padding-bottom: 30px; }
        
        /* تنسيقات الساعة الوردية والأنيقة */
        .pregnancy-clock-container {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          border: 10px solid #FBCFE8; /* وردي فاتح */
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          margin: 0 auto 30px;
          background: #FFF5F7; /* وردي فاتح جداً */
          overflow: hidden;
        }
        .clock-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #7C3AED; /* بنفسجي زاهي */
          border-radius: 50%;
          z-index: 10;
        }
        .clock-hand {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: bottom center;
          border-radius: 5px;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .baby-pointer {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #7C3AED;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .hand-stick {
          width: 4px;
          height: 80px;
          background: #7C3AED;
        }
        .month-labels-container {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .month-label {
          position: absolute;
          font-weight: bold;
          font-size: 16px;
          color: #5B21B6; /* بنفسجي غامق */
        }
        .delivery-date-info {
          text-align: center;
          color: #7C3AED;
          margin-top: -10px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>

      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>
          <div style={{display:'flex', alignItems:'center', gap: '5px'}}>
            <MessageSquare size={18}/> <span>طبيب AI</span>
          </div>
        </button>
        <div style={{textAlign:'right', color:'#5B21B6'}}>
          <h1 style={{fontSize:'22px', margin:0}}>متابعة الحمل <Plus size={24} style={{display:'inline', color:'#7C3AED'}}/></h1>
        </div>
      </header>

      {/* ساعة متابعة الحمل الأنيقة مع التقويم الشهري بالحواف */}
      <div className="pregnancy-clock-container">
        <div className="clock-center"></div>
        
        {/* مؤشر صورة الطفل */}
        <motion.div 
          className="clock-hand" 
          animate={{ 
            rotate: pregnancyMonth ? (parseInt(pregnancyMonth) - 1) * 36 : 0 // دوران يعتمد على شهر الحمل (1-9 أشهر، كل شهر 36 درجة)
          }} 
          transition={{ type: 'spring', stiffness: 50 }}
          style={{ x: '-50%', y: '-100%' }} // لضمان دوران المؤشر من مركز الساعة
        >
          {/* صورة الطفل المحببة */}
          <img src="src/assets/baby" alt="مؤشر الطفل" className="baby-pointer" />
          <div className="hand-stick"></div>
        </motion.div>

        {/* تسميات الأشهر بالحواف (تقويم شهري) */}
        <div className="month-labels-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => (
            <div 
              key={m} 
              className="month-label"
              style={{
                top: `${50 - 40 * Math.cos(((m-1) * 36 - 90) * Math.PI / 180)}%`, // حساب موضع الشهر على الدائرة
                left: `${50 + 40 * Math.sin(((m-1) * 36 - 90) * Math.PI / 180)}%`, // حساب موضع الشهر على الدائرة
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* عرض تاريخ الولادة المتوقع */}
      {deliveryDate && (
        <div className="delivery-date-info">
          تاريخ الولادة المتوقع: {deliveryDate}
        </div>
      )}

      <div className="quick-chat-bar">
        <Sparkles size={20} color="#7C3AED" />
        <input 
          className="quick-input" 
          placeholder="اسألي طبيب راقي عن أي شيء..." 
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendCustomPrompt()}
        />
        <button onClick={sendCustomPrompt} style={{background:'none', border:'none', color:'#7C3AED'}}>
          <Send size={20} />
        </button>
      </div>

      <div className="category-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="category-item">
            <div className="category-header">
              <button style={{background:'none', border:'none', color:'#7C3AED'}} onClick={() => setActiveTab(activeTab === index ? null : index)}>
                <div style={{transform: activeTab === index ? 'rotate(180deg)' : 'none', transition: '0.3s'}}>▼</div>
              </button>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                {cat.id === 'weeks' && (
                  <div className="month-picker">
                    <select 
                      style={{border:'none', background:'none', fontSize:'12px', fontWeight:'bold', color:'#7C3AED'}}
                      value={pregnancyMonth}
                      onChange={(e) => setPregnancyMonth(e.target.value)}
                    >
                      <option value="">الشهر</option>
                      {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
                <span style={{fontWeight:'bold', color:'#5B21B6'}}>{cat.title}</span>
                <span style={{color:'#7C3AED'}}>{cat.icon}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeTab === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inputs-container">
                    {cat.fields.map((field, idx) => (
                      <input key={idx} className="custom-input" placeholder={field} value={inputs[cat.id][idx]} onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)} />
                    ))}
                    <button className="analyze-full-btn" onClick={() => runAiAnalysis(index)}>
                      <Sparkles size={16} style={{display:'inline', marginLeft:'5px'}}/> {loading ? 'جاري التحليل والمزامنة...' : 'تحليل الطبيب وحفظ البيانات'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'#7C3AED'}}><ChevronRight size={28}/></button>
              <div style={{fontWeight:'bold'}}>طبيب راقي الذكي</div>
              <button onClick={() => setChatHistory([])} style={{background:'none', border:'none', color:'#7C3AED'}}><Trash2 size={20}/></button>
            </div>
            <div className="chat-body">
              {chatHistory.map(msg => (
                <div key={msg.id} className="msg-card">
                  <div style={{fontSize:'10px', color:'#7C3AED', fontWeight:'bold'}}>الموضوع: {msg.query}</div>
                  <p style={{fontSize:'13px', color:'#475569', marginTop: '5px'}}>{msg.reply}</p>
                </div>
              ))}
            </div>
            <div className="prompt-bar">
              <button className="ai-btn" onClick={() => handleMediaAction('camera')}><Camera size={20}/></button>
              <input className="prompt-input" value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="اكتب سؤالك هنا..." />
              <button className="ai-btn" onClick={sendCustomPrompt}><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
