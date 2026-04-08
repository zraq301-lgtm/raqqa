import React from 'react';
import { ShoppingBag, ExternalLink, Sparkles, Tag, Percent } from 'lucide-react';
import { allProducts } from './productsData';

const RoqaStore = () => {
  // تنسيقات مدمجة لضمان ثبات الشكل
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', // ضبط تلقائي للأعمدة
      gap: '15px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #ffe4e9',
      boxShadow: '0 4px 12px rgba(255, 182, 193, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s',
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      paddingBottom: '100%', // لجعل الصورة مربعة تماماً
      overflow: 'hidden',
      backgroundColor: '#f8f8f8'
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain', // يضمن ظهور المنتج كاملاً دون قص
      padding: '10px' // مساحة بيضاء حول المنتج لجمالية أكثر
    },
    content: {
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    title: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px',
      lineHeight: '1.4',
      height: '36px',
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
      padding: '4px 8px',
      borderRadius: '8px',
      fontWeight: '800',
      fontSize: '14px',
      gap: '4px'
    },
    oldPrice: {
      fontSize: '11px',
      color: '#9ca3af',
      textDecoration: 'line-through',
      marginRight: '8px'
    },
    button: {
      marginTop: '12px',
      backgroundColor: '#1f2937',
      color: 'white',
      textDecoration: 'none',
      textAlign: 'center',
      padding: '10px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'background 0.3s'
    },
    badge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: '#fb7185',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: 'bold',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: '3px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '50%',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '10px'
        }}>
          <ShoppingBag style={{ color: '#fb7185', width: '24px', height: '24px' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1f2937', margin: 0 }}>
          مختارات <span style={{ color: '#fb7185' }}>رقة</span>
        </h1>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <Sparkles style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
          أجمل المنتجات المختارة لكِ بعناية
        </p>
      </header>

      {/* Grid */}
      <div style={styles.grid}>
        {allProducts.map((product) => (
          <div key={product.id} style={styles.card} className="product-card">
            {/* Image Container */}
            <div style={styles.imageWrapper}>
              {product.discount && (
                <div style={styles.badge}>
                  <Percent size={10} />
                  {product.discount}
                </div>
              )}
              <img 
                src={product.image} 
                alt={product.name} 
                style={styles.image} 
              />
            </div>

            {/* Product Details */}
            <div style={styles.content}>
              <h2 style={styles.title}>{product.name}</h2>
              
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <div style={styles.priceTag}>
                  <Tag size={12} />
                  {product.price}
                </div>
                {product.oldPrice && (
                  <span style={styles.oldPrice}>{product.oldPrice}</span>
                )}
              </div>

              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.button}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fb7185'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
              >
                تسوّقي الآن
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
