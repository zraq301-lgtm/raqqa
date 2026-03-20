import React, { useState } from 'react';

const WomenHealthTips = () => {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      title: "التغذية المتوازنة",
      content: "احرصي على تناول الأطعمة الغنية بالحديد والكالسيوم، خاصة الخضروات الورقية ومنتجات الألبان لتعزيز صحة العظام.",
      icon: "🥗"
    },
    {
      title: "شرب الماء",
      content: "اشربي ما لا يقل عن 8 أكواب من الماء يومياً للحفاظ على نضارة بشرتكِ وتحسين عملية التمثيل الغذائي.",
      icon: "💧"
    },
    {
      title: "النشاط البدني",
      content: "المشي لمدة 30 دقيقة يومياً يساعد في تحسين الحالة المزاجية وتنظيم الهرمونات بشكل طبيعي.",
      icon: "🧘‍♀️"
    },
    {
      title: "النوم الكافي",
      content: "النوم لمدة 7-8 ساعات ليلاً ضروري جداً لتجديد خلايا الجسم والحفاظ على التوازن النفسي.",
      icon: "🌙"
    }
  ];

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  // تنسيقات CSS مدمجة
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl',
      backgroundColor: '#fff5f7', // لون خلفية وردي فاتح جداً
      minHeight: '300px',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      maxWidth: '500px',
      margin: '20px auto',
      border: '1px solid #ffebee'
    },
    icon: {
      fontSize: '50px',
      marginBottom: '15px'
    },
    title: {
      color: '#d81b60', // لون وردي غامق
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '15px'
    },
    content: {
      color: '#555',
      fontSize: '18px',
      lineHeight: '1.6',
      textAlign: 'center',
      marginBottom: '25px',
      padding: '0 10px'
    },
    button: {
      backgroundColor: '#ec407a',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '25px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(236, 64, 122, 0.3)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>{tips[currentTip].icon}</div>
      <h2 style={styles.title}>{tips[currentTip].title}</h2>
      <p style={styles.content}>{tips[currentTip].content}</p>
      <button 
        style={styles.button}
        onClick={nextTip}
        onMouseOver={(e) => e.target.style.backgroundColor = '#d81b60'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ec407a'}
      >
        نصيحة أخرى ✨
      </button>
    </div>
  );
};

export default WomenHealthTips;
