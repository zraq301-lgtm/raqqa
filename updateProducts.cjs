const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmitadToNeon() {
  const base64Credentials = process.env.ADMITAD_BASE64;
  // ملاحظة: Prisma ستقرأ POSTGRES_PRISMA_URL تلقائياً من البيئة

  try {
    console.log('1️⃣ جاري جلب التوكن من Admitad...');
    const authResponse = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products'
    });
    const authData = await authResponse.json();
    if (!authData.access_token) throw new Error('فشل الحصول على التوكن');

    console.log('2️⃣ جاري جلب المنتجات من AliExpress...');
    const response = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await response.json();

    console.log('3️⃣ تحديث قاعدة بيانات نيون عبر Prisma...');
    
    // استخدام Prisma لعمل Upsert (إضافة إذا لم يوجد، وتحديث إذا وجد)
    for (const item of data.results) {
      await prisma.product.upsert({
        where: { admitadId: item.id.toString() },
        update: {
          name: item.name,
          url: item.goto_link,
          image: item.logo,
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

    console.log('✅ تم تحديث المنتجات في نيون بنجاح!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmitadToNeon();
