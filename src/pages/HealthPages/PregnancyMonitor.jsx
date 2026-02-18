import React, { useState, useCallback } from 'react';
import { iconMap } from '../../constants/iconMap';

const PregnancyMonitor = () => {
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);

  // تحميل البيانات من التخزين المحلي [cite: 3]
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('lady_fitness');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // مصفوفة البيانات المنظمة [cite: 4, 5, 6]
  const sections = [
    { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات"] },
    { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات", "مستوى الشدة", "وقت التمرين"] },
    { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل"] },
    { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "أعشاب", "ديتوكس", "الترطيب", "تجنب السكر"] },
    { id: "sleep", title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "الاستيقاظ", "الجودة", "الاسترخاء", "الكافيين", "القيلولة"] },
    { id: "mind", title: "الصحة النفسية", emoji: "🧠", fields: ["التوتر", "التنفس", "المزاج", "الدافعية", "التأمل", "عادات إيجابية"] },
    { id: "beauty", title: "المكملات والجمال", emoji: "✨", fields: ["فيتامينات", "جلد", "شعر", "كولاجين", "حرق", "أوميجا 3"] },
    { id: "cycle", title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة", "الاحتباس", "تغير الوزن", "الرياضة", "ألم الجسم"] }
  ];

  // دالة التحديث والحفظ [cite: 7, 8]
  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      return newData;
    });
  }, []);

  return (
    <div style={styles.container}>
      {/* رأس الكارت الأنيق */}
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <Icon size={28} color="#fff" />
        </div>
        <h2 style={styles.title}>متابعة الرشاقة والصحة</h2>
      </div>

      <div style={styles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={styles.sectionCard}>
            <div 
              style={{...styles.sectionHeader, borderBottom: openIdx === i ? '1px solid #eee' : 'none'}} 
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <div style={styles.sectionTitleGroup}>
                <span style={styles.emoji}>{sec.emoji}</span>
                <span style={styles.sectionTitleText}>{sec.title}</span>
              </div>
              <span style={{...styles.arrow, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)'}}>▾</span>
            </div>
            
            {openIdx === i && (
              <div style={styles.gridContainer}>
                {sec.fields.map((f) => (
                  <div key={`${sec.id}-${f}`} style={styles.inputGroup}>
                    <label style={styles.label}>{f}</label>
                    <input 
                      style={styles.input} 
                      value={data[`${sec.id}-${f}`] || ''} 
                      onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)}
                      placeholder="أدخل.."
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// تعريف التصميم باستخدام CSS-in-JS [cite: 8, 9, 10, 11]
const styles = {
  container: {
    background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)',
    borderRadius: '30px',
    padding: '25px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    direction: 'rtl',
    maxWidth: '500px',
    margin: 'auto',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    padding: '10px'
  },
  iconWrapper: {
    background: 'linear-gradient(45deg, #6a1b9a, #ab47bc)',
    padding: '10px',
    borderRadius: '15px',
    display: 'flex',
    boxShadow: '0 4px 12px rgba(106, 27, 154, 0.3)'
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    color: '#4a148c',
    fontWeight: '800'
  },
  sectionCard: {
    background: '#ffffff',
    borderRadius: '20px',
    marginBottom: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    overflow: 'hidden',
    border: '1px solid #f0f0f0'
  },
  sectionHeader: {
    padding: '18px 20px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.3s'
  },
  sectionTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  emoji: {
    fontSize: '1.3rem'
  },
  sectionTitleText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333'
  },
  arrow: {
    fontSize: '1.2rem',
    color: '#999',
    transition: 'transform 0.3s ease'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // عمودان بجانب بعضهما 
    gap: '12px',
    padding: '20px',
    background: '#fafafa'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.75rem',
    color: '#7b1fa2',
    fontWeight: '600',
    marginRight: '5px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    background: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.3s ease'
  }
};

export default PregnancyMonitor;
