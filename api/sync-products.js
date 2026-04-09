import postgres from 'postgres';

export const config = {
  maxDuration: 60, // زيادة وقت التشغيل لضمان عدم الانقطاع
};

export default async function handler(req, res) {
  const dbUrl = process.env.POSTGRES_PRISMA_URL;
  
  if (!dbUrl) {
    return res.status(500).json({ success: false, error: "Database URL missing in Vercel settings" });
  }

  // استخدام الاتصال المباشر
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
    const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // جلب التوكن
    const authRes = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });
    
    const authData = await authRes.json();
    if (!authData.access_token) throw new Error('Auth failed');

    // جلب المنتجات
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // التحديث في نيون
    for (const item of offers) {
      await sql`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES (${item.id.toString()}, ${item.name}, ${item.goto_link}, ${item.logo}, 'عرض خاص', NOW())
        ON CONFLICT ("admitadId") DO UPDATE SET 
        "name" = EXCLUDED."name", "url" = EXCLUDED."url", "image" = EXCLUDED."image", "updatedAt" = NOW()
      `;
    }

    return res.status(200).json({ success: true, count: offers.length });
  } catch (error) {
    // سيظهر لك سبب الخطأ الحقيقي في المتصفح الآن
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    // تأكد من إغلاق الاتصال بعد الانتهاء
    await sql.end();
  }
}
