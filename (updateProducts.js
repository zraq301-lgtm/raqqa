const fs = require('fs');

async function updateProducts() {
  const base64Credentials = process.env.ADMITAD_BASE64;
  
  try {
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
    const token = authData.access_token;

    // 2. جلب المنتجات (هنا نستخدم API المنتجات)
    // ملاحظة: يمكنك تخصيص الرابط لجلب فئات معينة مثل الموضة المحتشمة
    const productsResponse = await fetch('https://api.admitad.com/product_feeds/details/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productsData = await productsResponse.json();

    // 3. تحويل البيانات لتناسب تنسيق تطبيق "رقة"
    const formattedProducts = productsData.results.slice(0, 20).map(p => ({
      id: p.id,
      name: p.name,
      url: p.url,
      image: p.image,
      price: p.price,
      oldPrice: p.old_price,
      discount: p.discount || "0%"
    }));

    // 4. كتابة الملف الجديد
    const fileContent = `export const allProducts = ${JSON.stringify(formattedProducts, null, 2)};`;
    fs.writeFileSync('./src/productsData.js', fileContent);
    
    console.log('✅ تم تحديث المنتجات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في التحديث:', error);
    process.exit(1);
  }
}

updateProducts();
