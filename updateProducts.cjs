const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmitadToNeon() {
  // القيم المستخرجة من الكود الخاص بك لضمان الدقة
  const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
  
  // تشفير القيم برمجياً لضمان عدم وجود أخطاء في الـ Base64 اليدوي
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    console.log('🔄 جاري بدء الاتصال بـ Admitad API...');

    const authResponse = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      // أضفنا الـ client_id في الجسم (body) كخطوة احتياطية لضمان التعرف عليه
      body: `grant_type=client_credentials&scope=public_data products advcampaigns&client_id=${clientId}`
    });
    
    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      console.error('❌ الرد من السيرفر:', authData);
      process.exit(1);
    }

    console.log('✅ تم الحصول على التوكن! جاري جلب العروض...');

    // جلب العروض
    const productsResponse = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    
    const productsData = await productsResponse.json();
    const offers = productsData.results || [];

    console.log(`📦 جلب ${offers.length} عرض.`);

    // التحديث في نيون
    for (const item of offers) {
      await prisma.product.upsert({
        where: { admitadId: item.id.toString() },
        update: {
          name: item.name,
          url: item.goto_link,
          image: item.logo,
          updatedAt: new Date(),
        },
        create: {
          admitadId: item.id.toString(),
          name: item.name,
          url: item.goto_link,
          image: item.logo,
          price: "عرض خاص",
        },
      });
    }

    console.log('✨ نجاح! تم تحديث نيون.');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmitadToNeon();
