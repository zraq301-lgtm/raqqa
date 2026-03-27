import React, { useState } from 'react';

const MotherhoodPage = () => {
  // حالات تفاعلية بسيطة
  const [subscribed, setSubscribed] = useState(false);

  // لوحة الألوان (ألوان هادئة ومريحة للعين)
  const theme = {
    primary: '#F7DAD9', // وردي باستيل ناعم
    secondary: '#D5ECC2', // أخضر نعناعي هادئ
    accent: '#98DDCA', // فيروزي فاتح
    text: '#5D5D5D',
    white: '#FFFFFF',
    lightBg: '#F9F9F9'
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      direction: 'rtl',
      color: theme.text,
      backgroundColor: theme.white,
      lineHeight: '1.6',
    },
    header: {
      background: `linear-gradient(135deg, ${theme.primary} 0%, #fff 100%)`,
      padding: '80px 5%',
      textAlign: 'center',
      borderRadius: '0 0 50px 50px',
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '20px 5%',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    logo: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#D8A7B1',
    },
    heroTitle: {
      fontSize: '2.8rem',
      color: '#867070',
      marginBottom: '20px',
    },
    section: {
      padding: '60px 10%',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      marginTop: '30px',
    },
    card: {
      backgroundColor: theme.white,
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      border: `1px solid ${theme.primary}`,
      transition: 'transform 0.3s ease',
    },
    iconCircle: {
      width: '50px',
      height: '50px',
      backgroundColor: theme.secondary,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '15px',
      fontSize: '20px'
    },
    ctaSection: {
      backgroundColor: theme.primary,
      padding: '50px',
      borderRadius: '30px',
      textAlign: 'center',
      margin: '40px 0',
    },
    input: {
      padding: '12px 20px',
      borderRadius: '25px',
      border: 'none',
      width: '250px',
      marginLeft: '10px',
      outline: 'none',
    },
    button: {
      padding: '12px 30px',
      borderRadius: '25px',
      border: 'none',
      backgroundColor: '#867070',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: '0.3s',
    }
  };

  const adviceList = [
    { title: "تغذية الرضيع", desc: "دليلك الشامل للرضاعة الطبيعية والأطعمة الأولى.", icon: "🍼" },
    { title: "النوم الهادئ", desc: "نصائح الخبراء لمساعدة طفلك (ولكِ) على نوم متواصل.", icon: "🌙" },
    { title: "التربية الإيجابية", desc: "بناء شخصية الطفل من خلال الحب والتفاهم والحدود.", icon: "🎈" },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>🌸 ملاذ الأمومة</div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
          <span>المقالات</span>
          <span>الدورات</span>
          <span>استشارات</span>
        </div>
      </nav>

      {/* Hero */}
      <header style={styles.header}>
        <h1 style={styles.heroTitle}>لأنكِ لستِ وحدكِ في هذه الرحلة</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          نقدم لكِ الدعم العلمي والعاطفي الذي تحتاجينه لتربية أطفال سعداء ومبدعين.
        </p>
      </header>

      {/* Advice Grid */}
      <section style={styles.section}>
        <h2 style={{ textAlign: 'center', color: '#867070' }}>محاور الرعاية الأساسية</h2>
        <div style={styles.grid}>
          {adviceList.map((item, index) => (
            <div key={index} style={styles.card} 
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={styles.iconCircle}>{item.icon}</div>
              <h3 style={{ marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ fontSize: '15px', color: '#777' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interaction Section */}
      <section style={styles.section}>
        <div style={styles.ctaSection}>
          <h2 style={{ marginBottom: '15px' }}>انضمي إلى مجتمعنا البريدي</h2>
          <p style={{ marginBottom: '25px' }}>احصلي على نصيحة تربوية أسبوعية مباشرة في بريدك.</p>
          {!subscribed ? (
            <div>
              <input type="email" placeholder="بريدك الإلكتروني" style={styles.input} />
              <button style={styles.button} onClick={() => setSubscribed(true)}>اشتركي الآن</button>
            </div>
          ) : (
            <p style={{ fontWeight: 'bold', color: '#4E9F3D' }}>شكراً لانضمامكِ إلينا! ✨</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px', color: '#bbb', fontSize: '13px' }}>
        © 2026 جميع الحقوق محفوظة لـ ملاذ الأمومة والطفولة
      </footer>
    </div>
  );
};

export default MotherhoodPage;
