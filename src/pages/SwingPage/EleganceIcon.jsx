import React, { useEffect, useState } from 'react';

// === وصف التصميم (Theme Description) ===
// ألوان باستيل ناعمة: وردي هادئ (#ffd1dc)، بنفسجي لافندر (#e0bbfd)، أبيض كريمي (#fefae0)
// تصميمGlassmorphism: خلفيات شفافة ومموهة تعطي إحساساً بالحداثة والنقاء (الرقة).
// خطوط عربية ناعمة (يفضل إضافة خط Cairo أو Tajawal لمشروعك).

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === رابط الـ API الخاص بموقعك في وردبرس ===
  // تأكد أن الاسم "raqqa-stor" هو الصحيح في لوحة تحكم وردبرس
  const API_URL = "https://public-api.wordpress.com/rest/v1.1/sites/raqqa-stor.wordpress.com/posts";

  useEffect(() => {
    // جلب البيانات من وردبرس
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("لم نتمكن من الاتصال بمتجر وردبرس حالياً.");
        return res.json();
      })
      .then(data => {
        // ترتيب المنتجات الأحدث أولاً
        setProducts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // --- واجهة التحميل ---
  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loaderSpinner}></div>
        <p style={styles.loaderText}>جاري تحميل أرقى الملابس المحتشمة من رقة...</p>
      </div>
    );
  }

  // --- واجهة الخطأ ---
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>عذراً! {error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>حاولي مرة أخرى</button>
      </div>
    );
  }

  // --- واجهة العرض الأساسية ---
  return (
    <div className="roqa-store-container" style={styles.container}>
      <h2 style={styles.pageTitle}>متجر رقة للأناقة المحتشمة</h2>
      <p style={styles.pageSubtitle}>فساتين، عبايات، وفساتين خروج - اختاري ما يناسب رقتك</p>

      {/* شبكة المنتجات (Products Grid) */}
      <div style={styles.productGrid}>
        {products.map(product => {
          // --- كود سحري لاستخراج رابط "تاجر" من داخل نص المقال ---
          const parser = new DOMParser();
          const doc = parser.parseFromString(product.content, 'text/html');
          const taagerLink = doc.querySelector('a')?.href || product.URL;

          return (
            <div key={product.ID} className="product-card glass-morphism" style={styles.productCard}>
              {/* الصورة البارزة (Featured Image) */}
              <div style={styles.imageWrapper}>
                <img 
                  src={product.featured_image || 'https://via.placeholder.com/300x400.png?text=Roqa+Fashion'} 
                  alt={product.title} 
                  style={styles.productImage} 
                />
              </div>
              
              {/* تفاصيل المنتج (Product Details) */}
              <div style={styles.cardDetails}>
                <h3 style={styles.productTitle}>{product.title}</h3>
                
                {/* الزر الناعم المخصص للمحجبات (Button) */}
                <button 
                  onClick={() => window.open(taagerLink, '_blank')}
                  style={styles.orderButton}
                  className="hover-scale"
                >
                  اطلبي الآن عبر رقة
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// === كود CSS المدمج (Inlined Style Objects) ===
const styles = {
  // الحاوية الأساسية
  container: {
    fontFamily: "'Cairo', 'Tajawal', sans-serif", // يفضل إضافة خط Cairo لمشروعك
    padding: '30px 20px',
    backgroundColor: '#fefae0', // لون باستيل كريمي ناعم للخلفية
    minHeight: '100vh',
    direction: 'rtl', // عرض النصوص من اليمين لليسار
  },
  
  // العناوين
  pageTitle: {
    color: '#b19cd9', // لون باستيل بنفسجي لافندر ناعم
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '2rem',
    fontWeight: '700',
  },
  pageSubtitle: {
    color: '#8c8c8c',
    textAlign: 'center',
    marginBottom: '40px',
    fontSize: '1rem',
    fontWeight: '400',
  },
  
  // الشبكة (Grid)
  productGrid: {
    display: 'grid',
    // تجاوب تلقائي: قطعة واحدة في الموبايل، و3 في الشاشات الكبيرة
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  // بطاقة المنتج (Product Card) - تصميم Glassmorphism ناعم
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // أبيض شفاف
    backdropFilter: 'blur(12px)', // تمويه خلفي ناعم
    borderRadius: '20px', // حواف دائرية ناعمة جداً
    overflow: 'hidden', // لمنع الصور من الخروج عن الحواف
    border: '1px solid rgba(255, 255, 255, 0.5)', // تحديد زجاجي خفيف
    transition: 'transform 0.3s ease', // تأثير ناعم عند التحويم
    boxShadow: '0 8px 32px 0 rgba(177, 156, 217, 0.15)', // ظل باستيل خفيف جداً
  },
  
  // غلاف الصورة
  imageWrapper: {
    width: '100%',
    height: '350px', // ارتفاع ثابت للصور لتوحيد البطاقات
    overflow: 'hidden',
  },
  
  // الصورة
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // لمنع تمطيط الصور وتغطية المساحة
    transition: 'transform 0.5s ease',
  },
  
  // تفاصيل البطاقة
  cardDetails: {
    padding: '15px 20px',
    textAlign: 'center',
  },
  
  // عنوان المنتج
  productTitle: {
    color: '#5d5d5d', // لون رمادي ناعم
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '15px',
    height: '1.4em', // لتوحيد ارتفاع العناوين
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  
  // زر "اطلبي الآن" - لون باستيل وردي ناعم
  orderButton: {
    backgroundColor: '#ffd1dc', // لون باستيل وردي هادئ
    color: '#fff', // أبيض كريمي للنص
    border: 'none',
    padding: '12px 30px',
    borderRadius: '25px', // حواف دائرية كاملة
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    width: '100%',
    boxShadow: '0 4px 15px rgba(255, 209, 220, 0.4)',
  },

  // --- واجهة التحميل والخطأ ---
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    color: '#b19cd9',
  },
  loaderSpinner: {
    border: '4px solid #fefae0',
    borderTop: '4px solid #b19cd9',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  loaderText: {
    marginTop: '20px',
    fontSize: '1.1rem',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '50px',
    color: '#ff6b6b',
  },
  errorText: {
    fontSize: '1.2rem',
    marginBottom: '20px',
  },
  retryButton: {
    backgroundColor: '#ffd1dc',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '15px',
    color: '#fff',
    cursor: 'pointer',
  }
};

// === إضافة الـ Keyframes للـ CSS (يفضل وضعها في ملف CSS خارجي) ===
// (لمزيد من الرقة، يمكنك إضافة هذا الكود لملف index.css الأساسي)
/*
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.product-card:hover {
  transform: translateY(-5px); // تأثير الرفع عند التحويم
}

.product-card:hover img {
  transform: scale(1.05); // تأثير التكبير الهادئ للصورة
}

.hover-scale:hover {
  background-color: #fca5bb !important; // لون باستيل أغمق قليلاً عند التحويم
  transform: scale(1.02); // تكبير الزر قليلاً
}
*/

export default RoqaStore;
