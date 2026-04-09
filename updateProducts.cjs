const fs = require('fs');
const path = require('path');

async function updateProducts() {
  const base64Credentials = process.env.ADMITAD_BASE64;
  
  if (!base64Credentials) {
    console.error('❌ خطأ: لم يتم العثور على ADMITAD_BASE64 في GitHub Secrets');
    process.exit(1);
  }

  try {
    console.log('1️⃣ جاري طلب التوكن من Admitad...');
    const authResponse = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });
    
    const authData = await authResponse.json();
    if (!authData.access_token) {
      console.error('❌ فشل التحقق:', authData);
      process.exit(1);
    }

    console.log('2️⃣ تم الحصول على التوكن، جاري جلب العروض...');

    // سنستخدم رابط الـ Offers لجلب المنتجات إذا كان الـ Feed لا يعمل
    const response = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await response.json();

    // تنسيق البيانات (تعديل الحقول لتناسب ما يرسله Admitad)
    const formattedProducts = (data.results || []).map(item => ({
      id: item.id || Math.random().toString(36).substring(7),
      name: item.name || 'عرض جديد من رقة',
      url: item.site_url || item.goto_link || '#',
      image: item.logo || 'https://placehold.co/400x400?text=Roqa+Product',
      price: "عرض خاص", // API الحملات أحياناً لا يعطي سعراً ثابتاً
      oldPrice: "",
      discount: "تخفيض"
    }));

    const fileContent = `export const allProducts = ${JSON.stringify(formattedProducts, null, 2)};`;
    
    const dir = './src';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.writeFileSync(path.join(dir, 'productsData.js'), fileContent);
    console.log(`✅ نجاح! تم تحديث ${formattedProducts.length} منتج.`);

  } catch (error) {
    console.error('❌ خطأ غير متوقع:', error.message);
    process.exit(1);
  }
}

updateProducts();
