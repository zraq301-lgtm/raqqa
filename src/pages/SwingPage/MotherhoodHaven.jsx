import React from 'react';
import { Heart, Baby, Sparkles, BookOpen, Star, Info } from 'lucide-react';

const MotherhoodHaven = () => {
  return (
    <div style={{ 
      direction: 'rtl', 
      padding: '10px 15px 100px', // بادينج سفلي لتجنب تداخل المنيو السفلي
      backgroundColor: 'var(--soft-bg)', // استخدام خلفية وردية هادئة من ملف CSS
      minHeight: '100vh'
    }}>
      {/* رأس الصفحة - الهيدر */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '25px', 
        padding: '20px', 
        boxShadow: '0 10px 25px rgba(255, 77, 125, 0.1)',
        marginBottom: '20px',
        textAlign: 'center',
        border: '1px solid var(--female-pink-light)'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          backgroundColor: 'var(--female-pink-light)', 
          borderRadius: '50%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '0 auto 10px'
        }}>
          <Baby size={32} color="var(--female-pink)" />
        </div>
        <h1 style={{ color: 'var(--female-pink)', fontSize: '24px', margin: '0' }}>ملاذ الأمومة</h1>
        <p style={{ color: '#777', fontSize: '14px', marginTop: '5px' }}>مساحتكِ الدافئة لرحلة أمومة سعيدة</p>
      </div>

      {/* نصيحة سريعة */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        backgroundColor: '#fff', 
        padding: '15px', 
        borderRadius: '20px',
        marginBottom: '20px',
        alignItems: 'center',
        borderRight: '5px solid var(--female-pink)'
      }}>
        <Star color="#FFD700" fill="#FFD700" />
        <p style={{ margin: 0, fontSize: '14px', color: '#444', fontWeight: '500' }}>
          نصيحة اليوم: تذكري أن سعادتكِ هي مفتاح سعادة طفلكِ.
        </p>
      </div>

      {/* شبكة الأقسام الفرعية */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {[
          { title: 'تغذية الرضيع', icon: <Info size={20}/>, desc: 'وصفات وجداول' },
          { title: 'نوم هادئ', icon: <Sparkles size={20}/>, desc: 'روتين النوم' },
          { title: 'دليل الصحة', icon: <Heart size={20}/>, desc: 'تطعيمات وفحوصات' },
          { title: 'ركن القصص', icon: <BookOpen size={20}/>, desc: 'حكايات ما قبل النوم' },
        ].map((item, index) => (
          <div key={index} style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid #eee'
          }}>
            <div style={{ color: 'var(--female-pink)', marginBottom: '8px' }}>{item.icon}</div>
            <h4 style={{ margin: '0', fontSize: '15px', color: '#333' }}>{item.title}</h4>
            <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#999' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* كارت توعوي عريض */}
      <div style={{ 
        marginTop: '20px', 
        background: 'linear-gradient(45deg, var(--female-pink), #ff85a1)', 
        borderRadius: '20px', 
        padding: '20px', 
        color: '#fff' 
      }}>
        <h3 style={{ margin: '0 0 10px' }}>مجتمع الأمهات</h3>
        <p style={{ fontSize: '13px', lineHeight: '1.6', opacity: '0.9' }}>
          انضمي إلى آلاف الأمهات اللواتي يشاركن تجاربهن اليومية. طرحي أسئلتكِ وسيجيب عليها الخبراء وعضوات المنتدى.
        </p>
        <button style={{
          backgroundColor: '#fff',
          color: 'var(--female-pink)',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '25px',
          fontWeight: 'bold',
          marginTop: '10px',
          cursor: 'pointer'
        }}>
          شاركينا الآن
        </button>
      </div>
    </div>
  );
};

// التصدير الافتراضي (Default Export) لضمان عدم ظهور شاشة بيضاء في Swing.jsx
export default MotherhoodHaven;
