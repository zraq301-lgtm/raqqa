import React from 'react';

const SportsPage = () => {
  const sports = [
    { id: 1, name: "كرة القدم", icon: "⚽", desc: "اللعبة الأكثر شعبية في العالم التي تعزز العمل الجماعي." },
    { id: 2, name: "السباحة", icon: "🏊", desc: "رياضة مثالية لتقوية العضلات وتحسين التنفس." },
    { id: 3, name: "الجري", icon: "🏃", desc: "تساعد في حرق السعرات الحرارية وتحسين صحة القلب." },
    { id: 4, name: "كرة السلة", icon: "🏀", desc: "تزيد من الرشاقة والسرعة والتركيز." },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      
      {/* القسم الرئيسي (Hero Section) */}
      <header style={{ 
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1461896756985-21465c401f17?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")', 
        backgroundSize: 'cover', 
        height: '400px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>عالم الرياضة</h1>
        <p style={{ fontSize: '1.2rem' }}>الرياضة ليست مجرد لعبة، بل هي أسلوب حياة لصحة أفضل.</p>
      </header>

      {/* قسم الفوائد */}
      <section style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#E91E63', marginBottom: '30px' }}>لماذا نمارس الرياضة؟</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {sports.map(sport => (
            <div key={sport.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '15px', 
              padding: '20px', 
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: '0.3s'
            }}>
              <div style={{ fontSize: '3rem' }}>{sport.icon}</div>
              <h3 style={{ color: '#007bff' }}>{sport.name}</h3>
              <p>{sport.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* نصيحة اليوم */}
      <section style={{ background: '#f8f9fa', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '10px', borderRight: '5px solid #28a745' }}>
          <h3 style={{ color: '#28a745' }}>💡 نصيحة رياضية</h3>
          <p>"ابدأ بـ 15 دقيقة يومياً من النشاط البدني، ومع الوقت ستصبح الرياضة جزءاً لا يتجزأ من يومك."</p>
        </div>
      </section>

      {/* تذييل الصفحة */}
      <footer style={{ background: '#333', color: '#fff', padding: '20px', textAlign: 'center', marginTop: '50px' }}>
        <p>حقوق النشر © 2024 - منصة رياضة وأمان</p>
      </footer>
    </div>
  );
};

export default SportsPage;
