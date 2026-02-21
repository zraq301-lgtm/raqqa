import React from 'react';
import { Heart, Baby, Sparkles, Star } from 'lucide-react';

const MotherhoodHaven = () => {
  return (
    <div style={{ 
      direction: 'rtl', 
      padding: '20px', 
      backgroundColor: '#fff9fb', 
      minHeight: '100vh',
      animation: 'fadeIn 0.5s ease-in'
    }}>
      {/* الهيدر الخاص بالقسم */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        padding: '20px', 
        boxShadow: '0 4px 15px rgba(216, 27, 96, 0.08)',
        marginBottom: '20px',
        borderRight: '6px solid #D81B60'
      }}>
        <h1 style={{ 
          color: '#D81B60', 
          fontSize: '22px', 
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: 0
        }}>
          <Baby size={28} />
          ملاذ الأمومة
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>
          مساحتكِ الدافئة لمشاركة رحلة الأمومة بكل تفاصيلها.
        </p>
      </div>

      {/* محتوى تجريبي: بطاقة نصيحة */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '15px', 
        padding: '15px', 
        marginBottom: '15px',
        border: '1px solid #fce4ec'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Star size={18} color="#FFD700" fill="#FFD700" />
          <span style={{ fontWeight: 'bold', color: '#333' }}>نصيحة اليوم للأم الجديدة</span>
        </div>
        <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
          تذكري أن العناية بنفسكِ ليست أنانية، بل هي ضرورة لتتمكني من العناية بطفلكِ. خذي قسطاً من الراحة كلما أتيحت لكِ الفرصة.
        </p>
      </div>

      {/* بطاقة تفاعلية */}
      <div style={{ 
        background: 'linear-gradient(135deg, #D81B60 0%, #f06292 100%)', 
        borderRadius: '15px', 
        padding: '20px', 
        color: '#fff',
        textAlign: 'center'
      }}>
        <Sparkles size={30} style={{ marginBottom: '10px' }} />
        <h3 style={{ margin: '0 0 10px 0' }}>هل لديكِ سؤال؟</h3>
        <p style={{ fontSize: '14px', opacity: '0.9' }}>
          يمكنكِ دائماً استخدام أيقونة "رقة الذكية" في الأعلى للحصول على استشارات فورية حول صحة طفلكِ وتغذيته.
        </p>
      </div>

      {/* زر العودة للرئيسية */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: 'none',
            border: '1px solid #D81B60',
            color: '#D81B60',
            padding: '10px 25px',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
};

export default MotherhoodHaven;
