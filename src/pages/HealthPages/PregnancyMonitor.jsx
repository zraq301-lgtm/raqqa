import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap'; [cite_start]// [cite: 1]

const FitnessMonitor = () => {
  [cite_start]// استخدام أيقونة الرشاقة من الخريطة المتاحة [cite: 2]
  const Icon = iconMap.intimacy; 
  const [openIdx, setOpenIdx] = useState(null);
  
  [cite_start]// نظام تخزين البيانات محلياً لضمان عدم الضياع [cite: 3, 9]
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lady_fitness');
    return saved ? JSON.parse(saved) : {};
  });

  // القوائم العشر المخصصة للرشاقة (كل قائمة تضم 7 مدخلات)
  const sections = [
    { title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "كتلة الجسم BMI", "نسبة العضلات", "ملاحظات التطور"] },
    { title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات المحروقة", "مستوى الشدة", "وقت التمرين", "ملاحظات الأداء"] },
    { title: "التغذية الصحية", emoji: "🥗", fields: ["عدد السعرات", "كمية البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "عدد الوجبات", "جودة الأكل"] },
    { title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء (لتر)", "مواعيد الشرب", "المشروبات العشبية", "مشروبات الديتوكس", "مستوى الترطيب", "تجنب السكريات", "ملاحظات"] },
    { title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "وقت الاستيقاظ", "جودة النوم", "وقت الاسترخاء", "تجنب الكافيين", "القيلولة", "مستوى الطاقة"] },
    { title: "الصحة النفسية", emoji: "🧠", fields: ["مستوى التوتر", "تمارين التنفس", "الحالة المزاجية", "الدافعية اليومية", "التأمل", "عادات إيجابية", "تحديات نفسية"] },
    { title: "المكملات والجمال", emoji: "✨", fields: ["فيتامينات الرشاقة", "صحة الجلد", "صحة الشعر", "الكولاجين", "معدل الحرق", "أوميجا 3", "ملاحظات طبية"] },
    { title: "التحديات الأسبوعية", emoji: "🏆", fields: ["تحدي السكر", "تحدي الحركة", "الالتزام بالخطة", "أصعب عقبة", "إنجاز الأسبوع", "خطة الأسبوع القادم", "ملاحظات"] },
    { title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "أعراض الرغبة بالأكل", "احتباس السوائل", "تغير الوزن الهرموني", "نوع الرياضة المناسب", "ألم الجسم", "الحالة العامة"] },
    { title: "العادات اليومية", emoji: "✅", fields: ["الاستيقاظ مبكراً", "الصيام المتقطع", "الجلوس الصحي", "التعرض للشمس", "الحركة المكتبية", "مضغ الطعام جيداً", "ملاحظات إضافية"] }
  ];

  const handleInputChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    localStorage.setItem('lady_fitness', JSON.stringify(newData)); [cite_start]// [cite: 9]
  };

  return (
    <div style={styles.container}>
      {/* الرأس - Header */}
      <div style={styles.header}>
        <Icon size={32} color="#9c27b0" />
        <h2 style={styles.title}>متابعة الرشاقة والجمال</h2>
      </div>

      {/* القوائم - Accordion Sections */}
      <div style={styles.scrollArea}>
        {sections.map((sec, i) => (
          <div key={i} style={{
            ...styles.sectionCard,
            borderLeft: openIdx === i ? '5px solid #9c27b0' : '5px solid transparent'
          }}>
            <div 
              style={styles.sectionHeader} 
              [cite_start]onClick={() => setOpenIdx(openIdx === i ? null : i)} // [cite: 6]
            >
              <div style={styles.sectionLabel}>
                <span style={styles.emoji}>{sec.emoji}</span>
                <span style={styles.sectionTitle}>{sec.title}</span>
              </div>
              <span style={styles.arrow}>{openIdx === i ? '▲' : '▼'}</span>
            </div>

            {/* الحقول - Input Fields */}
            {openIdx === i && (
              <div style={styles.gridContainer}>
                {sec.fields.map(field => (
                  <div key={field} style={styles.inputWrapper}>
                    <label style={styles.label}>{field}</label>
                    <input 
                      style={styles.input} 
                      placeholder="..."
                      [cite_start]value={data[field] || ''} // [cite: 7, 8]
                      onChange={(e) => handleInputChange(field, e.target.value)}
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

// التنسيق المبهر - Professional CSS-in-JS
const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    padding: '25px',
    border: '1px solid rgba(255,255,255,0.4)',
    maxWidth: '600px',
    margin: '20px auto',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    direction: 'rtl'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(156, 39, 176, 0.2)'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#4a148c',
    fontWeight: '800'
  },
  scrollArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionCard: {
    background: 'rgba(255,255,255,0.4)',
    borderRadius: '18px',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
  },
  sectionHeader: {
    padding: '18px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.3)'
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  emoji: {
    fontSize: '1.4rem'
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#6a1b9a',
    fontSize: '1rem'
  },
  arrow: {
    fontSize: '0.8rem',
    color: '#9c27b0'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '15px',
    background: 'rgba(255,255,255,0.2)'
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.75rem',
    color: '#7b1fa2',
    paddingRight: '5px',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(156, 39, 176, 0.1)',
    background: 'white',
    outline: 'none',
    fontSize: '0.9rem',
    transition: 'border 0.3s',
    boxSizing: 'border-box'
  }
};

export default FitnessMonitor;
