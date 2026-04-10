import React, { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, Sparkles, Tag, Percent, Loader2 } from 'lucide-react';

// ملاحظة: تم حذف import { allProducts } لحل مشكلة فشل البناء في GitHub
// الاعتماد الآن كلياً على الجلب من وردبريس

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // جلب البيانات من رابط الـ API الخاص بوردبريس
        const response = await fetch('https://raqqastor3.wordpress.com/wp-json/raqqa/v1/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("خطأ في جلب المنتجات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const styles = {
    container: {
      backgroundColor: '#fff9fb',
      minHeight: '100vh',
      padding: '20px 15px',
      direction: 'rtl',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '12px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #ffe4e9',
      boxShadow: '0 4px 10px rgba(255, 182, 193, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      paddingBottom: '100%',
      backgroundColor: '#fdfdfd'
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '8px'
    },
    content: {
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    title: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '6px',
      height: '34px',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    },
    priceTag: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#fff1f2',
      color: '#e11d48',
      padding: '3px 6px',
      borderRadius: '6px',
      fontWeight: 'bold',
      fontSize: '13px',
      gap: '3px'
    },
    button: {
      marginTop: '10px',
      backgroundColor: '#1f2937',
      color: 'white',
      textDecoration: 'none',
      textAlign: 'center',
      padding: '8px',
      borderRadius: '8px',
      fontSize: '11px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px'
    },
    loader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      color: '#fb7185'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <Loader2 className="animate-spin" size={32} />
          <p style={{marginTop: '12px', fontSize: '14px'}}>تحميل منتجات رقة...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827' }}>
          مختارات <span style={{ color: '#fb7185' }}>رقة</span>
        </h1>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
          <Sparkles style={{ width: '12px', height: '12px', color: '#fbbf24', display: 'inline', marginLeft: '4px' }} />
          منتجات عصرية بجودة عالية
        </p>
      </header>

      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product.id} style={styles.card}>
            <div style={styles.imageWrapper}>
              <img src={product.image} alt={product.name} style={styles.image} />
            </div>
            <div style={styles.content}>
              <h2 style={styles.title}>{product.name}</h2>
              <div style={styles.priceTag}>
                <Tag size={10} />
                {product.price}
              </div>
              <a href={product.url} target="_blank" rel="noopener noreferrer" style={styles.button}>
                تسوّقي الآن
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
