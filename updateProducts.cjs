const fs = require('fs');

async function updateProducts() {
  const base64Credentials = process.env.ADMITAD_BASE64;
  
  try {
    console.log('--- جاري الاتصال بـ Admitad API ---');
    
    // 1. الحصول على Access Token
    const authResponse = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products'
    });
    
    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      throw new Error('فشل في الحصول على التوكن: ' + JSON.stringify(authData));
    }

    const token = authData.access_token;
    console.log('✅ تم الحصول على التوكن');

    // 2. جلب المنتجات
    const productsResponse = await fetch('https://api.admitad.com/product_feeds/details/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productsData = await productsResponse.json();

    // 3. تنسيق البيانات لتناسب تطبيق "رقة"
    const rawProducts = productsData.results || [];
    const formattedProducts = rawProducts.slice(0, 20).map(p => ({
      id: p.id || Math.random().toString(36).substr(2, 9),
      name: p.name || 'منتج رقة المميز',
      url: p.url || '#',
      image: p.image || '',
      price: p.price || '0.00',
      oldPrice: p.old_price || '',
      discount: p.discount || "خصم مميز"
    }));

    // 4. كتابة الملف في مساره الصحيح
    const fileContent = `export const allProducts = ${JSON.stringify(formattedProducts, null, 2)};`;
    
    // تأكد أن المجلد src موجود في مستودعك
    fs.writeFileSync('./src/productsData.js', fileContent);
    
    console.log(`✅ تم تحديث ${formattedProducts.length} منتج بنجاح!`);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

updateProducts();
