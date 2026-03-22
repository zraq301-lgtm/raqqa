import React, { useState, useEffect } from 'react';
// تأكدي أن ملف tips.json موجود في src/data/tips.json
import localTips from '../../data/tips.json'; 

const HealthAdvice = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const fetchAiTip = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://raqqa-hjl8.vercel.app/api/raqqa-ai', {
        method: 'POST',
        body: JSON.stringify({ prompt: "أعطني نصيحة طبية قصيرة ومفيدة للنساء اليوم" }),
      });
      
      if (!response.ok) throw new Error('AI Route not responding');
      
      const data = await response.json();
      setTip({
        title: "نصيحة اليوم",
        content: data.aiResponse || data.text || data[0].content, 
        icon: "🌸"
      });
    } catch (error) {
      console.log("التحول للنصائح المخزنة بسبب:", error.message);
      const randomLocalTip = localTips[Math.floor(Math.random() * localTips.length)];
      setTip(randomLocalTip);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiTip();
    const dailyUpdate = setInterval(fetchAiTip, 86400000);
    return () => clearInterval(dailyUpdate);
  }, []);

  if (loading) return <div style={styles.loader}>جاري تحضير نصيحتكِ اليومية... ✨</div>;

  return (
    <div style={styles.container}>
      {/* الإطار الوردي الخارجي */}
      <div style={styles.floralBorder}>
        <div style={{...styles.card, opacity: isExiting ? 0 : 1}}>
          <div style={styles.glassHeader}>
            <span style={styles.icon}>{tip?.icon || "🌺"}</span>
          </div>
          
          <h2 style={styles.title}>{tip?.title}</h2>
          <p style={styles.content}>{tip?.content}</p>
          
          <div style={styles.timerInfo}>تحديث النصيحة كل 24 ساعة</div>
        </div>
      </div>

      <style>{`
        @keyframes rotateBorder {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    direction: 'rtl',
    minHeight: '300px'
  },
  // إطار الورود (استخدام Border Image أو تكرار زخرفي)
  floralBorder: {
    padding: '15px',
    borderRadius: '35px',
    background: 'linear-gradient(45deg, #ff85a2, #fce4ec, #ff85a2)', // ألوان وردية واضحة
    boxShadow: '0 10px 30px rgba(255, 133, 162, 0.3)',
    position: 'relative',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.9)', // تقليل الشفافية لجعل الخط أوضح
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    borderRadius: '25px',
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
    border: '2px solid #ffc1e3', // إطار داخلي وردي
    textAlign: 'center',
    transition: 'all 0.5s ease'
  },
  glassHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  icon: { 
    fontSize: '60px',
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))' 
  },
  title: { 
    color: '#c2185b', // وردي غامق جداً وواضح
    fontSize: '26px', 
    fontWeight: 'bold',
    marginBottom: '15px',
    textShadow: '1px 1px 1px rgba(0,0,0,0.05)'
  },
  content: { 
    color: '#2d3436', // لون رمادي غامق جداً يقترب للأسود للوضوح التام
    fontSize: '19px', 
    fontWeight: '500',
    lineHeight: '1.8', 
    minHeight: '80px' 
  },
  timerInfo: { 
    marginTop: '25px', 
    color: '#d81b60', 
    fontSize: '14px', 
    fontWeight: '600',
    borderTop: '1px solid #fce4ec',
    paddingTop: '15px'
  },
  loader: { 
    textAlign: 'center', 
    color: '#d81b60', 
    marginTop: '50px', 
    fontWeight: 'bold',
    fontSize: '18px' 
  }
};

export default HealthAdvice;
