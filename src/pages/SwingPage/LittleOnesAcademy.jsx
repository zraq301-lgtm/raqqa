import React, { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, Sparkles, Tag, Percent, Loader2 } from 'lucide-react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // معرف التصنيف الخاص بالمنتجات (Category ID)
  const CATEGORY_ID = "5460884"; 
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed`;

  // منطق معالجة المحتوى المستوحى من كود الأمومة لجلب روابط الأفلييت والصور
  const parseProductData = (post) => {
    const htmlContent = post.content.rendered;
    
    // استخراج أول رابط يظهر (رابط الأفلييت)
    const urlMatch = htmlContent.match(/href="(https?:\/\/[^"]+)"/);
    const productUrl = urlMatch ? urlMatch[1] : "#";

    // استخراج السعر (نبحث عن أرقام بجانبها كلمة ريال أو $)
    const priceMatch = htmlContent.match(/(\d+\.?\d*)\s*(?:ريال|\$|EGP)/);
    const price = priceMatch ? priceMatch[0] : "عرض السعر";

    // جلب الصورة المميزة أو أول صورة في المحتوى
    const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const contentImgMatch = htmlContent.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))"/);
    const productImage = featuredImg || (contentImgMatch ? contentImgMatch[1] : "https://via.placeholder.com/300");

    return {
      id: post.id,
      name: post.title.rendered,
      url: productUrl,
      image: productImage,
      price: price,
      discount: "عرض خاص" // يمكن تخصيصه لاحقاً
    };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const formattedProducts = data.map(post => parseProductData(post));
        setProducts(formattedProducts);
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '15px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid #ffe4e9',
      boxShadow: '0 10px 25px -5px rgba(255, 182, 193, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease'
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      paddingBottom: '100%',
      backgroundColor: '#f8f8f8'
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '12px'
    },
    content: {
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    title: {
      fontSize: '13px',
      fontWeight: '700',
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
    button: {
      marginTop: '12px',
      backgroundColor: '#1f2937',
      color: 'white',
      textDecoration: 'none',
      textAlign: 'center',
      padding: '10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fff9fb' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ color: '#fb7185', animation: 'spin 1s linear infinite' }} size={40} />
          <p style={{ color: '#fb7185', marginTop: '10px', fontWeight: 'bold' }}>جاري تحميل متجر رقة...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* هيدر المتجر */}
      <header style={{ textAlign: 'center', marginBottom: '30px', paddingTop: '10px' }}>
        <div style={{ backgroundColor: 'white', display: 'inline-block', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <ShoppingBag style={{ color: '#fb7185' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1f2937', marginTop: '10px' }}>
          مختارات <span style={{ color: '#fb7185' }}>رقة</span>
        </h1>
      </header>

      {/* الشبكة */}
      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product.id} style={styles.card} className="hover-effect">
            <div style={styles.imageWrapper}>
              <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#fb7185', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', zIndex: 1 }}>
                <Percent size={10} style={{ display: 'inline', marginLeft: '2px' }} />
                {product.discount}
              </div>
              <img src={product.image} alt={product.name} style={styles.image} />
            </div>

            <div style={styles.content}>
              <h2 style={styles.title} dangerouslySetInnerHTML={{ __html: product.name }} />
              
              <div style={styles.priceTag}>
                <Tag size={12} />
                {product.price}
              </div>

              <a href={product.url} target="_blank" rel="noopener noreferrer" style={styles.button}>
                تسوّقي الآن
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hover-effect:hover { transform: translateY(-5px); }
      `}</style>
    </div>
  );
};

export default RoqaStore;
