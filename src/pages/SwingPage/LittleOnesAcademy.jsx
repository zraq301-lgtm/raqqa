import React, { useState, useEffect } from 'react';
import { XMLParser } from 'fast-xml-parser';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(FEED_URL);
        if (!response.ok) throw new Error('فشل في جلب البيانات');
        
        const xmlText = await response.text();
        
        // تحويل XML/YML إلى JSON
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const jsonObj = parser.parse(xmlText);
        
        // الوصول لمصفوفة المنتجات (تأكد من هيكلة الملف، غالباً تكون داخل offer أو product)
        const items = jsonObj.yml_catalog?.shop?.offers?.offer || [];
        setProducts(Array.isArray(items) ? items : [items]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loader">جاري تحميل المنتجات...</div>;
  if (error) return <div className="error-msg">حدث خطأ: {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>متجر المنتجات المختارة</h1>
        <p>استكشف أفضل العروض المتاحة الآن</p>
      </header>

      <div className="product-grid">
        {products.map((product, index) => (
          <div key={product.id || index} className="product-card">
            <div className="image-container">
              <img src={product.picture} alt={product.name} />
              {product.discount && <span className="badge">خصم</span>}
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="category">{product.categoryId}</p>
              <div className="price-tag">
                <span className="price">{product.price} {product.currencyId}</span>
                {product.oldprice && <span className="old-price">{product.oldprice}</span>}
              </div>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="buy-button">
                تسوق الآن
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
