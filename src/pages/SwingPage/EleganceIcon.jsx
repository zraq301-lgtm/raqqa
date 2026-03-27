import React from 'react';

const FashionPage = () => {
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      color: '#333',
      backgroundColor: '#fdfdfd',
      margin: 0,
      padding: 0,
      direction: 'rtl', // لدعم اللغة العربية
    },
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 5%',
      borderBottom: '1px solid #eee',
      backgroundColor: '#fff',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    hero: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1350&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      textAlign: 'center',
    },
    heroContent: {
      maxWidth: '600px',
    },
    button: {
      padding: '12px 30px',
      fontSize: '16px',
      backgroundColor: '#fff',
      color: '#000',
      border: 'none',
      cursor: 'pointer',
      marginTop: '20px',
      transition: '0.3s',
      fontWeight: '600',
    },
    section: {
      padding: '60px 5%',
      textAlign: 'center',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '40px',
    },
    card: {
      position: 'relative',
      overflow: 'hidden',
      height: '400px',
      backgroundColor: '#eee',
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>ÉLÉGANCE</div>
        <ul style={{ display: 'flex', listStyle: 'none', gap: '20px' }}>
          <li>المجموعات</li>
          <li>صيحات 2026</li>
          <li>من نحن</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>فن الأناقة الأبدية</h1>
          <p>اكتشفوا تشكيلة الربيع الجديدة التي تجمع بين الكلاسيكية والحداثة.</p>
          <button 
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = '#eee'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
          >
            تسوق الآن
          </button>
        </div>
      </header>

      {/* Featured Collections */}
      <section style={styles.section}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>المجموعات المميزة</h2>
        <div style={{ width: '50px', height: '2px', background: '#000', margin: '0 auto' }}></div>
        
        <div style={styles.grid}>
          <div style={styles.card}>
            <img src="https://images.unsplash.com/photo-1485230895905-ec17ba36b5bc?auto=format&fit=crop&w=500&q=80" alt="Fashion 1" style={styles.cardImage} />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#fff' }}>ملابس شتوية</div>
          </div>
          <div style={styles.card}>
            <img src="https://images.unsplash.com/photo-1539109132304-392531ecdddd?auto=format&fit=crop&w=500&q=80" alt="Fashion 2" style={styles.cardImage} />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#fff' }}>أزياء عصرية</div>
          </div>
          <div style={styles.card}>
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80" alt="Fashion 3" style={styles.cardImage} />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#fff' }}>إكسسوارات</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid #eee', fontSize: '14px', color: '#888' }}>
        © 2026 جميع الحقوق محفوظة لـ ÉLÉGANCE
      </footer>
    </div>
  );
};

export default FashionPage;
