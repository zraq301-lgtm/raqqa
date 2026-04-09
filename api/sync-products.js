import postgres from 'postgres';

export default async function handler(req, res) {
  // 1. إعداد الاتصال بقاعدة بيانات نيون
  // نستخدم رابط POSTGRES_PRISMA_URL الموجود في إعدادات فيرسل لديك
  const sql = postgres(process.env.POSTGRES_PRISMA_URL, { ssl: 'require' });

  // 2. بيانات Admitad (المستخرجة من القيمة التي أرسلتها سابقاً)
  const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    console.log('🔄 جاري بدء عملية المزامنة...');

    // 3. طلب توكن الوصول من Admitad
    const authResponse = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });

    const authData = await authResponse.json();

    if (!authData.access_token) {
      return res.status(401).json({ 
        success: false, 
        message: 'فشل التحقق من هوية Admitad', 
        details: authData 
      });
    }

    // 4. جلب العروض النشطة (أول 20 عرض كمثال)
    const productsResponse = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });

    const productsData = await productsResponse.json();
    const offers = productsData.results || [];

    // 5. تحديث قاعدة البيانات (SQL Upsert)
    // سيقوم الكود بإضافة المنتج الجديد أو تحديث الحالي إذا كان موجوداً مسبقاً
    for (const item of offers) {
      await sql`
        INSERT INTO "Product" (
          "admitadId", 
          "name", 
          "url", 
          "image", 
          "price", 
          "updatedAt"
        )
        VALUES (
          ${item.id.toString()}, 
          ${item.name}, 
          ${item.goto_link}, 
          ${item.logo}, 
          'عرض خاص', 
          NOW()
        )
        ON CONFLICT ("admitadId") 
        DO UPDATE SET 
          "name" = EXCLUDED."name",
          "url" = EXCLUDED."url",
          "image" = EXCLUDED."image",
          "updatedAt" = NOW()
      `;
    }

    // 6. إرجاع نتيجة العملية
    return res.status(200).json({
      success: true,
      message: `تمت المزامنة بنجاح. تم تحديث/إضافة ${offers.length} منتج.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ خطأ أثناء المزامنة:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
