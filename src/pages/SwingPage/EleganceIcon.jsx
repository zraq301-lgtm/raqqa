import React, { useState } from 'react';

// 1. قائمة الصور والمعلومات (سهلة التعديل)
const fashionCollection = [
  {
    id: 1,
    title: "مجموعة الشتاء المخملية",
    subtitle: "دفء وفخامة",
    imageUrl: "https://images.unsplash.com/photo-1539109132304-392531ecdddd?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "الأناقة العصرية اليومية",
    subtitle: "بساطة مريحة",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "إكسسوارات ذهبية",
    subtitle: "لمسة نهائية ساحرة",
    imageUrl: "https://images.unsplash.com/photo-1611085583192-f5979b00572b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "فساتين السهرة",
    subtitle: "تألقي في مناسباتك",
    imageUrl: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop"
  }
];

const PremiumFashionPage = () => {
  // حالات لعرض استجابة الذكاء الاصطناعي
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // تعريف لوحة الألوان الجديدة
  const colors = {
    bg: '#121212',       // أسود فحمى للخلفية
    text: '#E0E0E0',     // رمادي فاتح جداً للنصوص
    accent: '#C5A059',   // ذهبي خافت للأزرار والعناوين
    cardBg: '#1E1E1E',   // أسود فاتح للكروت
    border: '#333333'    // رمادي غامق للحدود
  };

  const styles = {
    container: {
      fontFamily: "'Times New Roman', Times, serif", // خط كلاسيكي راقي
      color: colors.text,
      backgroundColor: colors.bg,
      margin: 0,
      padding: 0,
      direction: 'rtl',
      minHeight: '100vh',
    },
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 5%',
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: 'rgba(18, 18, 18, 0.95)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    logo: {
      fontSize: '28px',
      fontWeight: 'bold',
      letterSpacing: '3px',
      color: colors.accent,
      textTransform: 'uppercase',
    },
    navLinks: {
      display: 'flex',
      listStyle: 'none',
      gap: '30px',
      fontSize: '14px',
      letterSpacing: '1px'
    },
    hero: {
      height: '60vh',
      background: `linear-gradient(rgba(0,0,0,0.6), ${colors.bg}), url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: '2.5rem',
      color: colors.accent,
      marginBottom: '10px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '30px',
      padding: '60px 5%',
    },
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
    },
    cardImage: {
      width: '100%',
      height: '350px',
      objectFit: 'cover',
    },
    cardContent: {
      padding: '20px',
      textAlign: 'center',
    },
    
    // ستايل قسم الذكاء الاصطناعي
    aiSection: {
      padding: '40px 5%',
      backgroundColor: colors.cardBg,
      borderTop: `1px solid ${colors.border}`,
      borderBottom: `1px solid ${colors.border}`,
      textAlign: 'center',
    },
    aiButtonGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      flexWrap: 'wrap',
      marginTop: '20px',
    },
    aiButton: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      color: colors.accent,
      border: `1px solid ${colors.accent}`,
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s ease',
    },
    responseArea: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      minHeight: '50px',
      color: '#aaa',
      fontSize: '14px',
    },

    footer: {
      padding: '40px 5%',
      textAlign: 'center',
      borderTop: `1px solid ${colors.border}`,
      fontSize: '12px',
      color: '#666',
    },
    // ستايل الايقونات المصغرة
    socialIcons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '15px',
    },
    icon: {
      width: '18px', // تصغير الحجم
      height: '18px',
      fill: colors.accent, // تلوينها بالذهبي
      cursor: 'pointer',
      opacity: 0.8
    }
  };

  // 2. وظيفة إرسال الطلب لرابط الذكاء الاصطناعي
  const callAiApi = async (promptText) => {
    const apiUrl = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";
    setIsLoading(true);
    setAiResponse('جاري تحليل الأناقة...');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // قد تحتاج لإضافة مفاتيح Authorization هنا إذا كان السيرفر يتطلبها
        },
        // إرسال البرومبت في جسم الطلب
        body: JSON.stringify({ prompt: promptText }), 
      });

      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }

      const data = await response.json();
      // افترضنا أن السيرفر يعيد حقل اسمه data.response، عدله حسب الحاجة
      setAiResponse(data.response || 'تم استلام الإجابة بنجاح (لا يوجد نص)'); 
    } catch (error) {
      console.error("AI API Error:", error);
      setAiResponse(`عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. (تحقق من CORS في الكونسول)`);
    } finally {
      setIsLoading(false);
    }
  };

  // أيقونات SVG بسيطة (تم تصغيرها في الستايل)
  const FacebookIcon = () => <svg style={styles.icon} viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
  const InstagramIcon = () => <svg style={styles.icon} viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>RAQQA</div>
        <ul style={styles.navLinks}>
          <li>المجموعات الجديده</li>
          <li>المتجر</li>
          <li>مجلة الموضة</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header style={styles.hero}>
        <div>
          <h1 style={styles.sectionTitle}>تعريف جديد للأناقة</h1>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>استكشف الفخامة بجيلها الجديد</p>
        </div>
      </header>

      {/* 3. قسم أزرار الذكاء الاصطناعي */}
      <section style={styles.aiSection}>
        <h3 style={{color: colors.accent, marginBottom: '10px'}}>مساعد الأناقة الذكي</h3>
        <p style={{fontSize: '14px', color: '#aaa'}}>إرسال استفسار جاهز لرابط الـ API:</p>
        
        <div style={styles.aiButtonGroup}>
          <button 
            style={styles.aiButton} 
            onClick={() => callAiApi("اقترح لي طقم عشاء رسمي باللون الأسود")}
            disabled={isLoading}
          >
            طقم عشاء رسمي
          </button>
          <button 
            style={styles.aiButton} 
            onClick={() => callAiApi("ما هي أحدث صيحات ألوان ربيع 2026؟")}
            disabled={isLoading}
          >
            صيحات 2026
          </button>
          <button 
            style={styles.aiButton} 
            onClick={() => callAiApi("كيف أنسق الإكسسوارات الذهبية مع ملابس كاجوال؟")}
            disabled={isLoading}
          >
            تنسيق إكسسوارات
          </button>
        </div>

        <div style={styles.responseArea}>
          {isLoading ? "جاري الاتصال بالسيرفر..." : aiResponse}
        </div>
      </section>

      {/* 4. قسم المعرض المستخرج من القائمة */}
      <section style={styles.grid}>
        {fashionCollection.map((item) => (
          <div 
            key={item.id} 
            style={styles.card}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img src={item.imageUrl} alt={item.title} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h4 style={{ fontSize: '18px', marginBottom: '5px', color: colors.accent }}>{item.title}</h4>
              <p style={{ fontSize: '13px', color: '#888' }}>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        {/* الايقونات المصغرة */}
        <div style={styles.socialIcons}>
          <FacebookIcon />
          <InstagramIcon />
        </div>
        <div style={{marginBottom: '10px'}}>الرقة للأزياء | عنوان الفخامة</div>
        © 2026 جميع الحقوق محفوظة
      </footer>
    </div>
  );
};

export default PremiumFashionPage;
