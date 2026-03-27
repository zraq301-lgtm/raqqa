import React, { useState } from 'react';

const ModernMotherhood = () => {
  // قائمة الأقسام الخمسة (مصفوفة البيانات)
  const sections = [
    {
      id: 1,
      title: "رعاية حديثي الولادة",
      description: "دليل شامل للتعامل مع طفلك في أسابيعه الأولى، من الاستحمام وحتى تنظيم النوم.",
      icon: "👶",
      color: "#FFE5E5" // وردي ناعم
    },
    {
      id: 2,
      title: "التغذية السليمة",
      description: "وصفات صحية وجداول غذائية مدروسة لكل مرحلة عمرية لضمان نمو طفلك السليم.",
      icon: "🥗",
      color: "#F0FFF0" // أخضر نعناعي
    },
    {
      id: 3,
      title: "الصحة النفسية للأم",
      description: "لأن سعادتك هي أساس سعادة طفلك، نقدم لكِ نصائح لتجاوز ضغوط التربية.",
      icon: "🧘‍♀️",
      color: "#E6E6FA" // لافندر
    },
    {
      id: 4,
      title: "ألعاب وتنمية مهارات",
      description: "أنشطة تفاعلية وألعاب ذكاء لتطوير مهارات طفلك الحركية والذهنية يومياً.",
      icon: "🧩",
      color: "#FFF9E3" // أصفر زبدي
    },
    {
      id: 5,
      title: "الاستشارات المتخصصة",
      description: "تواصل مباشر مع خبراء في التربية وعلم نفس الطفل للإجابة على تساؤلاتك.",
      icon: "👩‍⚕️",
      color: "#E0F7FA" // أزرق سماوي
    }
  ];

  const styles = {
    page: {
      direction: 'rtl',
      fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
      backgroundColor: '#fdfbfb',
      color: '#444',
      margin: 0,
      paddingBottom: '50px'
    },
    header: {
      textAlign: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(to bottom, #fff, #fdfbfb)',
    },
    title: {
      fontSize: '2.5rem',
      color: '#867070',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#999',
      fontSize: '1.1rem'
    },
    // شبكة الأقسام الخمسة
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      padding: '0 8%',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: (bgColor) => ({
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '40px 30px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: `2px solid ${bgColor}`,
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    iconWrapper: (bgColor) => ({
      width: '70px',
      height: '70px',
      backgroundColor: bgColor,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      marginBottom: '20px'
    }),
    cardTitle: {
      fontSize: '1.4rem',
      marginBottom: '15px',
      color: '#555'
    },
    cardText: {
      fontSize: '0.95rem',
      color: '#777',
      lineHeight: '1.7'
    },
    footer: {
      textAlign: 'center',
      marginTop: '60px',
      padding: '20px',
      borderTop: '1px solid #eee',
      color: '#bbb'
    }
  };

  return (
    <div style={styles.page}>
      {/* رأس الصفحة */}
      <header style={styles.header}>
        <h1 style={styles.title}>عالم الأمومة الذكي</h1>
        <p style={styles.subtitle}>رفيقكِ الدائم في رحلة التربية والحب</p>
      </header>

      {/* شبكة الأقسام الخمسة */}
      <main style={styles.gridContainer}>
        {sections.map((item) => (
          <div 
            key={item.id} 
            style={styles.card(item.color)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
            }}
          >
            <div style={styles.iconWrapper(item.color)}>
              {item.icon}
            </div>
            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.cardText}>{item.description}</p>
          </div>
        ))}
      </main>

      {/* التذييل */}
      <footer style={styles.footer}>
        <p>© 2026 جميع الحقوق محفوظة لـ "ملاذ الأم والطفل"</p>
      </footer>
    </div>
  );
};

export default ModernMotherhood;
