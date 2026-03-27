import React from 'react';

const EducationalAwareness = () => {
  // المحاور الخمسة المحددة
  const educationAxios = [
    {
      id: 1,
      title: "السلوك",
      description: "تحليل وتوجيه الأفعال الظاهرة للطفل وكيفية تعديلها بأساليب تربوية حديثة بعيداً عن الانفعال.",
      icon: "🤝",
      color: "#FCE4EC" // وردي ناعم
    },
    {
      id: 2,
      title: "القناعات",
      description: "غرس القيم والمبادئ الجوهرية التي تشكل هوية الطفل وتبني ثقته بنفسه وبالعالم من حوله.",
      icon: "💎",
      color: "#E8F5E9" // أخضر هادئ
    },
    {
      id: 3,
      title: "الانتقادات",
      description: "كيفية التعامل مع النقد الخارجي أو نقد الذات، وتحويله إلى أداة للبناء وليس للهدم في نفسية الطفل.",
      icon: "📢",
      color: "#FFF3E0" // برتقالي خافت
    },
    {
      id: 4,
      title: "التصورات",
      description: "فهم كيف يرى الطفل نفسه ويرى والديه، وتصحيح الصور الذهنية المغلوطة التي قد تتكون لديه.",
      icon: "🧠",
      color: "#F3E5F5" // لافندر
    },
    {
      id: 5,
      title: "المفاهيم",
      description: "تفكيك وشرح المصطلحات التربوية الكبرى وتبسيطها لتصبح ممارسات يومية سهلة التطبيق.",
      icon: "📚",
      color: "#E1F5FE" // أزرق سماوي
    }
  ];

  const styles = {
    wrapper: {
      direction: 'rtl',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 5%',
      color: '#333'
    },
    header: {
      textAlign: 'center',
      marginBottom: '50px'
    },
    mainTitle: {
      fontSize: '2.2rem',
      color: '#5D4037',
      marginBottom: '10px'
    },
    line: {
      width: '60px',
      height: '3px',
      backgroundColor: '#D81B60',
      margin: '0 auto 20px'
    },
    // تصميم الشبكة للأقسام الخمسة
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: (bgColor) => ({
      backgroundColor: '#fff',
      borderRadius: '15px',
      padding: '30px',
      borderRight: `8px solid ${bgColor}`, // تمييز جانبي باللون
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }),
    iconArea: {
      fontSize: '2.5rem',
    },
    title: {
      fontSize: '1.5rem',
      color: '#444',
      margin: 0
    },
    desc: {
      fontSize: '1rem',
      color: '#666',
      lineHeight: '1.8',
      margin: 0
    },
    footer: {
      marginTop: '60px',
      textAlign: 'center',
      color: '#999',
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>منهج الوعي التربوي</h1>
        <div style={styles.line}></div>
        <p>خمسة ركائز أساسية لبناء علاقة تربوية واعية ومستدامة</p>
      </header>

      <main style={styles.grid}>
        {educationAxios.map((item) => (
          <div 
            key={item.id} 
            style={styles.card(item.color)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
            }}
          >
            <div style={styles.iconArea}>{item.icon}</div>
            <h2 style={styles.title}>{item.title}</h2>
            <p style={styles.desc}>{item.description}</p>
          </div>
        ))}
      </main>

      <footer style={styles.footer}>
        <p>جميع الحقوق محفوظة © 2026 | منصة التربية الفكرية</p>
      </footer>
    </div>
  );
};

export default EducationalAwareness;
