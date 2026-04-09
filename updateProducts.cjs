// updateProducts.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmitadToNeon() {
  // القيمة التي زودتني بها مباشرة
  const base64Credentials = "V25abktiYmlmOTdYYXhjcWFKTVROdXBYb1BNY3RLOkU5MlhrUkJzR2xHR1JwdEtnV3hZNUdCNkpmUkRQNA==";

  try {
    console.log('🔄 جاري بدء الاتصال بـ Admitad API...');

    // 1. طلب توكن الوصول (Access Token)
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
      console.error('❌ فشل الحصول على التوكن. الرد من السيرفر:', authData);
      process.exit(1);
    }

    console.log('✅ تم الحصول على التوكن بنجاح. جاري جلب العروض...');

    // 2. جلب العروض النشطة (Active Campaigns)
    const productsResponse = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    
    const productsData = await productsResponse.json();
    const offers = productsData.results || [];

    console.log(`📦 تم العثور على ${offers.length} عرض/منتج.`);

    // 3. تحديث قاعدة بيانات Neon عبر Prisma
    console.log('⏳ جاري تحديث قاعدة البيانات...');

    for (const item of offers) {
      await prisma.product.upsert({
        where: { 
          admitadId: item.id.toString() 
        },
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

    console.log('✨ نجاح! تم تحديث جميع البيانات في نيون بنجاح.');

  } catch (error) {
    console.error('❌ خطأ غير متوقع:', error.message);
    process.exit(1);
  } finally {
    // إغلاق الاتصال لضمان عدم تعليق السكربت
    await prisma.$disconnect();
  }
}

// تشغيل السكربت
updateAdmitadToNeon();
