import fs from 'fs';
import fetch from 'node-fetch'; // تأكد من وجود هذه المكتبة أو سنستخدم fetch المدمجة في نود 18

async function updateProducts() {
  const base64Credentials = process.env.ADMITAD_BASE64;
  
  try {
    console.log('--- بدء الاتصال بـ Admitad API ---');
    
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
    console.log('✅ تم الحصول على التوكن بنجاح');

    // 2. جلب المنتجات (تأكد من تعديل الرابط حسب حاجتك)
    const productsResponse = await fetch('https://api.admitad.com/product_feeds/details/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productsData = await productsResponse.json();

    // 3. تحويل البيانات لتناسب واجهة تطبيق "رقة"
    // ملاحظة: تأكد من مراجعة أسماء الحقول التي تعود من API أدميتاد
    const rawProducts = productsData.results || [];
    const formattedProducts = rawProducts.slice(0, 20).map(p => ({
      id: p.id || Math.random().toString(),
      name: p.name || 'منتج رقة',
      url: p.url || '#',
      image: p.image || '',
      price: p.price || '0',
      oldPrice: p.old_price || '',
      discount: p.discount || "0%"
    }));

    // 4. كتابة الملف بتنسيق ES Module
    const fileContent = `export const allProducts = ${JSON.stringify(formattedProducts, null, 2)};`;
    
    // تأكد من المسار الصحيح (إذا كان الملف في src)
    fs.writeFileSync('./src/productsData.js', fileContent);
    
    console.log(`✅ تم تحديث ${formattedProducts.length} منتج بنجاح في src/productsData.js`);
  } catch (error) {
    console.error('❌ خطأ في التحديث:', error.message);
    process.exit(1);
  }
}

updateProducts();
