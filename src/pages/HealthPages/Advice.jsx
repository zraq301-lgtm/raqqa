import React, { useState, useEffect } from 'react';
// حل مشكلة المسار: تأكدي أن ملف tips.json موجود فعلياً في src/data/tips.json
import localTips from '../../data/tips.json'; 

const HealthAdvice = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // دالة جلب النصيحة من الذكاء الاصطناعي
  const fetchAiTip = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://raqqa-hjl8.vercel.app/api/raqqa-ai', {
        method: 'POST',
        body: JSON.stringify({ prompt: "أعطني نصيحة طبية قصيرة ومفيدة للنساء اليوم" }),
      });
      
      if (!response.ok) throw new Error('AI Route not responding');
      
      const data = await response.json();
      // نفترض أن الرابط يعيد نصاً أو كائناً يحتوي على النصيحة
      setTip({
        title: "نصيحة الذكاء الاصطناعي",
        content: data.aiResponse || data.text || data[0].content, 
        icon: "✨"
      });
    } catch (error) {
      console.log("التحول للنصائح المخزنة بسبب:", error.message);
      // نظام الأمان: اختيار نصيحة عشوائية من الملف المحلي في حال فشل الـ API
      const randomLocalTip = localTips[Math.floor(Math.random() * localTips.length)];
      setTip(randomLocalTip);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiTip();
    
    // تحديث النصيحة كل 24 ساعة (86400000 مللي ثانية)
    const dailyUpdate = setInterval(fetchAiTip, 86400000);
    return () => clearInterval(dailyUpdate);
  }, []);

  if (loading) return <div style={styles.loader}>جاري تحضير نصيحتكِ اليومية... ✨</div>;

  return (
    <div style={styles.container}>
      <div style={{...styles.card, opacity: isExiting ? 0 : 1}}>
        <div style={styles.glassHeader}>
          <span style={styles.icon}>{tip?.icon || "🌸"}</span>
          <div style={styles.aiBadge}>ذكاء اصطناعي مباشر</div>
        </div>
        
        <h2 style={styles.title}>{tip?.title}</h2>
        <p style={styles.content}>{tip?.content}</p>
        
        <div style={styles.timerInfo}>تتحدث النصيحة تلقائياً كل 24 ساعة</div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    direction: 'rtl'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '28px',
    padding: '35px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 15px 35px rgba(255, 105, 180, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    transition: 'all 0.5s ease'
  },
  aiBadge: {
    background: 'linear-gradient(45deg, #ff85a2, #ffb7c5)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  glassHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  icon: { fontSize: '55px' },
  title: { color: '#ad1457', fontSize: '24px', marginBottom: '15px' },
  content: { color: '#444', fontSize: '18px', lineHeight: '1.7', minHeight: '80px' },
  timerInfo: { marginTop: '20px', color: '#f06292', fontSize: '13px', opacity: 0.8 },
  loader: { textAlign: 'center', color: '#d81b60', marginTop: '50px', fontWeight: 'bold' }
};

export default HealthAdvice;
